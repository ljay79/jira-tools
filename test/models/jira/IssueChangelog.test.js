let jiraApiMock = require('test/mocks/mockJiraApi.js');
const IssueChangelogs = require("src/models/jira/IssueChangelogs.gs");

beforeEach(() => {
  // IssueChangelog.clearCache_();
});

test("field validation", () => {
  var fieldList = [
    {
      key: "summary",
      name: "Summary",
      custom: false,
      schemaType: 'string',
      supported: true
    },
    {
      key: "custom1234",
      name: "My custom field",
      custom: true,
      schemaType: 'datetime',
      supported: true

    },
    {
      key: "custom5678",
      name: "My custom field 2",
      custom: true,
      schemaType: 'datetime',
      supported: true

    }
  ]
  // IssueFields.setAllFields_(fieldList);
  //
  // var matchedField = IssueFields.getMatchingField("Summary");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("summary");
  //
  // var matchedField = IssueFields.getMatchingField("My custom field");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
  //
  // var matchedField = IssueFields.getMatchingField("An unrecognised field");
  // expect(matchedField).toBeNull();
  //
  // var matchedField = IssueFields.getMatchingField("custom1234");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
  //
  // var matchedField = IssueFields.getMatchingField("my CUStom field");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
  //
  // var matchedField = IssueFields.getMatchingField("my CUStom field ");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
  //
  // var matchedField = IssueFields.getMatchingField(" my CUStom field ");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
});

// test("Convert Jira Field Responses to internal field data", () => {
//   var result = IssueFields.convertJiraResponse({
//     schema: { type: "string" },
//     key: "xyz",
//     name: "XYZ field",
//     custom: false
//   });
//   expect(result.key).toBe("xyz");
//   expect(result.custom).toBe(false);
//   expect(result.name).toBe("XYZ field");
//   expect(result.supported).toBe(true);
//   expect(result.schemaType).toBe("string");
//
//   result = IssueFields.convertJiraResponse({
//     schema: { type: "a custom field not recognised", custom: "customFieldType" },
//     key: "abc",
//     name: "ABC field",
//     custom: true
//   });
//   expect(result.key).toBe("abc");
//   expect(result.custom).toBe(true);
//   expect(result.name).toBe("ABC field");
//   expect(result.supported).toBe(false);
//   expect(result.schemaType).toBe("a custom field not recognised");
//   expect(result.customType).toBe("customFieldType");
//
//   result = IssueFields.convertJiraResponse({
//     schema: { type: "string" },
//     id: "def",
//     name: "DEF field",
//     custom: true
//   });
//   expect(result.key).toBe("def");
//   expect(result.custom).toBe(true);
//   expect(result.name).toBe("DEF field");
//   expect(result.supported).toBe(true);
//   expect(result.schemaType).toBe("string");
// });
//
// test("Set all JIRA fields", () => {
//   IssueFields.setAllFields_({ a: "b" });
//   expect(IssueFields.getAllFields()).toEqual({ a: "b" });
// });
//
describe("Fetching all changelogs from JIRA", () => {
  test("Get all changelogs from Jira", () => {
    var history = [
      {
        field: "status",
        to: 1123,
        toString: "Done",
        from: 2233,
        fromString: "in Progress"
      },
      {
        field: "status",
        to: 1222,
        toString: "To Do",
        from: 3333,
        fromString: "in Progress"
      },
    ];
    jiraApiMock.resetMocks();
    jiraApiMock.setNextJiraResponse(200, "history", history);

    const successCallBack = jest.fn();
    const errorCallBack = jest.fn();
    var result = IssueChangelogs.getAllChangelogs(successCallBack, errorCallBack);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    expect(successCallBack.mock.calls.length).toBe(1);
    expect(errorCallBack.mock.calls.length).toBe(0);
    var fieldListReturned = successCallBack.mock.calls[0][0];
    expect(fieldListReturned.length).toBe(2);
    expect(fieldListReturned[0].field).toBe("status");
  });
});
