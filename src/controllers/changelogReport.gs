/**
 * @file Contains controller class and dialog/callback method for creating a time report from Jira worklog
 */

/**
 * @desc Wrapper: Dialog for time report settings
 */
function menuCreateChangelogReport() {
  ChangelogReport_Controller_.dialogOpen();
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
   * @desc Dialog to configure Jira custom fields
   */
  dialogOpen : function () {
    debug.log(this.name + '.dialog()');

    if (!hasSettings(true))
      return;

    var only_my_filters = UserStorage.getValue('only_my_filters');
    var dialog = getDialog('views/dialogs/createChangelogReport',{
      only_my_filters: only_my_filters,
      server_type: getCfg_('server_type')
    });

    dialog
      .setWidth(600)
      .setHeight(400)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);

    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'Create status report');
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
      filter_id: 0,
      wlLayout : 'ChangelogTableRendererDefault_'
    };

    var that = this,
        response = {status: false, message: ''};
    var attributes = {
      filter : jsonFormData['filter_id'] ? getFilter(parseInt(jsonFormData['filter_id'])) : jsonFormData['filter'],
      maxResults : parseInt(jsonFormData['maxResults']) || 10000,
      columns : ['issuetype','created','field','fromString','toString'],
      issues : {},
      expand: ['changelog'],
      sheet : getTicketSheet(),
      renderer : jsonFormData['wlLayout'] ? jsonFormData['wlLayout'] : 'ChangelogTableRendererDefault_'
    };

    var onSuccess = function (resp, status, errorMessage) {
      debug.log(that.name + '.onSuccess() resp(len): %s; s: %s; msg: %s', resp.data.length, status, errorMessage);

      if (status !== 200) {
        // Something funky is up with the JSON response.
        response.message = "Failed to retrieve data from jira!";
        Browser.msgBox(response.message, Browser.Buttons.OK);
      } else if (resp.data.length === 0) {
        // any issues in result?
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
