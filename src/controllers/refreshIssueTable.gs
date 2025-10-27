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
function callbackRefreshIssueTable_initSidebar() {
  return RefreshIssueTable_Controller_.callbackInitSidebar();
}

/**
 * @desc Wrapper: Sidebar callback handler, perform IssueTable refresh
 * @param {object} tableMetaData Object with IssueTable meta data
 * @return {object} Object({status: [boolean]})
 */
function callbackRefreshIssueTable_refreshTable(tableMetaData) {
  return RefreshIssueTable_Controller_.callbackRefreshTable(tableMetaData);
}

/**
 * @desc Wrapper: Sidebar callback handler to check if sidebar content should be refreshed. Ie: When user switches sheet.
 * @return {object} Object({sheetId: [string], currentActiveCellValue: [string]})
 */
function callbackRefreshIssueTable_getResetSidebar() {
  var response = {
    sheetId : sheetIdPropertySafe(),
    currentActiveCellValue : getTicketSheet().getActiveCell().getValue()
  };

  return response;
}

/**
 * @TODO: requires refactoring for new api pagination scheme "nextPageToken"
 * Creates a new RefreshIssueTable_Controller_ object, controller for multiple actions.
 */
RefreshIssueTable_Controller_ = {
  name : 'RefreshIssueTable_Controller_',

  /**
   * @desc Menu called to open new sidebar dialog.
   */
  sidebar : function () {
    var sidebar = getDialog('views/sidebar/refreshTableSchedule', {
      buildNumber : BUILD
    });

    debug.log('Processed: %s', sidebar);

    var html = HtmlService.createHtmlOutput(sidebar.getContent())
      .setTitle('Refresh IssueTable')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    ;

    SpreadsheetApp.getUi().showSidebar(html);
    
    DeprecationNotice_(); //@TODO: temp
  },

  /**
   * @desc Callback from sidebar to get all initialization data.
   * @return {object} Object({status: [boolean], tables: [object]})
   */
  callbackInitSidebar : function () {
    debug.log(this.name + '.callbackInitSidebar()');

    var dateFromSeconds = 0,
        activeSheet = getTicketSheet(),
        response = {
          status : true,
          tables : []
        };

    // enhance data for sidebar functionality, then pass to response as JSON string
    IssueTableIndex_.getAllTablesBySheet(activeSheet.getSheetId()).forEach(function (table) {
      var tableMeta = table.getMeta();
      // add name of sheet
      tableMeta.sheetName = activeSheet.getName();
      // table last updated, elapsed time
      dateFromSeconds = new Date(table.getMeta('time_lastupdated'));
      tableMeta.timeElapsedFormatted = formatTimeDiff(new Date(), dateFromSeconds, 24);

      response.tables.push(tableMeta);
    });

    return response;
  },

  /**
   * @desc Callback from sidebar to perform an IssueTable refresh
   * @param {object} tableMetaData Object with IssueTable meta data
   * @return {object} Object({status: [boolean]})
   */
  callbackRefreshTable : function (tableMetaData) {
    debug.log(this.name + '.callbackRefreshTable() <= %s', tableMetaData);

    var response = {
      status : false,
      filterModified: false,
      filter: {}
    };

    // Get table from Meta
    var sheetId = sheetIdPropertySafe(tableMetaData.sheetId, true);
    var Table = IssueTableIndex_.getTable(tableMetaData.tableId, sheetId);

    var ok = function (resp, status, errorMessage) {
      var renderer;
      Table.setIssues(resp.data);

      // clear outdated IssueTable in sheet
      var sheet = getSheetById(sheetId);
      if (typeof sheet === 'object') {
        var range = sheet.getParent().getRangeByName(Table.getMeta('rangeName'));
        range.clear();
      }

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

    // check for changed filter JQL
    var Filter = new JiraFilter(Table.getMeta('filter'));
    if (Filter.update().isModified()) {
      var filterObj = Filter.getFilter();
      response.filterModified = true;
      response.filter = filterObj;
      // update filter details in stored IssueTable
      Table.setMeta('filter', {
        id : filterObj.id,
        name : filterObj.name,
        jql : filterObj.jql
      })
    }

    // perform search to update IssueTable
    var Search = new IssueSearch(Table.getMeta('filter').jql);
    Search.setOrderBy()
      .setFields(Table.getMeta('headerFields'))
      .setMaxResults(Table.getMeta('maxResults') || 1000)
      .setStartAt(0)
      .setPaginationTokenBased(true)
      .search()
      .withSuccessHandler(ok)
    ;

    response.status = true;

    return response;
  }

}

// Node required code block
module.exports = {
  menuRefreshIssueTable : menuRefreshIssueTable,
  callbackRefreshIssueTable_initSidebar : callbackRefreshIssueTable_initSidebar,
  callbackRefreshIssueTable_refreshTable : callbackRefreshIssueTable_refreshTable,
  callbackRefreshIssueTable_getResetSidebar : callbackRefreshIssueTable_getResetSidebar,
  RefreshIssueTable_Controller_ : RefreshIssueTable_Controller_
}
// End of Node required code block
