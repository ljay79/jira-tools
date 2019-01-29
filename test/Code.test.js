/**
 * Tests based on documentation here
 * https://developers.google.com/gsuite/add-ons/concepts/addon-authorization#editor_add-on_authorization

 */

ScriptApp = require('./mocks/ScriptApp');
PropertiesService = require('./mocks/PropertiesService');
SpreadsheetApp = require('./mocks/SpreadsheetApp');
environmentConfiguration = require('../src/environmentConfiguration.gs');
debug = require('../src/debug.gs').debug;

beforeEach(() => {
  SpreadsheetApp.resetMocks();
  PropertiesService.resetMocks(); 
});
test('onOpen function in various authmodes', () => {
  var onOpen = require('../src/Code.gs').onOpen;
  var e = {
    authMode: ScriptApp.AuthMode.NONE
  }
  // getUserProperties will throw an exception when in ScriptApp.AuthMode.NONE
  PropertiesService.getUserProperties.mockImplementation(() => {
    throw Error("This is not available when in ScriptApp.AuthMode.NONE")
  });
  onOpen(e);
  // a menu was build
  expect(SpreadsheetApp.getUi.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addToUi.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addItem.mock.calls.length).toBeGreaterThan(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addSeparator.mock.calls.length).toBeGreaterThan(1);

  // properties service was not used 
  expect(PropertiesService.getUserProperties.mock.calls.length).toBe(0);


  SpreadsheetApp.resetMocks();
  PropertiesService.resetMocks(); // clear exception throwing mock implementation 
  e.authMode = ScriptApp.AuthMode.LIMITED;
  onOpen(e);
  // a menu was build
  expect(SpreadsheetApp.getUi.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addToUi.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addItem.mock.calls.length).toBeGreaterThan(1);
  // properties service was not used 
  expect(PropertiesService.getUserProperties().getProperty.mock.calls.length).toBe(0);
  expect(SpreadsheetApp.getUi().createAddonMenu().addSeparator.mock.calls.length).toBeGreaterThan(1);


  SpreadsheetApp.resetMocks();
  PropertiesService.getUserProperties().getProperty.mockImplementation(() => "false");
  e.authMode = ScriptApp.AuthMode.FULL;
  onOpen(e);
  // a menu was built
  expect(SpreadsheetApp.getUi.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addToUi.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addItem.mock.calls.length).toBeGreaterThan(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addSeparator.mock.calls.length).toBeGreaterThan(1);
  // properties service WAS used 
  //expect(PropertiesService.getUserProperties().getProperty.mock.calls.length).toBe(1);
});
