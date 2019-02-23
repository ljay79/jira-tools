global.environmentConfiguration = require('../../src/environmentConfiguration.gs');
global.PropertiesService = require('../mocks/PropertiesService');
global.SpreadsheetApp = require("../mocks/SpreadsheetApp");
const jiraCommon = require('../../src/jiraCommon.gs');
const IssueTable_ = require("../../src/models/jira/IssueTable.gs");
const IssueTableIndex_ = require("../../src/models/IssueTableIndex.gs");

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
  IssueTable1.setData('tableId', 'table1_Id');

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
