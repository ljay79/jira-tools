const getCfg = require("../src/settings.gs").getCfg;
const setCfg = require("../src/settings.gs").setCfg;
const hasSettings = require("../src/settings.gs").hasSettings;

test('test hasSettings method', () => {
    expect(hasSettings()).toBeFalsy();
    setCfg('jira_url',"1");
    setCfg('jira_username',"1");
    setCfg('jira_password',"1");
});