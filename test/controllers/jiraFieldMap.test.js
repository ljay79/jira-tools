jiraApiMock = require('test/mocks/mockJiraApi.js');
HtmlService = require('test/mocks/HtmlService');
SpreadsheetApp = require('test/mocks/SpreadsheetApp');
debug = require("src/debug.gs").debug;
PropertiesService = require('test/mocks/PropertiesService');
global.environmentConfiguration = require('src/environmentConfiguration.gs');
const UserStorage = require("src/models/gas/UserStorage.gs");
global.EpicField = require("src/models/jira/EpicField.gs");

beforeEach(() =>  {
    jest.resetModules();
    jiraApiMock = require('test/mocks/mockJiraApi.js');
    jiraApiMock.resetMocks();
});

test("menuJiraFieldMap", () => {
  const dialogCode = require("src/dialogs.gs");
  dialogCode.getDialog = jest.fn().mockImplementation(()=> HtmlService.dialogMock);
  jiraApiMock.setNextJiraResponse(200,"field",mockFieldJiraApiResponse);
  var menuJiraFieldMap = require('src/controllers/jiraFieldMap.gs').menuJiraFieldMap;
  menuJiraFieldMap();
  expect(dialogCode.getDialog).toBeCalled();
  expect(dialogCode.getDialog.mock.calls[0][0]).toBe('views/sidebar/fieldMap');
  var params = dialogCode.getDialog.mock.calls[0][1];
  expect(params.fieldMap).toBeDefined();
  var fieldMap = params.fieldMap;
  expect(fieldMap.length).toBe(mockFieldJiraApiResponse.length);
  expect(fieldMap[0].key).toBe("custom0ZZ");
  expect(fieldMap[1].key).toBe("custom000");
  expect(fieldMap[2].key).toBe("custom001");
  expect(fieldMap[3].key).toBe("description");
  expect(fieldMap[4].key).toBe("Epic_label_key");
  
  expect(HtmlService.dialogMock.getContent).toBeCalled();
  expect(HtmlService.createHtmlOutput).toBeCalled();
  expect(HtmlService.htmlOutputMock.setTitle).toBeCalled();
  expect(HtmlService.htmlOutputMock.setTitle.mock.calls[0][0]).toBe('Jira Field Map');
  expect(HtmlService.htmlOutputMock.setSandboxMode).toBeCalled();
  expect(HtmlService.htmlOutputMock.setSandboxMode.mock.calls[0][0]).toBe(HtmlService.SandboxMode.IFRAME);

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