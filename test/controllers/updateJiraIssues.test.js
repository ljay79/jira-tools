jiraApiMock = require('test/mocks/mockJiraApi.js');
jest.mock('src/settings.gs');
settingsMock = require('src/settings.gs');
debug = require("src/debug.gs").debug;
PropertiesService = require('test/mocks/PropertiesService');
SpreadsheetApp = require('test/mocks/SpreadsheetApp');
const getValues = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange().getValues
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
});

test("menuUpdateJiraIssues", () => {
  const dialogCode = require("src/dialogs.gs");
  dialogCode.getDialog = jest.fn().mockImplementation(()=> HtmlService.dialogMock);
  jiraApiMock.setNextJiraResponse(200,"field",mockFieldJiraApiResponse);
  var menuUpdateJiraIssues = require('src/controllers/updateJiraIssues.gs').menuUpdateJiraIssues;
  
  // no settings...
  settingsMock.hasSettings.mockImplementationOnce(() => {
    return false;
  });
  menuUpdateJiraIssues();
  // should have called hasSettings and done nothing else
  expect(settingsMock.hasSettings).toBeCalled();
  settingsMock.hasSettings.mockImplementationOnce(() => {
    return true;
  });
  // no values selected
  getValues.mockImplementationOnce(() => [])
  menuUpdateJiraIssues();
  expect(settingsMock.hasSettings).toBeCalled();
  expect(dialogCode.getDialog).toBeCalled();
  expect(dialogCode.getDialog.mock.calls[0][0]).toBe('views/dialogs/updateJiraIssues');
  var params = dialogCode.getDialog.mock.calls[0][1];
  expect(params.headerFields).toBeDefined();
  expect(params.headerFields).toEqual({});
  expect(params.dataRows).toEqual([]);
  /*setCfg('jira_url', "1");
  setCfg('jira_username', "1");
  setCfg('jira_password', "1");*/
});

test("menuUpdateJiraIssues", () => {
  jiraApiMock.setNextJiraResponse(200,"field",mockFieldJiraApiResponse);
  var callbackProcessIssuesFromSheet = require('src/controllers/updateJiraIssues.gs').callbackProcessIssuesFromSheet;
  callbackProcessIssuesFromSheet();
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