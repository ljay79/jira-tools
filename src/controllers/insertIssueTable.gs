
// @TODO: dialog insert issues from filter

// @TODO: menu insert issues from filter
// @TODO: callbacks

/* ######## DEV- WIP - Testing #################### */


function newTable() {
  var jsonIssues = '[{"expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields","id": "33184","self": "https://dyhltd.atlassian.net/rest/api/2/issue/33184","key": "TP-15","fields": {"summary": "Test Story 1 - appended2","status": {"self": "https://dyhltd.atlassian.net/rest/api/2/status/10004","description": "The issue is open and awaiting review and further refining to process into Sprints Backlog.","iconUrl": "https://dyhltd.atlassian.net/images/icons/status_generic.gif","name": "To Do","id": "10004","statusCategory": {"self": "https://dyhltd.atlassian.net/rest/api/2/statuscategory/2","id": 2,"key": "new","colorName": "blue-gray","name": "To Do"}}}}, {"expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields","id": "33178","self": "https://dyhltd.atlassian.net/rest/api/2/issue/33178","key": "TP-9","fields": {"summary": "CLONE - Test task of Epic 4 - appended","status": {"self": "https://dyhltd.atlassian.net/rest/api/2/status/3","description": "This issue is being actively worked on at the moment by the assignee.","iconUrl": "https://dyhltd.atlassian.net/images/icons/statuses/inprogress.png","name": "In Progress","id": "3","statusCategory": {"self": "https://dyhltd.atlassian.net/rest/api/2/statuscategory/4","id": 4,"key": "indeterminate","colorName": "yellow","name": "In Progress"}}}}]';
  jsonIssues = JSON.parse(jsonIssues);

  var attributes = {
    filter   : getFilter(14406),
    issues   : jsonIssues,
    sheet    : getTicketSheet(),
    renderer : new IssueTableRendererDefault_()
  };

  console.log('passing attribs: %s', attributes);
  var table = new IssueTable_(attributes);
  table.render();
}


function testDefineRange() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var range = getTicketSheet().getRange(TestTable.rangeA1);
  ss.setNamedRange(TestTable.rangeName, range);

  // check
  var rangeCheck = ss.getRangeByName(TestTable.rangeName);
  var rangeCheckName = rangeCheck.getA1Notation();
  console.log('rangeCheckName: %s === TestTable.rangeA1', rangeCheckName, TestTable.rangeA1);
}

function testTable1() {
  console.log('testTable1()');

  SpreadsheetTriggers_.register('onEdit', 'onEditTableMeta', true);
  SpreadsheetTriggers_.register('onChange', 'onEditTableMeta', true);
}

function onEditTableMeta(e) {
  console.log('onEditTableMeta(): %s', e);

  // check against if current sheet has any monitored IssueTable (loop)
  if (getTicketSheet().getSheetId() != TestTable.sheetId) {
    console.log('not monitored sheet, leave...');
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rangeCheck = ss.getRangeByName(TestTable.rangeName);
  // get range left/top corner
  var rangeCoord = {
    'c' : rangeCheck.getColumn(),
    'r' : rangeCheck.getRow()
  };

  // EDIT, INSERT_ROW, INSERT_COLUMN, REMOVE_ROW, REMOVE_COLUMN, INSERT_GRID,
  // REMOVE_GRID, FORMAT, or OTHER
  switch (e.changeType) {
    case 'EDIT': // cell values changed; currently same validation rules as rest

    case 'REMOVE_GRID':
    case 'INSERT_GRID':
    case 'REMOVE_COLUMN':
    case 'REMOVE_ROW':
    case 'INSERT_COLUMN':
    case 'INSERT_ROW':
      // get issue table header (always in 2nd row)
      var tableHeader = getTicketSheet().getRange(rangeCoord.r + TestTable.headerRowOffset, rangeCoord.c, 1,
          (rangeCheck.getLastColumn() - rangeCoord.c + 1));
      // header changed?
      if (tableHeader.getValues()[0].join('|') !== TestTable.headerValues.join('|')) {
        console.log('Compare header: %s !== %s', tableHeader.getValues()[0].join('|'), TestTable.headerValues.join('|'));
        console.log('New header values: %s', tableHeader.getValues());

        /*
         * @TODO: logic needed to check new header values - parse and check if new value is a supported Jira field - yes: update meta - no:
         * flag column to be skipped - header moved inside table range (relative offset update?) / not 2nd row anymore? allowed at all?
         */

        // update meta - changed header
        TestTable.headerValues = tableHeader.getValues();

      } else {
        console.log('table header didnt change, skip...');
      }

      // check for structural changes and update table meta OR throw warning
      // (refresh wont be possible after such change)
      if (rangeCheck.getA1Notation() === TestTable.rangeA1) {
        console.log('Range dimension didnt change, skip...');
        // return; // nothing to do
      } else {
        console.log('! Range changed !');

        /*
         * !! check if new change is affecting IssueTable functionality If YES: prompt user with warning and undo or accept with IssueTable
         * beeing converted to static sheet table (remove trigger) If NO: simply update TableMeta if necessary
         */
        // update meta - changed dimension/range
        TestTable.rangeA1 = rangeCheck.getA1Notation();

        console.log('New Tables Range: %s', TestTable.rangeA1);
      }

      break;

    default:
      return;
      break;
  }

}

function IssueTableRendererDefault_() {
  console.log('IssueTableRendererDefault_()');

  this.render = function () {
    console.log('IssueTableRendererDefault_.render()');
    console.log('getSheetId: %s; rangeA1: %s', this.getSheetId(), this.getMeta('rangeA1'));
  };
}
/* ######## ################## #################### */

