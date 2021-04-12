/**
 * @file Contains controller class and dialog/callback method for creating a time report from Jira worklog
 */

// Node required code block
const JiraRequest = require('src/jiraApi.gs');
const IssueChangelog = require("src/models/jira/IssueChangelogs.gs");
const getDialog = require("src/dialogs.gs").getDialog;
const debug = require("src/debug.gs").debug;
const unifyIssueAttrib = require('src/jiraCommon.gs').unifyIssueAttrib;
const hasSettings = require("src/settings.gs").hasSettings;
const getCfg_ = require("src/settings.gs").getCfg_;
// End of Node required code block

/**
 * @desc Wrapper: Dialog for time report settings
 */
function menuCreateStatusReport() {
  ChangelogReport_Controller_.dialogOpen();
}

/**
 * @desc Dialog Helper to retrieve list of all available Jira Custom Fields from api.
 * @return {Array}    Array of custom Jira Fields
 */
function callbackFetchAllHistories() {
  var changelogs = [];
  IssueChangelog.getAllChangelogs(
      // ok callback
      function (changelogsUnsorted) {
        changelogs = changelogsUnsorted;
        // sorting by supported type and name
        // customFields.sort(sortCustomFields_);
      },
      // error callback
      function (message) {
        debug.error(message);
      }
  );
  return changelogs;
}

/**
 * @desc Wrapper: Dialog callback handler, generating a new timesheet table
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return void
 */
function callbackCreateStatussheet(jsonFormData) {
  return ChangelogReport_Controller_.createStatussheet(jsonFormData);
}


/**
 * Creates a new IssueTableIndex_ object, which is used to persist IssueTables and related information.
 */
