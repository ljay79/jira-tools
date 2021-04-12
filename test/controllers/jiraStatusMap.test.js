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

beforeEach(() =>  {
    jest.resetModules();
    jiraApiMock = require('test/mocks/mockJiraApi.js');
    jiraApiMock.resetMocks();
  settingsMock = require('src/settings.gs');
});

test('menuJiraStatusMap', () => {
  const dialogCode = require("src/dialogs.gs");
  dialogCode.getDialog = jest.fn().mockImplementation(()=> HtmlService.dialogMock);
  // jiraApiMock.setNextJiraResponse(200, 'history', mockFieldJiraApiResponse);

  // mock settings...
  settingsMock.hasSettings.mockImplementationOnce(() => {
    return true;
  });
  var menuCreateStatusReport = require('src/controllers/changelogReport.gs').menuCreateStatusReport;
  menuCreateStatusReport();
  expect(dialogCode.getDialog).toBeCalled();
  expect(dialogCode.getDialog.mock.calls[0][0]).toBe('views/dialogs/createStatusReport');
  // var params = dialogCode.getDialog.mock.calls[0][1];
  // expect(params.fieldMap).toBeDefined();
  // var fieldMap = params.fieldMap;
  // expect(fieldMap.length).toBe(mockChangelogJiraApiResponse.length);
  // expect(fieldMap[0].key).toBe("custom0ZZ");
  // expect(fieldMap[1].key).toBe("custom000");
  // expect(fieldMap[2].key).toBe("custom001");
  // expect(fieldMap[3].key).toBe("description");
  // expect(fieldMap[4].key).toBe("Epic_label_key");

  // expect(HtmlService.dialogMock.getContent).toBeCalled();
  // expect(HtmlService.createHtmlOutput).toBeCalled();
  // expect(HtmlService.htmlOutputMock.setTitle).toBeCalled();
  // expect(HtmlService.htmlOutputMock.setTitle.mock.calls[0][0]).toBe('Jira Status Map');
  // expect(HtmlService.htmlOutputMock.setSandboxMode).toBeCalled();
  // expect(HtmlService.htmlOutputMock.setSandboxMode.mock.calls[0][0]).toBe(HtmlService.SandboxMode.IFRAME);
});


test("history entries should be returned", () => {
  //jiraApiMock.setAllResponsesSuccesfull(200, mockFieldJiraApiResponse);
  jiraApiMock.setNextJiraResponse(200, "history", mockChangelogJiraApiResponse);
  var ChangelogTable = require('src/controllers/changelogReport.gs').ChangelogTable;
  var histories = callbackFetchAllHistories();
  // fields returned should only have custom fields from the mock data
  expect(histories.length).toBe(1);
  expect(histories[0].field).toBe("status");
  expect(histories[0].toString).toBe("Done");
  expect(histories[0].fromString).toBe("in Progress");
});


var mockChangelogJiraApiResponse = [
  {
    field: "status",
    to: 1123,
    toString: "Done",
    from: 2233,
    fromString: "in Progress"
  }
];
