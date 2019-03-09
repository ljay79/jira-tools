// @TODO: dialog insert issues from filter

// @TODO: menu insert issues from filter
// @TODO: callbacks

/* ######## DEV- WIP - Testing #################### */

function tableFromMeta() {
  var _meta = {
    // sheetId : "sid_230234225",
    // tableId : "tbl_rH15D24",
    name : null,
    rangeA1 : "A15:C23",
    headerRowOffse : 1,
    headerValues : ["key", "summary", "status"],
    filter : {
      id : 14406,
      name : "01 - Test Project - All Issues",
      jql : "project = TP ORDER BY lastViewed DESC"
    },
    maxResults : 6,
    renderer : "IssueTableRendererDefault_",
    time_lastupdated : 1551636173161
  };

  var table = new IssueTable_({
    metaData : _meta
  });
  // table.setTableId();

  var ok = function (resp, status, errorMessage) {
    var renderer;
    table.setIssues(resp.data);

    if (renderer = table.render()) {
      // toast with status message
      var msg = "Finished inserting " + renderer.getInfo().totalInserted + " Jira issues out of " + resp.data.total
          + " total found records.";
      SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
      debug.log(msg);

      console.log('renderer.info: %s', renderer.getInfo());

      console.log('==>> Table Meta: %s', table.getMeta());

      IssueTableIndex_.addTable(table);
    }

    debug.timeEnd('insertIssueTable()');
  };

  var Search = new IssueSearch(table.getMeta('filter').jql);
  Search.setOrderBy()
    .setFields(table.getMeta('headerValues'))
    .setMaxResults(table.getMeta('maxResults'))
    .setStartAt(0)
    .search()
    .withSuccessHandler(ok);

}

function newControllerActionLive() {
  debug.time('insertIssueTable()');

  var ok = function (resp, status, errorMessage) {
    var renderer, attributes = {
      filter : getFilter(14406),
      maxResults : resp.data.maxResults,
      issues : resp.data,
      sheet : getTicketSheet(),
      renderer : IssueTableRendererDefault_
    };

    var table = new IssueTable_(attributes);
    if (renderer = table.render()) {
      // toast with status message
      var msg = "Finished inserting " + renderer.getInfo().totalInserted + " Jira issues out of " + resp.data.total
          + " total found records.";
      SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
      debug.log(msg);

      console.log('renderer.info: %s', renderer.getInfo());

      console.log('==>> Table Meta: %s', table.getMeta());
    }

    debug.timeEnd('insertIssueTable()');
  };

  var Search = new IssueSearch("status = Done");
  Search.setOrderBy().setFields(['key', 'summary', 'status']).setMaxResults(11).setStartAt(0).search().withSuccessHandler(ok);
}

/* ######## ------------------ #################### */

/**
 * @file Contains controller class and dialog/callback method for inserting issue tables from jira filter.
 */

/**
 * @desc Wrapper: Dialog to choose issues filter
 */
function menuInsertIssueFromFilter() {
  InsertIssueTable_Controller_.dialog();
}

/**
 * @desc Wrapper: Dialog callback handler
 * @return {object} Object({status: [boolean], response: [string]})
 */
function callbackInsertIssueFromFilter(jsonFormData) {
  return InsertIssueTable_Controller_.callback(jsonFormData);
}

/**
 * Creates a new IssueTableIndex_ object, which is used to persist IssueTables and related information.
 */
InsertIssueTable_Controller_ = {
  name : 'InsertIssueTable_Controller_',

  /**
   * @desc Dialog to configure Jira custom fields
   */
  dialog : function () {
    debug.log(this.name + '.dialog()');

    if (!hasSettings(true))
      return;

    var customFields = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_SEARCH);
    var userColumns = UserStorage.getValue('userColumns') || [];
    var dialog = getDialog('views/dialogs/insertIssueFromFilter', {
      columns : IssueFields.getBuiltInJiraFields(),
      customFields : customFields,
      userColumns : userColumns.length > 0 ? userColumns : jiraColumnDefault
    });

    // try to adjust height depending on amount of jira fields to show
    var rowH = 32;
    var height = 424;
    height += (Math.ceil(Object.keys(IssueFields.getBuiltInJiraFields()).length % 4) * rowH);
    height += (Math.ceil(Object.keys(customFields).length % 4) * rowH);

    dialog
      .setWidth(600)
      .setHeight(height)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);

    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'List Jira issues from filter');
  },

  /**
   * @desc Form handler for dialogIssuesFromFilter. Retrieve issues for given filter with specified columns from Jira and insert into
   *       current active sheet.
   * @param jsonFormData {object} JSON Form object of all form values
   * @return {object} Object({status: [boolean], response: [string]})
   */
  callback : function (jsonFormData) {
    debug.log(this.name + '.callback() <= %s', JSON.stringify(jsonFormData));

    jsonFormData = jsonFormData || {filter_id: 0};
    var that = this,
        startAt = parseInt(jsonFormData['startAt']) || 0,
        columns = jsonFormData['columns'] || jiraColumnDefault,
        response = {status: false, message: ''};

    var Renderer, attributes = {
      filter : jsonFormData['filter_id'] ? getFilter(parseInt(jsonFormData['filter_id'])) : {},
      maxResults : parseInt(jsonFormData['maxResults']) || 10000,
      issues : {},
      sheet : getTicketSheet(),
      renderer : IssueTableRendererDefault_
    };

    UserStorage.setValue('userColumns', columns); // store for re-use by user

    var ok = function (resp, status, errorMessage) {
      debug.log(this.name + '.ok() resp(len): %s; s: %s; msg: %s', resp.data.length, status, errorMessage);

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

        var Table = new IssueTable_(attributes);
        if (Renderer = Table.render()) {
          // toast with status message
          var msg = "Finished inserting " + Renderer.getInfo().totalInserted + " Jira issues out of " + resp.data.total
              + " total found records.";
          SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
          debug.log(msg);

          // add table to index
          IssueTableIndex_.addTable(Table);

          response.status = true;

          // set trigger for index cleanup
          that.setTriggerPruneIndex();
        }
      }
    };

    var error = function (resp, status, errorMessage) {
      response.message = "Failed to retrieve jira issues from filter with status [" + status + "]!\\n" + errorMessage;
      Browser.msgBox(response.message, Browser.Buttons.OK);
    };

    var Search = new IssueSearch(attributes.filter.jql);
    Search
      //.setOrderBy()
      .setFields(columns)
      .setMaxResults(attributes.maxResults)
      .setStartAt(startAt)
      .search()      
      .withSuccessHandler(ok)
      .withFailureHandler(error);

    return response;
  },

  /**
   * @desc Setting a trigger for the current spreadsheet.
   * @return void
   */
  setTriggerPruneIndex : function () {
    debug.log(this.name + '.setTriggerPruneIndex()');
    SpreadsheetTriggers_.register('onChange', 'TriggerPruneIssueTableIndex_', true);
  }

}

/**
 * @desc Trigger to react on structural changes in a sheet. Will prune obsolete IssueTable references in index.
 * @param {EventObject} e
 * @return void
 */
function TriggerPruneIssueTableIndex_(e) {
  debug.log('TriggerPruneIssueTableIndex_() - e.changeType: %s', e.changeType);

  if (e.changeType !== 'REMOVE_GRID') {
    debug.log('[TriggerPruneIssueTableIndex_] changeType [%s] not monitored. Skip.', e.changeType);
    return;
  }

  IssueTableIndex_.prune();
}
