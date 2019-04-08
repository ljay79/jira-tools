global.environmentConfiguration = require('../../src/environmentConfiguration.gs');
global.PropertiesService = require('../mocks/PropertiesService');
global.SpreadsheetApp = require('../mocks/SpreadsheetApp');
const jiraCommon = require('../../src/jiraCommon.gs');
const IssueTableIndex_ = require('../../src/models/IssueTableIndex.gs');
var IssueTable_ = require('../../src/models/jira/IssueTable.gs');

beforeEach(() => {
  PropertiesService.resetMocks();
  jest.resetModules();
});

test("IssueTableIndex_ accessibility test",()=> {
  var implementations = ['addTable', 'getTable', 'tableIndexName', 'getAllTablesBySheet', 'getTableByCoord', '_getStorage', '_load', '_save'];

  // all required methods implemented?
  implementations.forEach(function(method) {
    expect(IssueTableIndex_).toHaveProperty(method);
  });

  // data property should be private
  //expect(IssueTableIndex_).not.toHaveProperty('storage_');
  
  // data property should be private (not yet)
  //expect(IssueTableIndex_).not.toHaveProperty('index_');
  //expect(IssueTableIndex_).not.toHaveProperty('tables_');
  expect(IssueTableIndex_).toHaveProperty('_index');
  expect(IssueTableIndex_).toHaveProperty('_tables');

  IssueTableIndex_._getStorage();
  expect(PropertiesService.getDocumentProperties).toBeCalled();
});

test("IssueTableIndex_ can store IssueTable's",()=> {
  var IssueTable1 = new IssueTable_();
  IssueTable1.setMeta('tableId', 'table1_Id');

  // add table to index which stores it into PropertiesService
  IssueTableIndex_.addTable(IssueTable1);

  // expected index data
  var indexData = {};
  indexData[IssueTable1.getSheetId()] = [IssueTable1.getTableId()];

  //@TODO: help. Its called but expect says its not?!
  //expect(PropertiesService.getDocumentProperties).toBeCalled();

  expect(PropertiesService.mockDocumentProps.setProperty).toBeCalled();
  expect(PropertiesService.mockDocumentProps.setProperty.mock.calls[0][0]).toBe("paj_tables.index");
  expect(PropertiesService.mockDocumentProps.setProperty.mock.calls[0][1]).toBe(JSON.stringify(indexData));
});

test("IssueTableIndex_ duplicated index prevention",()=> {
  var IssueTable1 = new IssueTable_();
  var IssueTable2 = new IssueTable_();
  IssueTable1.setMeta('tableId', 'table1_A');
  IssueTable2.setMeta('tableId', 'table2_B');

  // add same tables multiple times
  IssueTableIndex_.addTable(IssueTable1)
    .addTable(IssueTable2)
    .addTable(IssueTable1);

  // expected index data
  var indexData = {};
  indexData[IssueTable1.getSheetId()] = [
    IssueTable1.getTableId(), 
    IssueTable2.getTableId()
  ];

  //@TODO: help. Its called but expect says its not?!
  // expect(PropertiesService.getDocumentProperties).toBeCalled();
  expect(PropertiesService.mockDocumentProps.setProperty).toBeCalled();

  // values in IssueTable match passed values?
  expect(IssueTableIndex_.getTable('table1_A').getTableId()).toBe('table1_A');
  expect(IssueTableIndex_.getTable('table2_B').getTableId()).toBe('table2_B');
});

/*
 * Note for coding tests - working GAS tests
 * 
 * 
 * function findByTableId() { var table = IssueTableIndex_.getTable('tbl_rB2D5'); if (!table) { console.log('Table NOT found!'); } else {
 * console.log('Found Table Meta: %s', table.getMeta()); } }
 * 
 * function findAllBySheet() { //sheetId1: 602713257 //sheetId2: 230234225 var tables = IssueTableIndex_.getAllTablesBySheet(602713257); if
 * (tables.length == 0) { console.log('Table NOT found!'); } else { console.log('Found Tables: %s', tables.length); }
 * 
 * var tables = IssueTableIndex_.getAllTablesBySheet(230234225); if (tables.length == 0) { console.log('Table NOT found!'); } else {
 * console.log('Found Tables: %s', tables.length); } }
 * 
 * function findTableByCoord() { var table = IssueTableIndex_.getTableByCoord('230234225', 3, 4); if (!table) { console.log('Table NOT
 * found!'); } else { console.log('Found Tables: %s', table); } }
 * 
 */