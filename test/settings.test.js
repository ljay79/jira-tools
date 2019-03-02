const getCfg = require("../src/settings.gs").getCfg;
const setCfg = require("../src/settings.gs").setCfg;
const hasSettings = require("../src/settings.gs").hasSettings;

test('test settings methods', () => {
  expect(getCfg('jira_url')).toBeNull();
  expect(getCfg('jira_username')).toBeNull();
  expect(getCfg('jira_password')).toBeNull();
  expect(hasSettings()).toBeFalsy();
  setCfg('jira_url', "1");
  setCfg('jira_username', "2");
  setCfg('jira_password', "3");
  expect(hasSettings()).toBeTruthy();
  expect(getCfg('jira_url')).toBe('1');
  expect(getCfg('jira_username')).toBe('2');
  expect(getCfg('jira_password')).toBe('3');
});
