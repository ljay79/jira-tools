const getCfg = require("../src/settings.gs").getCfg;
const setCfg = require("../src/settings.gs").setCfg;
const hasSettings = require("../src/settings.gs").hasSettings;
global.PropertiesService = require('./mocks/PropertiesService');

test('test hasSettings method', () => {
  expect(hasSettings()).toBeFalsy();
  setCfg('jira_url', "1");
  setCfg('jira_username', "2");
  setCfg('jira_password', "3");

  expect(getCfg('jira_url')).toBe("1");
  expect(getCfg('jira_username')).toBe("2");
  expect(getCfg('jira_password')).toBe("3");
});
