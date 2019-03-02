const getCfg_ = require("../src/settings.gs").getCfg_;
const setCfg_ = require("../src/settings.gs").setCfg_;
const hasSettings = require("../src/settings.gs").hasSettings;
global.PropertiesService = require('./mocks/PropertiesService');

test('test hasSettings method', () => {
  expect(hasSettings()).toBeFalsy();
  setCfg_('jira_url', "1");
  setCfg_('jira_username', "1");
  setCfg_('jira_password', "1");
});
