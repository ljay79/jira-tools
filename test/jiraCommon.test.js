jiraApiMock = require('./mocks/mockJiraApi.js');
const getCfg_ = require("../src/settings.gs").getCfg_;
const setCfg_ = require("../src/settings.gs").setCfg_;
const UserStorage = require("src/models/gas/UserStorage.gs");

test("Call to retrieve an issues status", function() {
    jiraApiMock.resetMocks();
    const getIssue = require('../src/jiraCommon.gs').getIssue;
    var response = getIssue("PBI-222");
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-222");
    expect(Object.keys(jiraApiMock.call.mock.calls[0][1]).length).toBe(1);
});

test("unifyIssueAttrib ", () => {
  const unifyIssueAttrib = require('../src/jiraCommon.gs').unifyIssueAttrib;
  var testIssue = {
    fields: {
      summary: "A summary",
      description: "This is the description",
      environment: "An environment",
      customfield_epic_link: "EPC-22",
      customfield_custom1: 22,
      customfield_custom2: "hello",
      customfield_custom3: { value:"option_value"},
      customfield_stringArray: ["one","two","three"],
      customfield_stringArray2: [],
      customfield_stringArray3: ["one"],
      customfield_versions: [{name:"version1"},{name:"version2"}],
      customfield_emptyversions: [],
      customfield_version_unreleased: {name:"unreleased version",released: false},
      customfield_version_released: {name:"released version",released: true},
      components: [{name:"component 1"},{name:"component 2"}],
      fixVersions: [{name:"fix Version 1"}],
      versions: []
    }
  }
  initJiraDummyConfig();
  expect(EpicField.isUsable()).toBeTruthy();
  expect(getCfg_('jira_url')).toBe("https://jiraserver");
  UserStorage.setValue(
    "favoriteCustomFields",
    [
      {key:"customfield_custom1",name:"Custom 1",type: "number"},
      {key:"customfield_custom2",name:"Custom 2",schemaType: "string"},
      {key:"customfield_custom3",name:"Custom 3",schemaType: "option"},
      {key:"customfield_stringArray",name:"String Array",schemaType: "array|string"},
      {key:"customfield_stringArray2",name:"String Array",schemaType: "array|string"},
      {key:"customfield_stringArray3",name:"String Array",schemaType: "array|string"},
      {key:"customfield_versions",name:"Version Array",schemaType: "array|versions"},
      {key:"customfield_emptyversions",name:"Empty Version Array",schemaType: "array|versions"},
      {key:"customfield_version_released",name:"Version",schemaType: "versions"},
      {key:"customfield_version_unreleased",name:"Version",schemaType: "versions"},
      
      
    ]
  );
  expect(unifyIssueAttrib("summary",testIssue).value).toBe("A summary");
  expect(unifyIssueAttrib("description",testIssue).value).toBe("This is the description");
  expect(unifyIssueAttrib("environment",testIssue).value).toBe("An environment");
  var epicResult = unifyIssueAttrib("customfield_epic_link",testIssue);
  expect(epicResult.value).toBe("EPC-22");
  expect(epicResult.link).toBe("https://jiraserver/browse/EPC-22");
  expect(unifyIssueAttrib("customfield_custom1",testIssue).value).toBe(22);
  expect(unifyIssueAttrib("customfield_custom1",testIssue).format).toBe("0");
  expect(unifyIssueAttrib("customfield_custom2",testIssue).value).toBe("hello");
  expect(unifyIssueAttrib("customfield_custom3",testIssue).value).toBe("option_value");
  expect(unifyIssueAttrib("customfield_stringArray",testIssue).value).toBe("one,two,three");
  expect(unifyIssueAttrib("customfield_stringArray2",testIssue).value).toBe("");
  expect(unifyIssueAttrib("customfield_stringArray3",testIssue).value).toBe("one");
  expect(unifyIssueAttrib("customfield_versions",testIssue).value).toBe("version1, version2");
  expect(unifyIssueAttrib("customfield_emptyversions",testIssue).value).toBe("");
  expect(unifyIssueAttrib("customfield_version_released",testIssue).value).toBe("released version");
  expect(unifyIssueAttrib("customfield_version_released",testIssue).format).toBe("@[green]");
  expect(unifyIssueAttrib("customfield_version_unreleased",testIssue).value).toBe("unreleased version");
  expect(unifyIssueAttrib("customfield_version_unreleased",testIssue).format).toBe("");
  
  expect(unifyIssueAttrib("components",testIssue).value).toBe("component 1, component 2");
  expect(unifyIssueAttrib("fixVersions",testIssue).value).toBe("fix Version 1");
  expect(unifyIssueAttrib("versions",testIssue).value).toBe("");
});


function initJiraDummyConfig() {
  setCfg_('jira_url', "https://jiraserver");
  setCfg_('jira_username', "username");
  setCfg_('jira_password', "password");
  EpicField.setLinkKey("customfield_epic_link");
  EpicField.setLabelKey("customfield_epic_label");
}
