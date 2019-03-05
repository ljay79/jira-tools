const getCfg_ = require("../src/settings.gs").getCfg_;
const setCfg_ = require("../src/settings.gs").setCfg_;
const hasSettings = require("../src/settings.gs").hasSettings;

test('test settings methods', () => {
  expect(getCfg_('jira_url')).toBeNull();
  expect(getCfg_('jira_username')).toBeNull();
  expect(getCfg_('jira_password')).toBeNull();
  expect(hasSettings()).toBeFalsy();
  setCfg_('jira_url', "1");
  setCfg_('jira_username', "2");
  setCfg_('jira_password', "3");
  expect(hasSettings()).toBeTruthy();
  expect(getCfg_('jira_url')).toBe('1');
  expect(getCfg_('jira_username')).toBe('2');
  expect(getCfg_('jira_password')).toBe('3');
});
