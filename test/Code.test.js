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
});
test('onOpen builds menu', () => {
  var onOpen = require('../src/Code.gs').onOpen;
  var e = {
    authMode: ScriptApp.AuthMode.NONE
  }
  onOpen(e);
  // a menu was build
  expect(SpreadsheetApp.getUi.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addToUi.mock.calls.length).toBe(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addItem.mock.calls.length).toBeGreaterThan(1);
  expect(SpreadsheetApp.getUi().createAddonMenu().addSeparator.mock.calls.length).toBeGreaterThan(1);
});

test('Update Jira menu option appears based on feature switch', () => {
  SpreadsheetApp.resetMocks();
  var onOpen = require('../src/Code.gs').onOpen;
  var e = {
    authMode: ScriptApp.AuthMode.LIMITED
  }
  // see how many menu items are created without the feature switch
  environmentConfiguration.features.updateJira.enabled = false;
  onOpen(e);
  var addItemMock =  SpreadsheetApp.getUi().createAddonMenu().addItem.mock;
  var menuItemsCreatedWithoutFeature = addItemMock.calls.length;
  expect(addItemMock.calls[menuItemsCreatedWithoutFeature-1][0]).not.toBe('Update Jira Issues (BETA)');
  expect(addItemMock.calls[menuItemsCreatedWithoutFeature-1][1]).not.toBe('dialogIssuesFromSheet');
  SpreadsheetApp.resetMocks();

  // now enable the feature and check if its added.
  environmentConfiguration.features.updateJira.enabled = true;
  onOpen(e);
  var addItemMock =  SpreadsheetApp.getUi().createAddonMenu().addItem.mock;
  var menuItemsCreatedWithFeature = addItemMock.calls.length;
  expect(menuItemsCreatedWithFeature).toBe(menuItemsCreatedWithoutFeature+1)
  expect(addItemMock.calls[menuItemsCreatedWithFeature-1][0]).toBe('Update Jira Issues (BETA)');
  expect(addItemMock.calls[menuItemsCreatedWithFeature-1][1]).toBe('dialogIssuesFromSheet');
  
});