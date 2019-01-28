/**
 * Tests based on documentation here
 * https://developers.google.com/gsuite/add-ons/concepts/addon-authorization#editor_add-on_authorization

 */

const ScriptApp = require('./mocks/ScriptApp');
const PropertiesService = require('./mocks/PropertiesService');
const SpreadsheetApp = require('./mocks/SpreadsheetApp');
environmentConfiguration = require('../src/environmentConfiguration.gs');

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
  expect(PropertiesService.getUserProperties().getProperty.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addSeparator.mock.calls.length).toBeGreaterThan(1);


  SpreadsheetApp.resetMocks();
  PropertiesService.resetMocks();
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
  expect(PropertiesService.getUserProperties().getProperty.mock.calls.length).toBe(1);
});


test('check if debug mode is turned on appropriately', () => {
  var extend = require('../src/jsLib.gs').extend;
  // covering all the scenarios
  // userDebug - has the use selected debugging (stored in user preferences)
  // defaultDebug - value for debug set in enviroment config
  // authmode - value of authmode the plugin should run in. This impacts access to user preferences
  // debugIsEnabled - will debug actually be enabled - the expected outcome
  var scenarioList = [
    { userDebug: false, defaultDebug: false, authmode: ScriptApp.AuthMode.NONE, debugIsEnabled: false },
    { userDebug: false, defaultDebug: false, authmode: ScriptApp.AuthMode.LIMITED, debugIsEnabled: false },
    { userDebug: false, defaultDebug: false, authmode: ScriptApp.AuthMode.FULL, debugIsEnabled: false },
    { userDebug: true, defaultDebug: false, authmode: ScriptApp.AuthMode.NONE, debugIsEnabled: false },
    { userDebug: true, defaultDebug: false, authmode: ScriptApp.AuthMode.LIMITED, debugIsEnabled: true },
    { userDebug: true, defaultDebug: false, authmode: ScriptApp.AuthMode.FULL, debugIsEnabled: true },
    // { userDebug: true, defaultDebug: true, authmode: ScriptApp.AuthMode.NONE, debugIsEnabled: true },
    { userDebug: true, defaultDebug: true, authmode: ScriptApp.AuthMode.LIMITED, debugIsEnabled: true },
    { userDebug: true, defaultDebug: true, authmode: ScriptApp.AuthMode.FULL, debugIsEnabled: true },
    //{ userDebug: false, defaultDebug: true, authmode: ScriptApp.AuthMode.NONE, debugIsEnabled: true },
    //{ userDebug: false, defaultDebug: true, authmode: ScriptApp.AuthMode.LIMITED, debugIsEnabled: true },
    // { userDebug: false, defaultDebug: true, authmode: ScriptApp.AuthMode.FULL, debugIsEnabled: true },
  ];
  scenarioList.forEach((scenario) => {
    // reset the test environment and mocks from previous tests
    SpreadsheetApp.resetMocks();
    PropertiesService.resetMocks();
    // set up the values from the scenario
    PropertiesService.getUserProperties.mockImplementation(() => {
      if (scenario.authmode == ScriptApp.AuthMode.NONE) {
        throw Error("This is not available when in ScriptApp.AuthMode.NONE");
      }
      return PropertiesService.mockUserProps;
    });
    PropertiesService.mockUserProps.getProperty.mockImplementation(() => {
      if (scenario.userDebug === true) {
        return "true";
      }
      return "false"
    });
    if (scenario.defaultDebug) {
      environmentConfiguration.debugEnabled = true;
    }
    var e = {
      authMode: scenario.authmode
    }
    // track the value sent to debug.enable to see whether it is activated or not.
    var finalDebugState = false; // by default debugging is not on
    debug.enable = jest.fn().mockImplementation((enabled) => {
      finalDebugState = enabled;
    });

    // run the onOpen method.
    var onOpen = require('../src/Code.gs').onOpen;
    onOpen(e);
    // put the final state into an object and compare to the desired scenario in a test
    var actual = extend({}, scenario);
    actual.debugIsEnabled = finalDebugState;
    expect(actual).toEqual(scenario);
  });
});
