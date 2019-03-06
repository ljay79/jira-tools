global.environmentConfiguration = require('../../src/environmentConfiguration.gs');
global.PropertiesService = require('../mocks/PropertiesService');
global.SpreadsheetApp = require('../mocks/SpreadsheetApp');
const jiraCommon = require('../../src/jiraCommon.gs');
var IssueTable_ = require('../../src/models/jira/IssueTable.gs');
var IssueTableIndex_ = require('../../src/models/IssueTableIndex.gs');

beforeEach(() => {
  PropertiesService.resetMocks();
  jest.resetModules();
});

test("IssueTableIndex_ accessibility test",()=> {
  var TableIndex = new IssueTableIndex_();
  var implementations = ['init', 'addTable', 'getTable', 'load_', 'save_', 'tableIndexName'];

  // all required methods implemented?
  implementations.forEach(function(method) {
    expect(TableIndex).toHaveProperty(method);
  });

  // data property should be private
  expect(TableIndex).not.toHaveProperty('storage_');
  
  // data property should be private (not yet)
//  expect(TableIndex).not.toHaveProperty('index_');
//  expect(TableIndex).not.toHaveProperty('tables_');
  expect(TableIndex).toHaveProperty('index_');
  expect(TableIndex).toHaveProperty('tables_');

  expect(PropertiesService.getDocumentProperties).toBeCalled();
});

test("IssueTableIndex_ can store IssueTable's",()=> {
  var TableIndex = new IssueTableIndex_();
  var IssueTable1 = new IssueTable_();
  IssueTable1.setMeta('tableId', 'table1_Id');

  // add table to index which stores it into PropertiesService
  TableIndex.addTable(IssueTable1);
  // expected index data
  var indexData = {};
  indexData[IssueTable1.getSheetId()] = [IssueTable1.getTableId()];

  expect(PropertiesService.getDocumentProperties).toBeCalled();
  expect(PropertiesService.mockDocumentProps.setProperty).toBeCalled();
  expect(PropertiesService.mockDocumentProps.setProperty.mock.calls[0][0]).toBe("jst_tables.index");
  expect(PropertiesService.mockDocumentProps.setProperty.mock.calls[0][1]).toBe(JSON.stringify(indexData));
});

test("IssueTableIndex_ duplicated index prevention",()=> {
  var TableIndex = new IssueTableIndex_();
  var IssueTable1 = new IssueTable_();
  var IssueTable2 = new IssueTable_();
  IssueTable1.setMeta('tableId', 'table1_A');
  IssueTable2.setMeta('tableId', 'table2_B');

  // add same tables multiple times
  TableIndex.addTable(IssueTable1)
    .addTable(IssueTable2)
    .addTable(IssueTable1);

  // expected index data
  var indexData = {};
  indexData[IssueTable1.getSheetId()] = [
    IssueTable1.getTableId(), 
    IssueTable2.getTableId()
  ];

  expect(PropertiesService.getDocumentProperties).toBeCalled();
  expect(PropertiesService.mockDocumentProps.setProperty).toBeCalled();

  // values in IssueTable match passed values?
  expect(TableIndex.getTable('table1_A').getTableId()).toBe('table1_A');
  expect(TableIndex.getTable('table2_B').getTableId()).toBe('table2_B');
});

/*
Note for coding tests - working GAS tests


function findByTableId() {
  var table = IssueTableIndex_.getTable('tbl_rB2D5');
  if (!table) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Table Meta: %s', table.getMeta());
  }
}

function findAllBySheet() {
  //sheetId1: 602713257
  //sheetId2: 230234225
  var tables = IssueTableIndex_.getAllTablesBySheet(602713257);
  if (tables.length == 0) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', tables.length);
  }

  var tables = IssueTableIndex_.getAllTablesBySheet(230234225);
  if (tables.length == 0) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', tables.length);
  }
}

function findTableByCoord() {
  var table = IssueTableIndex_.getTableByCoord('230234225', 3, 4);
  if (!table) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', table);
  }
}

*/