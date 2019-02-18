jiraApiMock = require('test/mocks/mockJiraApi.js');
debug = require("src/debug.gs").debug;
PropertiesService = require('test/mocks/PropertiesService');
global.environmentConfiguration = require('src/environmentConfiguration.gs');
const UserStorage = require("src/models/gas/UserStorage.gs");
global.EpicField = require("src/models/jira/EpicField.gs");
global.Browser = require('test/mocks/Browser');

beforeEach(() =>  {
    debug.enable(true);
    jest.resetModules();
    jiraApiMock = require('test/mocks/mockJiraApi.js');
    jiraApiMock.resetMocks();
});

test("menuUpdateJiraIssues", () => {
  jiraApiMock.setNextJiraResponse(200,"field",mockFieldJiraApiResponse);
  var menuUpdateJiraIssues = require('src/controllers/updateJiraIssues.gs').menuUpdateJiraIssues;
  menuUpdateJiraIssues();
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