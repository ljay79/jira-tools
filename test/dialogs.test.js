
global.environmentConfiguration = require('../src/environmentConfiguration.gs');
PropertiesService = require('./mocks/PropertiesService');
HtmlService = require('./mocks/HtmlService');
Session = require('./mocks/Session');
SpreadsheetApp = require('./mocks/SpreadsheetApp');
BUILD = "";
const debug = require("../src/debug.gs").debug;

test("About dialog is populated with correct values", () => {
  var dialogAbout = require('../src/dialogs.gs').dialogAbout;
  global.environmentConfiguration.name = "UNITTEST";
  BUILD = "UNIT-TEST-BUILD";
  dialogAbout();
  expect(HtmlService.createTemplateFromFile).toBeCalled();
  expect(HtmlService.createTemplateFromFile.mock.calls[0][0]).toBe('dialogAbout');
  var templateParams = HtmlService.templateMock;
  expect(templateParams.buildNumber).toBe("UNIT-TEST-BUILD");
  expect(templateParams.environmentConfiguration).toBe(environmentConfiguration);
  expect(templateParams.environmentConfiguration.name).toBe("UNITTEST");
  expect(templateParams.debugEnabled).toBe(debug.isEnabled());
  expect(HtmlService.dialogMock.setWidth).toBeCalledTimes(1);
  expect(HtmlService.dialogMock.setWidth.mock.calls[0][0]).toBe(480);
  expect(HtmlService.dialogMock.setHeight).toBeCalledTimes(1);
  expect(HtmlService.dialogMock.setHeight.mock.calls[0][0]).toBe(400);
  expect(HtmlService.dialogMock.setSandboxMode).toBeCalledTimes(1);
  expect(HtmlService.dialogMock.setSandboxMode.mock.calls[0][0]).toBe("IFRAME");


  expect(SpreadsheetApp.getUi().showModalDialog).toBeCalledTimes(1);
  expect(SpreadsheetApp.getUi().showModalDialog.mock.calls[0][1]).toBe('About');

});