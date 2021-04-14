/**
 * @file Contains controller class and dialog/callback method for creating a time report from Jira worklog
 */

// Node required code block
const JiraRequest = require('src/jiraApi.gs');
const IssueSearch = require("src/models/jira/IssueSearch.gs");
const getDialog = require("src/dialogs.gs").getDialog;
const debug = require("src/debug.gs").debug;
const unifyIssueAttrib = require('src/jiraCommon.gs').unifyIssueAttrib;
const getTicketSheet = require("src/jiraCommon.gs").getTicketSheet;
const hasSettings = require("src/settings.gs").hasSettings;
const getCfg_ = require("src/settings.gs").getCfg_;
const ChangelogTableRendererDefault_ = require('src/models/renderer/ChangelogTableRendererDefault.gs').ChangelogTableRendererDefault_;
const IssueTableIndex_ = require('src/models/IssueTableIndex.gs');
const ChangelogTable_ = require('src/models/jira/ChangelogTable.gs')
const UserStorage = require('src/models/gas/UserStorage.gs')
// End of Node required code block

/**
 * @desc Wrapper: Dialog for time report settings
 */
function menuCreateChangelogReport() {
  ChangelogReport_Controller_.dialogOpen();
}

/**
 * @desc Dialog Helper to retrieve list of all available Jira Custom Fields from api.
 * @return {Array}    Array of custom Jira Fields
 */
function callbackGetAllChangelogs(jsonFormData) {
  return ChangelogReport_Controller_.getAllChangelogs(jsonFormData);
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

    // prune table and check if user tries to overwrite/overlap with an existing IssueTable
    IssueTableIndex_.prune();

    var only_my_filters = UserStorage.getValue('only_my_filters');
    var dialog = getDialog('views/dialogs/createChangelogReport',{
      only_my_filters: only_my_filters,
      server_type: getCfg_('server_type')
    });

    dialog.setWidth(360).setHeight(400).setSandboxMode(HtmlService.SandboxMode.IFRAME);

    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'Create changelog report');
  },

  /**
   * @desc Fetch all active users and groups for dialog selection.
   * @return {object} Object({status: [boolean], response: [Array], message:[string]})
   */
  getAllChangelogs: function (jsonFormData) {
    debug.log(this.name + '.getAllChangelogs() <= %s', JSON.stringify(jsonFormData));

    jsonFormData = jsonFormData || {filter_id: 0};
    var that = this,
      startAt = parseInt(jsonFormData['startAt']) || 0,
      response = {status: false, message: ''};

    var attributes = {
      filter : jsonFormData['filter_id'] ? getFilter(parseInt(jsonFormData['filter_id'])) : {},
      maxResults : parseInt(jsonFormData['maxResults']) || 10000,
      columns : ['key','issuetype','summary','created','field','fromString','toString'],
      issues : {},
      sheet : getTicketSheet(),
      renderer : ChangelogTableRendererDefault_
    };

    var ok = function (resp, status, errorMessage) {
      debug.log(that.name + '.ok() resp(len): %s; s: %s; msg: %s', resp.data.length, status, errorMessage);

      if (status !== 200) {
        // Something funky is up with the JSON response.
        response.message = "Failed to retrieve jira issues!";
        Browser.msgBox(response.message, Browser.Buttons.OK);
      } else if (resp.data.length === 0) {
        // any issues in result?
        response.message = "No issues were found to match your search.";
        Browser.msgBox(response.message, Browser.Buttons.OK);

        return;
      } else {
        attributes.issues = resp.data;

        var renderer, Table = new ChangelogTable_(attributes);
        if (renderer = Table.render()) {
          // toast with status message
          var msg = "Finished inserting " + renderer.getInfo().totalInserted + " Jira issues out of " + resp.totalFoundRecords
            + " total found records.";
          SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
          debug.log(msg);

          // add table to index
          IssueTableIndex_.addTable(Table);

          response.status = true;

          // set trigger for index cleanup and modification detection
          // that.setTriggerPruneIndex();
          // that.setTriggerIssueTableModification();

          // force sidebar update (refreshTableSchedule)
          // UserStorage.setValue('refreshIssueTableforceSidebarReset', true);
          // RefreshIssueTable_Controller_.sidebar();
        }
      }
    };

    var error = function (resp, status, errorMessage) {
      response.message = "Failed to retrieve jira issues from filter with status [" + status + "]!\\n" + errorMessage;
      Browser.msgBox(response.message, Browser.Buttons.OK);
    };

    var Search = new IssueSearch(attributes.filter.jql);
    Search
      .setExpand(['changelog'])
      .setOrderBy('updated', 'DESC')
      .setFields(attributes.columns)
      .setMaxResults(attributes.maxResults)
      .setStartAt(startAt)
      .search()
      .withSuccessHandler(ok)
      .withFailureHandler(error);

    return response;
  }

}

// Node required code block
module.exports = {
  callbackGetAllChangelogs: callbackGetAllChangelogs,
  menuCreateChangelogReport: menuCreateChangelogReport
}
// End of Node required code block
