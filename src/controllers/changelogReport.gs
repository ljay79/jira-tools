// Node required code block
const hasSettings = require("src/settings.gs").hasSettings;
const getCfg_ = require("src/settings.gs").getCfg_;
const UserStorage = require("src/models/gas/UserStorage.gs");
const IssueFields = require("src/models/jira/IssueFields.gs");
const IssueSearch = require('src/models/jira/IssueSearch.gs')
const getTicketSheet = require("src/jiraCommon.gs").getTicketSheet;
const getDialog = require("src/dialogs.gs").getDialog;
const getFilter = require('src/jiraCommon.gs').getFilter;
const ChangelogTable_ = require('src/models/jira/ChangelogTable.gs');
// End of Node required code block

/**
 * @file Contains controller class and dialog/callback method for creating a time report from Jira worklog
 */

/**
 * @desc Wrapper: Dialog for time report settings
 */
function menuCreateChangelogReport() {
  ChangelogReport_Controller_.sidebarOpen();
}

/**
 * @desc Dialog callback handler
 * @param {integer} enabled
 * @return void
 */
function callbackUpdateCfgMyFilter(enabled) {
  debug.log('callbackUpdateCfgMyFilter(%s)', (0+enabled));
  UserStorage.setValue('only_my_filters', 0 + enabled);
}

/**
 * @desc Wrapper: Dialog callback handler
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return {object} Object({status: [boolean], response: [string]})
 */
function callbackCreateChangelog(jsonFormData) {
  return ChangelogReport_Controller_.createChangelog(jsonFormData);
}


/**
 * Creates a new ChangelogReport_Controller object.
 */
ChangelogReport_Controller_ = {
  name : 'ChangelogReport_Controller_',

  /**
   * @desc Sidebar for creating a changelog report
   */
  sidebarOpen: function () {
    debug.log(this.name + '.sidebarOpen()');

    if (!hasSettings(true))
      return;

    var only_my_filters = UserStorage.getValue('only_my_filters');
    var jiraFields = IssueFields.getBuiltInJiraFields(); // @TODO: filter unsupported fields
    var sidebar = getDialog('views/sidebar/changelogReport', {
      only_my_filters: only_my_filters,
      server_type: getCfg_('server_type'),
      jiraFields: jiraFields
    });

    debug.log('Processed: %s', sidebar);

    var html = HtmlService.createHtmlOutput(sidebar.getContent())
      .setTitle('Create changelog report')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    ;

    SpreadsheetApp.getUi().showSidebar(html);
  },

  /**
   * @desc Form handler for createChangelog. Retrieve changelog info for issues fields from 
   *       given filter with specified columns from Jira and insert into
   *       current active sheet.
   * @param jsonFormData {object} JSON Form object of all form values
   * @return {object} Object({status: [boolean], message: [string]})
   */
  createChangelog: function (jsonFormData) {
    debug.log(this.name + '.callbackCreateChangelog() <= %s', JSON.stringify(jsonFormData));

    jsonFormData = jsonFormData || {
      filter_id: 0
    };

    var that = this,
        response = {status: false, message: ''};
    var attributes = {
      filter : getFilter(parseInt(jsonFormData['filter_id'])),
      maxResults : parseInt(jsonFormData['maxResults']) || 10000,
      columns : ['issuetype','created','field','fromString','toString'],
      data : {},
      expand : ['changelog'],
      sheet : getTicketSheet(),
      renderer : jsonFormData['wlLayout'] ? jsonFormData['wlLayout'] : 'ChangelogTableRendererDefault_',
      historyField: jsonFormData['wlIssueField'] ? jsonFormData['wlIssueField'] : 'status'
    };

    var onSuccess = function (resp, status, errorMessage) {
      debug.log(that.name + '.onSuccess() resp(len): %s; s: %s; msg: %s', resp.data.length, status, errorMessage);

      if (status !== 200) {
        // Something funky is up with the JSON response.
        response.message = "Failed to retrieve data from jira!";
        Browser.msgBox(response.message, Browser.Buttons.OK);
      } else if (resp.data.length === 0) {
        // any data in result?
        response.message = "No issues were found to match your search.";
        Browser.msgBox(response.message, Browser.Buttons.OK);

        return;
      } else {
        attributes.data = resp.data;

        var renderer,
            Table = new ChangelogTable_(attributes);

        if (renderer = Table.render()) {
          // toast with status message
          var msg = "Finished inserting " + renderer.getInfo().totalInserted + " records.";
          SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
          debug.log(msg);

          // add table to index
          //IssueTableIndex_.addTable(Table);

          response.status = true;

          // set trigger for index cleanup and modification detection
          //that.setTriggerPruneIndex();
          //that.setTriggerIssueTableModification();

          // force sidebar update (refreshTableSchedule)
          //UserStorage.setValue('refreshIssueTableforceSidebarReset', true);
          //RefreshIssueTable_Controller_.sidebar();
        }
      }
    };

    var onFailure = function(resp, status, errorMessage) {
      debug.error(that.name + '.onFailure: resp:%s status:%s msg:%s', resp, status, errorMessage);
      Browser.msgBox("Jira Worklog",
                     "Failure during request to Jira server.\\nStatus:" + (status||-1) + " \\nMessage:'" + errorMessage + "'", 
                     Browser.Buttons.OK);
    };

    var Search = new IssueSearch(attributes.filter.jql);
    Search
      .setExpand(attributes.expand)
      .setFields(attributes.columns)
      .setMaxResults(attributes.maxResults)
      .setStartAt(0)
      .setMaxPerPage(100)
      .search()
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure);

    return response;
  }

}


// Node required code block
module.exports = {
  menuCreateChangelogReport: menuCreateChangelogReport,
  callbackUpdateCfgMyFilter: callbackUpdateCfgMyFilter,
  callbackCreateChangelog: callbackCreateChangelog,
}
// End of Node required code block