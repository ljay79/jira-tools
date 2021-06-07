global.SpreadsheetApp = require('test/mocks/SpreadsheetApp');
global.environmentConfiguration = require('src/environmentConfiguration.gs');
global.EpicField = require('src/models/jira/EpicField.gs');
jiraApiMock = require('test/mocks/mockJiraApi.js');
jest.mock('src/settings.gs');
settingsMock = require('src/settings.gs');
debug = require('src/debug.gs').debug;
HtmlService = require('test/mocks/HtmlService');
PropertiesService = require('test/mocks/PropertiesService');
const getValues = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange().getValues;
const UserStorage = require("src/models/gas/UserStorage.gs");
const CustomFields = require('src/models/jira/CustomFields.gs');

beforeEach(() =>  {
    debug.enable(true);
    jest.resetModules();
    jiraApiMock = require('test/mocks/mockJiraApi.js');
    jiraApiMock.resetMocks();
    jest.mock('src/settings.gs');
    settingsMock = require('src/settings.gs');
    getValues.mockClear();
});

test('menuCreateChangelogReport', () => {
  const dialogCode = require("src/dialogs.gs");
  dialogCode.getDialog = jest.fn().mockImplementation(()=> HtmlService.dialogMock);
  // jiraApiMock.setNextJiraResponse(200, 'history', mockFieldJiraApiResponse);

  // mock settings...
  settingsMock.hasSettings.mockImplementationOnce(() => {
    return true;
  });

  var menuCreateChangelogReport = require('src/controllers/changelogReport.gs').menuCreateChangelogReport;
  menuCreateChangelogReport();

  expect(dialogCode.getDialog).toBeCalled();
  expect(dialogCode.getDialog.mock.calls[0][0]).toBe('views/sidebar/changelogReport');

  var params = dialogCode.getDialog.mock.calls[0][1];
  expect(params.only_my_filters).toBeDefined();
  expect(params.jiraFields).toBeDefined();

  expect(HtmlService.dialogMock.getContent).toBeCalled();
  expect(HtmlService.createHtmlOutput).toBeCalled();
  expect(HtmlService.htmlOutputMock.setTitle).toBeCalled();
  expect(HtmlService.htmlOutputMock.setTitle.mock.calls[0][0]).toBe('Create changelog report');
  expect(HtmlService.htmlOutputMock.setSandboxMode).toBeCalled();
  expect(HtmlService.htmlOutputMock.setSandboxMode.mock.calls[0][0]).toBe(HtmlService.SandboxMode.IFRAME);
});

//@TODO: create testing for ChangelogTable generation
