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
