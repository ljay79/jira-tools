jiraApiMock = require('./mocks/mockJiraApi.js');
const getCfg_ = require("../src/settings.gs").getCfg_;
const setCfg_ = require("../src/settings.gs").setCfg_;
const UserStorage = require("src/models/gas/UserStorage.gs");
const CustomFields = require("src/models/jira/CustomFields.gs");
const jiraCommon = require('../src/jiraCommon.gs');

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
      assignee: null,
      reporter: {
        "key": "plemon",
        "accountId": "557000:xxxxxxxx-xxxx-41ef-a3f5-0fdfxxxx0000",
        "emailAddress": "Paul.Lemon@gmail.com",
        "avatarUrls": {
          "48x48": "https://jira/useravatar?avatarId=10182",
          "24x24": "https://jira/useravatar?size=small&avatarId=10182",
          "16x16": "https://jira/useravatar?size=xsmall&avatarId=10182",
          "32x32": "https://jira/useravatar?size=medium&avatarId=10182"
        },
        "displayName": "Lemon, Paul"
      },
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
      customfield_sprints: [
        "com.atlassian.greenhopper.service.sprint.Sprint@a29f07[rapidViewId=<null>,state=CLOSED,name=Sprint 1,startDate=2013-07-29T06:47:00.000+02:00,endDate=2013-08-11T20:47:00.000+02:00,completeDate=2013-08-14T15:31:33.157+02:00,id=107]",
        "com.atlassian.greenhopper.service.sprint.Sprint@a29f07[rapidViewId=<null>,state=CLOSED,name=Sprint 2,startDate=2013-07-29T06:47:00.000+02:00,endDate=2013-08-11T20:47:00.000+02:00,completeDate=2013-08-14T15:31:33.157+02:00,id=108]"
      ],
      versions: []
    }
  };

  initJiraDummyConfig();
  expect(EpicField.isUsable()).toBeTruthy();
  expect(getCfg_('jira_url')).toBe("https://jiraserver");

  CustomFields.save([
	  { key: "customfield_custom1", name: "Custom 1", type: "number", customType: "none" },
	  { key: "customfield_custom2", name: "Custom 2", schemaType: "string", customType: "none"  },
	  { key: "customfield_custom3", name: "Custom 3", schemaType: "option", customType: "none"  },
	  { key: "customfield_stringArray", name: "String Array", schemaType: "array|string", customType: "none"  },
	  { key: "customfield_stringArray2", name: "String Array", schemaType: "array|string", customType: "none"  },
	  { key: "customfield_stringArray3", name: "String Array", schemaType: "array|string", customType: "none"  },
	  { key: "customfield_stringArray4", name: "String Array", schemaType: "array|string", customType: "none"  },
	  { key: "customfield_versions", name: "Version Array", schemaType: "array|versions", customType: "none"  },
	  { key: "customfield_emptyversions", name: "Empty Version Array", schemaType: "array|versions", customType: "none"  },
	  { key: "customfield_version_released", name: "Version", schemaType: "versions", customType: "none"  },
	  { key: "customfield_version_unreleased", name: "Version", schemaType: "versions", customType: "none"  },
	  { key: "customfield_sprints", name: "Sprints", schemaType: "array|string", customType: "none"  }
  ]);

  var debug = require("../src/debug.gs").debug;
  debug.enable(true);
  var debugErrorSpy = jest.spyOn(debug, 'error');

  expect(unifyIssueAttrib("summary",testIssue).value).toBe("A summary");
  expect(unifyIssueAttrib("description",testIssue).value).toBe("This is the description");
  expect(unifyIssueAttrib("environment",testIssue).value).toBe("An environment");
  expect(unifyIssueAttrib("duedate",testIssue).value).toBe("");
  expect(unifyIssueAttrib("assignee",testIssue).value).toBe("");
  expect(unifyIssueAttrib("reporter",testIssue).value).toBe("Lemon, Paul");

  var epicResult = unifyIssueAttrib("customfield_epic_link", testIssue);
  expect(epicResult.value).toBe("EPC-22");
  expect(epicResult.link).toBe("https://jiraserver/browse/EPC-22");

  expect(unifyIssueAttrib("customfield_custom1",testIssue).value).toBe(22);
  expect(unifyIssueAttrib("customfield_custom1",testIssue).format).toBe("0");
  expect(unifyIssueAttrib("customfield_custom2",testIssue).value).toBe("hello");
  expect(unifyIssueAttrib("customfield_custom3",testIssue).value).toBe("option_value");
  expect(unifyIssueAttrib("customfield_stringArray",testIssue).value).toBe("one, two, three");
  expect(unifyIssueAttrib("customfield_stringArray2",testIssue).value).toBe("");
  expect(unifyIssueAttrib("customfield_stringArray3",testIssue).value).toBe("one");
  expect(unifyIssueAttrib("customfield_stringArray4",testIssue).value).toBe("");
  expect(unifyIssueAttrib("customfield_versions",testIssue).value).toBe("version1, version2");
  expect(unifyIssueAttrib("customfield_emptyversions",testIssue).value).toBe("");
  expect(unifyIssueAttrib("customfield_version_released",testIssue).value).toBe("released version");
  expect(unifyIssueAttrib("customfield_version_released",testIssue).format).toBe("@[green]");
  expect(unifyIssueAttrib("customfield_version_unreleased",testIssue).value).toBe("unreleased version");
  expect(unifyIssueAttrib("customfield_version_unreleased",testIssue).format).toBe("");
  
  expect(unifyIssueAttrib("components",testIssue).value).toBe("component 1, component 2");
  expect(unifyIssueAttrib("fixVersions",testIssue).value).toBe("fix Version 1");
  expect(unifyIssueAttrib("versions",testIssue).value).toBe("");
  expect(unifyIssueAttrib("customfield_sprints",testIssue).value).toBe("Sprint 1, Sprint 2");
  
  debug.enable(false);
  expect(debugErrorSpy).toBeCalledTimes(0);
});


function initJiraDummyConfig() {
  setCfg_('jira_url', "https://jiraserver");
  setCfg_('jira_username', "username");
  setCfg_('jira_password', "password");
  EpicField.setLinkKey("customfield_epic_link");
  EpicField.setLabelKey("customfield_epic_label");
}

test("Receiving proper sheet id's from mock", () => {
  SpreadsheetApp.resetMocks();

  var sheetIdA = jiraCommon.getTicketSheet().getSheetId();
  var sheetIdB = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getSheetId();
  expect(sheetIdA).toBe(sheetIdB);

  SpreadsheetApp.resetMocks();
});

test('sheetIdPropertySafe() generates property safe string from an sheet id', () => {
  SpreadsheetApp.resetMocks();

  var result = '';
  var sheetId = jiraCommon.getTicketSheet().getSheetId();
  var expectedId = 'sid_' + sheetId;

  result = jiraCommon.sheetIdPropertySafe(sheetId);
  expect(result).toBe(expectedId);

  result = jiraCommon.sheetIdPropertySafe();
  expect(result).toBe(expectedId);

  // shall be same on multiple calls within runtime
  var id1 = jiraCommon.sheetIdPropertySafe();
  var id2 = jiraCommon.sheetIdPropertySafe();
  var id3 = jiraCommon.sheetIdPropertySafe();
  expect(id1).toBe(id2);
  expect(id2).toBe(id3);

  SpreadsheetApp.resetMocks();
});
