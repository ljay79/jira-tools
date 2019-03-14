/* ######## DEV- WIP - Testing #################### */

/*
 * Fetching a table from index and using its meta data to (re)insert table into sheet. Used for Refreshing entire Issue Tables
 */
function TESTrefreshTableFromMeta() {
  debug.log('TESTinsertTableFromMeta()');

  // Get table from Meta
  // var Table = IssueTableIndex_.getTable('tbl_rE9G15', '1088328195');
  var Table = IssueTableIndex_.getTable('tbl_rA12C18', '1088328195');

  var ok = function (resp, status, errorMessage) {
    var renderer;
    Table.setIssues(resp.data);

    if (renderer = Table.render()) {
      // toast with status message
      var msg = "Finished inserting " + renderer.getInfo().totalInserted + " Jira issues out of " + resp.data.total
          + " total found records.";
      SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
      debug.log(msg);

      // add table to index
      console.log('renderer.info: %s', renderer.getInfo());
      console.log('==>> Table Meta: %s', Table.getMeta());
    }
  };

  var Search = new IssueSearch(Table.getMeta('filter').jql);
  Search.setOrderBy()
    .setFields(Table.getMeta('headerValues'))
    .setMaxResults(Table.getMeta('maxResults') || 10)
    .setStartAt(0)
    .search()
    .withSuccessHandler(ok)
  ;
}

function TESTrefreshTableFromMeta2() {
  debug.log('TESTinsertTableFromMeta2()');

  // Get table from Meta
  var Table = IssueTableIndex_.getTable('tbl_rE9G15', '1088328195');

  var ok = function (resp, status, errorMessage) {
    var renderer;
    Table.setIssues(resp.data);

    if (renderer = Table.render()) {
      // toast with status message
      var msg = "Finished inserting " + renderer.getInfo().totalInserted + " Jira issues out of " + resp.data.total
          + " total found records.";
      SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
      debug.log(msg);

      // add table to index
      console.log('renderer.info: %s', renderer.getInfo());
      console.log('==>> Table Meta: %s', Table.getMeta());
    }
  };

  // var headers = Table.getMeta('headerValues');
  var headers = ['key', 'summary', 'status', 'assignee'];

  var Search = new IssueSearch(Table.getMeta('filter').jql);
  Search.setOrderBy()
    .setFields(headers)
    .setMaxResults(Table.getMeta('maxResults') || 10)
    .setStartAt(0)
    .search()
    .withSuccessHandler(ok)
  ;
}

/* ######## ------------------ #################### */

/**
 * @file Contains controller class and dialog/callback method for inserting issue tables from jira filter.
 */

/**
 * @desc Wrapper: Sidebar for "Refresh IssueTable"
 */
function menuRefreshIssueTable() {
  RefreshIssueTable_Controller_.sidebar();
}

/**
 * @desc Wrapper: Sidebar callback handler for initialization of sidebar content
 * @return {object} Object({status: [boolean], tables: [object]})
 */
function cbRefreshIssueTable_initSidebar() {
  return RefreshIssueTable_Controller_.callbackInitSidebar();
}

function cbRefreshIssueTable_refreshTable(tableMetaData) {
  return RefreshIssueTable_Controller_.callbackRefreshTable(tableMetaData);
}

function cbRefreshIssueTable_getResetSidebar() {
  var response = {
    sheetId: sheetIdPropertySafe(),
    currentActiveCellValue: getTicketSheet().getActiveCell().getValue()
  };

  return response;
}

/**
 * Creates a new IssueTableIndex_ object, which is used to persist IssueTables and related information.
 */
RefreshIssueTable_Controller_ = {
  name : 'RefreshIssueTable_Controller_',

  sidebar : function () {
    var sidebar = getDialog('views/sidebar/refreshTableSchedule');

    debug.log('Processed: %s', sidebar);

    var html = HtmlService.createHtmlOutput(sidebar.getContent())
      .setTitle('Refresh IssueTable')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    ;
    
    SpreadsheetApp.getUi().showSidebar(html);
  },

  callbackInitSidebar : function () {
    debug.log(this.name + '.callbackInitSidebar()');

    var dateFromSeconds = 0,
        activeSheet = getTicketSheet(),
        response = {
          status : true,
          tables : []
        };

    /* enhance data for sidebar functionality, then pass to response as JSON string */
    IssueTableIndex_.getAllTablesBySheet(activeSheet.getSheetId()).forEach(function (table) {
      var tableMeta = table.getMeta();
      // add name of sheet
      tableMeta.sheetName = activeSheet.getName();
      // table last updated, elapsed time
      dateFromSeconds = new Date(table.getMeta('time_lastupdated'));
      tableMeta.timeElapsedFormatted = formatTimeDiff(new Date(), dateFromSeconds);

      response.tables.push(tableMeta);
    });

    return response;
  },

  callbackRefreshTable : function (tableMetaData) {
    debug.log(this.name + '.callbackRefreshTable() <= %s', tableMetaData);

    var response = {
      status : false
    };

    // Get table from Meta
    var sheetId = sheetIdPropertySafe(tableMetaData.sheetId, true);
    var Table = IssueTableIndex_.getTable(tableMetaData.tableId, sheetId);

    var ok = function (resp, status, errorMessage) {
      var renderer;
      Table.setIssues(resp.data);

      if (renderer = Table.render()) {
        // toast with status message
        var msg = "Finished inserting " + renderer.getInfo().totalInserted + " Jira issues out of " + resp.totalFoundRecords
            + " total found records.";
        SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
        debug.log(msg);

        IssueTableIndex_.addTable(Table);
      }
    };

    if (typeof Table !== 'object') {
      debug.error('Could not refresh IssueTable. Table not found!');
      SpreadsheetApp.getUi().alert('Could not refresh IssueTable. Table not found!');
      return response;
    }

    var Search = new IssueSearch(Table.getMeta('filter').jql);
    Search.setOrderBy()
      .setFields(Table.getMeta('headerValues'))
      .setMaxResults(Table.getMeta('maxResults') || 1000)
      .setStartAt(0)
      .search()
      .withSuccessHandler(ok)
    ;

    response.status = true;

    return response;
  }

}
