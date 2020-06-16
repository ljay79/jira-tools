/**
 * Tests based on documentation here
 * https://developers.google.com/gsuite/add-ons/concepts/addon-authorization#editor_add-on_authorization
 */

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
  onOpen(e);
  var addItemMock =  SpreadsheetApp.getUi().createAddonMenu().addItem.mock;
  var menuItemCount = addItemMock.calls.length;
  expect(addItemMock.calls[menuItemCount-7][0]).toBe('Update Jira Issues');
  expect(addItemMock.calls[menuItemCount-7][1]).toBe('menuUpdateJiraIssues');
  SpreadsheetApp.resetMocks();
});
