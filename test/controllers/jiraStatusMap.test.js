jiraApiMock = require('test/mocks/mockJiraApi.js');
jest.mock('src/settings.gs');
settingsMock = require('src/settings.gs');
HtmlService = require('test/mocks/HtmlService');
SpreadsheetApp = require('test/mocks/SpreadsheetApp');
debug = require('src/debug.gs').debug;
PropertiesService = require('test/mocks/PropertiesService');
global.environmentConfiguration = require('src/environmentConfiguration.gs');
const UserStorage = require('src/models/gas/UserStorage.gs');
const CustomFields = require('src/models/jira/CustomFields.gs');
global.EpicField = require('src/models/jira/EpicField.gs');

beforeEach(() => {
  debug.enable(true);
  jest.resetModules();
  const jiraApiMock = require('test/mocks/mockJiraApi.js');
  jiraApiMock.resetMocks();
  settingsMock = require('src/settings.gs');
});

test('menuJiraStatusMap', () => {
  const dialogCode = require('src/dialogs.gs');
  dialogCode.getDialog = jest.fn().mockImplementation(()=> HtmlService.dialogMock);
  // jiraApiMock.setNextJiraResponse(200, 'history', mockFieldJiraApiResponse);

  // mock settings...
  settingsMock.hasSettings.mockImplementationOnce(() => {
    return true;
  });
  var menuCreateStatusReport = require('src/controllers/statusReport.ts').menuCreateStatusReport;
  menuCreateStatusReport();
  expect(dialogCode.getDialog).toBeCalled();
  expect(dialogCode.getDialog.mock.calls[0][0]).toBe('views/dialogs/createStatusReport');
  // var params = dialogCode.getDialog.mock.calls[0][1];
  // expect(params.fieldMap).toBeDefined();
  // var fieldMap = params.fieldMap;
  // expect(fieldMap.length).toBe(mockFieldJiraApiResponse.length);
  // expect(fieldMap[0].key).toBe('custom0ZZ');
  // expect(fieldMap[1].key).toBe('custom000');
  // expect(fieldMap[2].key).toBe('custom001');
  // expect(fieldMap[3].key).toBe('description');
  // expect(fieldMap[4].key).toBe('Epic_label_key');

  // expect(HtmlService.dialogMock.getContent).toBeCalled();
  // expect(HtmlService.createHtmlOutput).toBeCalled();
  // expect(HtmlService.htmlOutputMock.setTitle).toBeCalled();
  // expect(HtmlService.htmlOutputMock.setTitle.mock.calls[0][0]).toBe('Jira Status Map');
  // expect(HtmlService.htmlOutputMock.setSandboxMode).toBeCalled();
  // expect(HtmlService.htmlOutputMock.setSandboxMode.mock.calls[0][0]).toBe(HtmlService.SandboxMode.IFRAME);
});


test("history entries should be returned", () => {
  jiraApiMock.setAllResponsesSuccesfull(200, mockFieldJiraApiResponse);
  // jiraApiMock.setNextJiraResponse(200, "history", mockFieldJiraApiResponse);
  var callbackFetchAllHistories = require('src/controllers/statusReport.ts').callbackFetchAllHistories;
  var histories = callbackFetchAllHistories();
  // fields returned should only have custom fields from the mock data
  expect(histories.length).toBe(6);
  // sorted correctly?
  expect(histories[0].name).toBe("Epic");
  expect(histories[1].name).toBe("Custom 0");
  expect(histories[2].name).toBe("Custom 1");
  expect(histories[3].name).toBe("Epic Label");
  expect(histories[4].name).toBe("Epic Link");
  expect(histories[5].name).toBe("AA Not Supported");
  // correct fields should be set
  expect(histories[0].key).toBe("jst_epic");
  expect(histories[1].key).toBe("custom000");
  expect(histories[1].supported).toBe(true);
  expect(histories[1].schemaType).toBe("string");
  expect(histories[2].key).toBe("custom001");
  expect(histories[2].supported).toBe(true);
  expect(histories[2].schemaType).toBe("number");
  expect(histories[5].key).toBe("custom0ZZ");
  expect(histories[5].supported).toBe(false);
  expect(histories[5].schemaType).toBe("notsupported");
  // epic should be set
  var epicField = EpicField.getJson();
  expect(epicField.key).toBe("jst_epic");
  expect(epicField.name).toBe('Epic');
  expect(epicField.link_key).toBe('Epic_link_key');
  expect(epicField.label_key).toBe('Epic_label_key');
  expect(epicField.usable).toBe(true);
});


var mockFieldJiraApiResponse = [
  {
    'id': 'custom0ZZ',
    'name': 'AA Not Supported',
    'custom': true,
    'orderable': true,
    'navigable': true,
    'searchable': true,
    'clauseNames': [
      'description'
    ],
    'schema': {
      'type': 'notsupported',
      'system': 'description'
    }
  },
  {
    'id': 'custom001',
    'name': 'Custom 1',
    'custom': true,
    'orderable': true,
    'navigable': true,
    'searchable': true,
    'clauseNames': [
      'description'
    ],
    'schema': {
      'type': 'number',
      'system': 'description'
    }
  },
  {
    'id': 'description',
    'name': 'Description',
    'custom': false,
    'orderable': true,
    'navigable': true,
    'searchable': true,
    'clauseNames': [
      'description'
    ],
    'schema': {
      'type': 'string',
      'system': 'description'
    }
  },
  {
    'id': 'summary',
    'key': 'summary',
    'name': 'Summary',
    'custom': false,
    'orderable': true,
    'navigable': true,
    'searchable': true,
    'clauseNames': [
      'summary'
    ],
    'schema': {
      'type': 'string',
      'system': 'summary'
    }
  },
  {
    'id': 'custom000',
    'name': 'Custom 0',
    'custom': true,
    'orderable': true,
    'navigable': true,
    'searchable': true,
    'clauseNames': [
      'description'
    ],
    'schema': {
      'type': 'string',
      'system': 'description'
    }
  },
  {
    'id': 'Epic_link_key',
    'name': 'Epic Link',
    'custom': true,
    'orderable': true,
    'navigable': true,
    'searchable': true,
    'clauseNames': [
      'description'
    ],
    'schema': {
      'custom': ':gh-epic-link',
      'type': 'string',
      'system': 'description'
    }
  },
  {
    'id': 'Epic_label_key',
    'name': 'Epic Label',
    'custom': true,
    'orderable': true,
    'navigable': true,
    'searchable': true,
    'clauseNames': [
      'description'
    ],
    'schema': {
      'custom': ':gh-epic-label',
      'type': 'string',
      'system': 'description'
    }
  }
];
