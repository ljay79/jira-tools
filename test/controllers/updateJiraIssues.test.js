jiraApiMock = require('test/mocks/mockJiraApi.js');
jest.mock('src/settings.gs');
settingsMock = require('src/settings.gs');
debug = require("src/debug.gs").debug;
PropertiesService = require('test/mocks/PropertiesService');
SpreadsheetApp = require('test/mocks/SpreadsheetApp');
const getValues = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange().getValues;
global.environmentConfiguration = require('src/environmentConfiguration.gs');
const UserStorage = require("src/models/gas/UserStorage.gs");
HtmlService = require('test/mocks/HtmlService');
global.EpicField = require("src/models/jira/EpicField.gs");
global.Browser = require('test/mocks/Browser');

beforeEach(() =>  {
    debug.enable(true);
    jest.resetModules();
    jiraApiMock = require('test/mocks/mockJiraApi.js');
    jiraApiMock.resetMocks();
    jest.mock('src/settings.gs');
    settingsMock = require('src/settings.gs');
    getValues.mockClear();
});

test("menuUpdateJiraIssues", () => {
  const dialogCode = require("src/dialogs.gs");
  dialogCode.getDialog = jest.fn().mockImplementation(()=> HtmlService.dialogMock);
  //jiraApiMock.setNextJiraResponse(200,"field",mockFieldJiraApiResponse);
  var menuUpdateJiraIssues = require('src/controllers/updateJiraIssues.gs').menuUpdateJiraIssues;
  
  // no settings...
  settingsMock.hasSettings.mockImplementationOnce(() => {
    return false;
  });
  menuUpdateJiraIssues();
  // should have called hasSettings and done nothing else
  expect(settingsMock.hasSettings).toBeCalled();
  expect(getValues).not.toBeCalled();
  
  settingsMock.hasSettings.mockImplementation(() => {
    return true;
  });
  // no values selected
  getValues.mockImplementationOnce(() => []);
  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    return JSON.stringify([
      {key:"custom1",name:"Custom 1"},
      {key:"custom2",name:"Custom 2"}
    ]
      
    );
  });
  menuUpdateJiraIssues();
  expect(settingsMock.hasSettings).toBeCalled();
  expect(dialogCode.getDialog).toBeCalled();
  expect(dialogCode.getDialog.mock.calls[0][0]).toBe('views/dialogs/updateJiraIssues');
  var params = dialogCode.getDialog.mock.calls[0][1];
  expect(params.headerFields).toBeDefined();
  expect(params.headerFields).toEqual({});
  expect(params.dataRows).toBeDefined();
  expect(params.dataRows).toEqual([]);
  expect(params.readOnlyFields).toBeDefined();
  expect(params.readOnlyFields["updated"]).toBeTruthy();
  expect(params.readOnlyFields["created"]).toBeTruthy();
  expect(params.allJiraFields).toBeDefined();
  expect(params.allJiraFields.summary).toBe("Summary");
  expect(params.allJiraFields.custom1).toBe("Custom 1");
  expect(params.allJiraFields.custom2).toBe("Custom 2");
  expect(params.allJiraFields[""]).toBe("select a jira field...");
  expect(params.allJiraFields.issueKey).toBe("Key");
  expect(Object.keys(params.allJiraFields).length).toBeGreaterThan(5);
  
  getValues.mockClear();
  dialogCode.getDialog.mockClear();
  getValues.mockImplementationOnce(() => [["a","b"]]);
  menuUpdateJiraIssues();
  expect(getValues).toBeCalled()
  expect(dialogCode.getDialog).toBeCalled();;
  var params = dialogCode.getDialog.mock.calls[0][1];
  expect(params.headerFields).toBeDefined();
  expect(params.headerFields).toEqual({"a":0,"b":1});
  expect(params.dataRows).toBeDefined();
  expect(params.dataRows).toEqual([]);
  expect(params.readOnlyFields).toBeDefined();
  expect(params.allJiraFields).toBeDefined();


  getValues.mockClear();
  getValues.mockImplementationOnce(() => [["a","","b"]]);
  dialogCode.getDialog.mockClear();
  menuUpdateJiraIssues();
  expect(dialogCode.getDialog).toBeCalled();
  var params = dialogCode.getDialog.mock.calls[0][1];
  expect(params.headerFields).toBeDefined();
  expect(params.headerFields).toEqual({"a":0,"b":2});
  expect(params.dataRows).toBeDefined();
  expect(params.dataRows).toEqual([]);
  expect(params.readOnlyFields).toBeDefined();
  expect(params.allJiraFields).toBeDefined();

  getValues.mockClear();
  getValues.mockImplementationOnce(() => [["a","","b"],["c","d","e"],["f","g","h"]]);
  dialogCode.getDialog.mockClear();
  menuUpdateJiraIssues();
  expect(dialogCode.getDialog).toBeCalled();
  var params = dialogCode.getDialog.mock.calls[0][1];
  expect(params.headerFields).toBeDefined();
  expect(params.headerFields).toEqual({"a":0,"b":2});
  expect(params.dataRows).toBeDefined();
  expect(params.dataRows.length).toBe(2);
  expect(params.dataRows[0]).toEqual(["c","d","e"]);
  expect(params.dataRows[1]).toEqual(["f","g","h"]);
  expect(params.readOnlyFields).toBeDefined();
  expect(params.allJiraFields).toBeDefined();

});

test("menuUpdateJiraIssues", () => {
  //jiraApiMock.setNextJiraResponse(200,"field",mockFieldJiraApiResponse);
  var callbackProcessIssuesFromSheet = require('src/controllers/updateJiraIssues.gs').callbackProcessIssuesFromSheet;
  callbackProcessIssuesFromSheet();
  settingsMock.hasSettings.mockImplementationOnce(() => {
    return false;
  });
  expect(settingsMock.hasSettings).toBeCalled();
  expect(getValues).not.toBeCalled();
});



var mockFieldJiraApiResponse = [
  {
    "id": "custom0ZZ",
    "name": "AA Not Supported",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "type": "notsupported",
      "system": "description"
    }
  },
  {
    "id": "custom001",
    "name": "Custom 1",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "type": "number",
      "system": "description"
    }
  },
  {
    "id": "description",
    "name": "Description",
    "custom": false,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "type": "string",
      "system": "description"
    }
  },
  {
    "id": "summary",
    "key": "summary",
    "name": "Summary",
    "custom": false,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "summary"
    ],
    "schema": {
      "type": "string",
      "system": "summary"
    }
  },
  {
    "id": "custom000",
    "name": "Custom 0",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "type": "string",
      "system": "description"
    }
  },
  {
    "id": "Epic_link_key",
    "name": "Epic Link",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "custom": ":gh-epic-link",
      "type": "string",
      "system": "description"
    }
  },
  {
    "id": "Epic_label_key",
    "name": "Epic Label",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "custom": ":gh-epic-label",
      "type": "string",
      "system": "description"
    }
  }
];