ChangelogReport_Controller_ = {
  name : 'ChangelogReport_Controller_',

  /**
   * @desc Dialog to configure Jira custom fields
   */
  dialogOpen : function () {
    debug.log(this.name + '.dialog()');

    if (!hasSettings(true))
      return;

    var dialog = getDialog('views/dialogs/createStatusReport');

    dialog.setWidth(360).setHeight(400).setSandboxMode(HtmlService.SandboxMode.IFRAME);

    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'Create status report');
  },

  /**
   * @desc Fetch all active users and groups for dialog selection.
   * @return {object} Object({status: [boolean], response: [Array], message:[string]})
   */
  getAllChangelogs: function () {
    debug.log(this.name + '.getAllChangelogs()');

    var result = [], maxResults = 1000, response = {
      status : false,
      response : result,
      message : null
    };

    // result.sort(function (a, b) {
    //   // as we go over each user anyway, we extend it same time with our autocomplete value
    //   a.value = a.displayName + ( (a.name.length > 0) ? ' (' + a.name + ')' : '' );
    //   b.value = b.displayName + ( (b.name.length > 0) ? ' (' + b.name + ')' : '' );
    //
    //   return (a.displayName > b.displayName) ? 1 : ((b.displayName > a.displayName) ? -1 : 0);
    // });

    if (result.length == 0) {
      response.message = "No Changelogs were found.";
      SpreadsheetApp.getActiveSpreadsheet().toast(response.message, "Error", 10);
    }

    response = {
      status : true,
      response : result,
      message : null
    };

    return response;
  },

  /**
   * @desc Form handler for dialogWorklog. Fetch worklog data and create table.
   * @param jsonFormData {object}  JSON Form object of all form values
   * @return void
   */
  createStatussheet: function (jsonFormData) {
    debug.log(this.name + '.createStatussheet(%s)', JSON.stringify(jsonFormData));
    jsonFormData = jsonFormData || {
      wlAuthorName: undefined,
      wlAuthorUsernameOrAccountId : undefined,
      wlAuthorG  : undefined,
      wlStartDate: undefined,
      wlEndDate  : undefined,
      wlTimeFormat: 1,
      wlLayout   : 'list_layout_01'  // "list_layout_01", "list_layout_02"
    };

    var response = {status: false, response: ''},
        wlQuery = '',
        wlDateTo = new Date(),
        wlDateFrom = new Date();

    // filter dates - defaults
    wlDateFrom.setDate(wlDateTo.getDate() - 7); // from = now() - 7 days

    // from dialog
    if( jsonFormData.wlStartDate ) {
      wlDateFrom = new Date(jsonFormData.wlStartDate);
    }
    if( jsonFormData.wlEndDate ) {
      wlDateTo = new Date(jsonFormData.wlEndDate);
    }

    var _d = wlDateFrom;
    if( Date.parse(_d) > Date.parse(wlDateTo) ) {
      wlDateFrom = wlDateTo;
      wlDateTo   = _d;
    }
    wlQuery += 'worklogDate>="' + wlDateFrom.toISOString().substring(0, 10) +'" ' +
      'AND worklogDate<="' + wlDateTo.toISOString().substring(0, 10) + '"';

    if(jsonFormData.wlAuthorG) {
      wlQuery += ' AND worklogAuthor in membersOf("' + jsonFormData.wlAuthorG + '")';
    } else {
      wlQuery += ' AND worklogAuthor="' + jsonFormData.wlAuthorUsernameOrAccountId + '"';
    }

    var authorName = jsonFormData.wlAuthorName ? jsonFormData.wlAuthorName : (
      jsonFormData.wlAuthorG ? jsonFormData.wlAuthorG : jsonFormData.wlAuthorUsernameOrAccountId
    );

    if (jsonFormData.wlLayout == '') {
      jsonFormData.wlLayout = 'list_layout_01'; // default
    }
    /* Get all affected jira issues */

    /* OnSucess, start prepping Timesheet Table and perform subsequent api searches for all worklogs per individual jira issue */
    var onSuccess = function(resp, status, errorMessage) {
      debug.log('Issue with worklogs founds: %s !', resp.data.length);
      debug.log('%s %s %s', JSON.stringify(resp), status, errorMessage);

      if(resp.data.length == 0) {
        Browser.msgBox("Jira Changelogs",
                       "Apparently there are no issues with changelogs available in the requested time period.",
                       Browser.Buttons.OK);
        return;
      }

      // prep new TimesheetTable then request actual worklogs
      var timeSheetRenderer = TimesheetRendererFactory_.call({
        periodFrom: wlDateFrom,
        periodTo:   wlDateTo
      }, jsonFormData.wlLayout);
      timeSheetRenderer.setWorktimeFormat( (parseInt(jsonFormData.wlTimeFormat)==1 ? formatTimeDiff : formatWorkhours) );
      timeSheetRenderer.addHeader(authorName, 'Time Sheet');

      // foreach jira issue, fetch worklogs and fill sheet row
      (resp.data || []).forEach(function(issue, index) {
        debug.log('============= (data || []).forEach() =================');
        debug.log('issue= icon:%s; key:%s; summary:%s; priority:%s ',
          unifyIssueAttrib('issuetype', issue),
          unifyIssueAttrib('key', issue),
          unifyIssueAttrib('summary', issue),
          unifyIssueAttrib('priority', issue)
        );

        // perform worklog request
        var request = new JiraRequest();
        request.call('worklogOfIssue',{issueIdOrKey: issue.id})
          .withFailureHandler(function(resp, httpResp, status) {
            debug.error("Failed to retrieve worklogs for issue with status [%s]!\\n" + resp.errorMessages.join("\\n") + "Response: %s", status, resp);

            // add issue to time report highlighted and with error message as cell note
            issue.cellNote = {
                message: resp.errorMessages.join("\\n"),
                color: 'red'
            };
            timeSheetRenderer.addRow(issue, []);
          })
          .withSuccessHandler(function(resp, httpResp, status) {
            // we have all logs here for 1 jira issue
            if(!resp) { return; }

            // get only the data we need and safe some bytes
            var worklogs = resp.worklogs.filter(function(wlog) { // get only logs for user we searched for
              // remove some unused props
              if(wlog.updateAuthor) wlog.updateAuthor = undefined;
              if(wlog.author.avatarUrls) wlog.author.avatarUrls = undefined;

              //@TODO: make compatible with worklogs of groups ( memberOf("") )
              var foundA = (wlog.author.accountId === jsonFormData.wlAuthorUsernameOrAccountId);
              var foundB = (wlog.author.name === jsonFormData.wlAuthorUsernameOrAccountId);
              return (foundA || foundB);
            });

            timeSheetRenderer.addRow(issue, worklogs);

          }); // END: withSuccessHandler()
        //END: request.call('worklogOfIssue')
      });//END: (resp.data || []).forEach()

      // add table footer
      timeSheetRenderer.addFooter();
      timeSheetRenderer.onComplete();
    }; //END: onSuccess()

    var onFailure = function(resp, status , errorMessage) {
      debug.error('worklog::onFailure: resp:%s status:%s msg:%s', resp, status, errorMessage);
      Browser.msgBox("Jira Worklog",
                     "Failure during request to Jira server.\\nStatus:" + (status||-1) + " \\nMessage:'" + errorMessage + "'",
                     Browser.Buttons.OK);
    };

    // Search API returns max 20 worklogs per issue - we have to get worklog
    // indiv. per issue later in iterated requests - see onSuccess handler
    var search = new IssueSearch(wlQuery);
    search.setOrderBy('created', 'DESC')
          .setFields(['id','key','issuetype','priority','status','summary']);

    search.search()
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
    ;
  }

}
