global.SpreadsheetApp = require('../../mocks/SpreadsheetApp');
const utils = require('../../utils');
const jiraCommon = require('../../../src/jiraCommon.gs');
var IssueTable_ = require('../../../src/models/jira/IssueTable.gs');

beforeEach(() => {
  jest.resetModules();
});

test("IssueTable_ accessibility test",()=> {
  var table = new IssueTable_();
  var implementations = ['setRenderer', 'setIssues', 'getIssues', 'setMeta', 'getMeta', 'getSheetId', 'getTableId', 'toJson', 'fromJson', 'render'];

  // all required methods implemented?
  implementations.forEach(function(method) {
    expect(table).toHaveProperty(method);
  });

  // metaData property should be private
  expect(table).not.toHaveProperty('metaData');

  var tableData = table.getMeta();
  var currentTime = (new Date()).getTime();

  // init values of IssueTable are set?
  expect(tableData).toMatchObject({
    'sheetId': jiraCommon.sheetIdPropertySafe(),
    'tableId': null,
    'headerRowOffset': 1
  });
  expect(tableData).toHaveProperty('time_lastupdated');

  // initial lastupdated timestamp is correctly set?
  expect(table.getMeta('time_lastupdated')).toBeLessThan(currentTime);
  expect(table.getMeta('time_lastupdated')).toBeGreaterThanOrEqual(currentTime-1000);

  expect(table.getMeta('sheetId')).toBe(table.getSheetId());

  /*
   * Setting/Getting data
   */
  var tableId = utils._randomId();
  table.setMeta('tableId', tableId);
  table.setMeta('random_data_key', 'random Data Value');

  // lasupdated should now be greater than earlier
  expect(table.getMeta('time_lastupdated')).toBeGreaterThan(currentTime);

  tableData = table.getMeta();
  expect(tableData).toMatchObject({
    'sheetId': jiraCommon.sheetIdPropertySafe(),
    'tableId': tableId,
    'headerRowOffset': 1,
    'random_data_key': 'random Data Value'
  });

});

test("IssueTable_ data consistency", ()=> {
  var table1 = new IssueTable_();
  var table2 = new IssueTable_();
  var sheetId = jiraCommon.sheetIdPropertySafe();

  var testData1 = {
    tableId : 'abcdefg12345',
    name : 'Table 1',
    rangeName : 'table1_range_01',
    rangeA1 : 'A1:C3',
    headerRowOffset : 2,
    headerValues : ['Summary', 'Key', 'Status'],
    JQL : 'status = Done and project in ("JST")'
  };
  var testData2 = {
    tableId : '12345ABCDEFG',
    name : 'Table 2',
    rangeName : 'table2_range_02',
    rangeA1 : 'D1:F3',
    headerRowOffset : 1,
    headerValues : ['Key', 'Summary', 'Status', 'Epic'],
    JQL : 'status = Done'
  };

  // set values
  for( var p in testData1 ) {
    table1.setMeta(p, testData1[p]);
  }
  for( var p in testData2 ) {
    table2.setMeta(p, testData2[p]);
  }

  // values in IssueTable match passed values?
  expect(table1.getMeta()).toMatchObject(testData1);
  expect(table2.getMeta()).toMatchObject(testData2);
  
  // sheet id is correct?
  expect(table1.getSheetId()).toBe(sheetId);
  expect(table2.getSheetId()).toBe(sheetId);
  
  // table id is correct?
  expect(table1.getTableId()).toBe('abcdefg12345');
  expect(table2.getTableId()).toBe('12345ABCDEFG');
});

test("IssueTable_ from/to JSON conversion works", ()=> {
  var testData = {
    tableId : 'abcdefg12345',
    name : 'Table 1',
    rangeName : 'table1_range_01',
    rangeA1 : 'A1:C3',
    headerRowOffset : 2,
    headerValues : ['Summary', 'Key', 'Status'],
    JQL : 'status = Done and project in ("JST")',
    sheetId : jiraCommon.sheetIdPropertySafe()
  };

  var table = new IssueTable_();
  table = table.fromJson(JSON.stringify(testData));

  // values in IssueTable match passed values?
  expect(table.getMeta()).toMatchObject(testData);
  //expect(table.toJson()).toBe(JSON.stringify(testData)); //doesnt work as soon object keys are not in same order
});
