jiraApiMock = require('test/mocks/mockJiraApi.js');
const UserStorage = require("src/models/gas/UserStorage.gs");
global.EpicField = require("src/models/jira/EpicField.gs");
const CUSTOMFIELD_FORMAT_RAW = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_RAW;
const CUSTOMFIELD_FORMAT_SEARCH = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_SEARCH;
const CUSTOMFIELD_FORMAT_UNIFY = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_UNIFY;
const IssueFields = require("src/models/jira/IssueFields.gs");

beforeEach(() => {
  IssueFields.clearCache_();
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
  IssueFields.setAllFields_(fieldList);

  var matchedField = IssueFields.getMatchingField("Summary");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("summary");

  var matchedField = IssueFields.getMatchingField("My custom field");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");

  var matchedField = IssueFields.getMatchingField("An unrecognised field");
  expect(matchedField).toBeNull();


  var matchedField = IssueFields.getMatchingField("custom1234");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");

  var matchedField = IssueFields.getMatchingField("my CUStom field");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");

  var matchedField = IssueFields.getMatchingField("my CUStom field ");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");

  var matchedField = IssueFields.getMatchingField(" my CUStom field ");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");


});

test("Convert Jira Field Responses to internal field data", () => {

  var result = IssueFields.convertJiraResponse({
    schema: { type: "string" },
    key: "xyz",
    name: "XYZ field",
    custom: false
  });
  expect(result.key).toBe("xyz");
  expect(result.custom).toBe(false);
  expect(result.name).toBe("XYZ field");
  expect(result.supported).toBe(true);
  expect(result.schemaType).toBe("string");

  result = IssueFields.convertJiraResponse({
    schema: { type: "a custom field not recognised" },
    key: "abc",
    name: "ABC field",
    custom: true
  });
  expect(result.key).toBe("abc");
  expect(result.custom).toBe(true);
  expect(result.name).toBe("ABC field");
  expect(result.supported).toBe(false);
  expect(result.schemaType).toBe("a custom field not recognised");



  result = IssueFields.convertJiraResponse({
    schema: { type: "string" },
    id: "def",
    name: "DEF field",
    custom: true
  });
  expect(result.key).toBe("def");
  expect(result.custom).toBe(true);
  expect(result.name).toBe("DEF field");
  expect(result.supported).toBe(true);
  expect(result.schemaType).toBe("string");
});

test("Set all JIRA fields", () => {
  IssueFields.setAllFields_({ a: "b" });
  expect(IssueFields.getAllFields()).toEqual({ a: "b" });
});

test("Get all fields from Jira", () => {
  var fieldList = [
    {
      schema: { type: "string" },
      key: "xyz",
      name: "XYZ field",
      custom: false
    },
    {
      schema: { type: "a custom field not recognised" },
      key: "abc",
      name: "ABC field",
      custom: true
    },
    {
      schema: { type: "string" },
      id: "def",
      name: "DEF field",
      custom: true
    }
  ];
  jiraApiMock.resetMocks();
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);


  const successCallBack = jest.fn();
  const errorCallBack = jest.fn();
  var result = IssueFields.getAllFields(successCallBack, errorCallBack);
  expect(jiraApiMock.call.mock.calls.length).toBe(1);
  expect(successCallBack.mock.calls.length).toBe(1);
  expect(errorCallBack.mock.calls.length).toBe(0);
  var fieldListReturned = successCallBack.mock.calls[0][0];
  expect(fieldListReturned.length).toBe(3);
  expect(fieldListReturned[0].key).toBe("abc");
  expect(fieldListReturned[1].key).toBe("def");
  expect(fieldListReturned[2].key).toBe("xyz");
  expect(result).toBe(fieldListReturned);

  // now check the cache
  var result = IssueFields.getAllFields(successCallBack, errorCallBack);
  expect(successCallBack.mock.calls.length).toBe(2);
  expect(errorCallBack.mock.calls.length).toBe(0);
  // no additional calls to JIRA API
  expect(jiraApiMock.call.mock.calls.length).toBe(1);


  successCallBack.mockClear();
  errorCallBack.mockClear();
  IssueFields.clearCache_();
  jiraApiMock.withSuccessHandler.mockClear();
  jiraApiMock.withFailureHandler.mockImplementationOnce((callback) => {
    callback({ errorMessages: ["mocked error"] }, 404, false);
    return jiraApiMock
  });
  var result = IssueFields.getAllFields(successCallBack, errorCallBack);
  expect(successCallBack.mock.calls.length).toBe(0);
  expect(errorCallBack.mock.calls.length).toBe(1);
  expect(result.length).toBe(0);
});


test("Get all custom fields from Jira", () => {
  var fieldList = [
    {
      schema: { type: "string" },
      key: "xyz",
      name: "XYZ field",
      custom: false
    },
    {
      schema: { type: "a custom field not recognised" },
      key: "abc",
      name: "ABC field",
      custom: true
    },
    {
      schema: { type: "string" },
      id: "def",
      name: "DEF field",
      custom: true
    },
    {
      "id": "Epic_link_key",
      "name": "Epic Link",
      "custom": true,
      "schema": {
        "custom": ":gh-epic-link",
        "type": "string",
        "system": "description"
      }
    },
    {
      "id": "Epic_label_key",
      "name": "Epic Label",
      "custom": true,
      "schema": {
        "custom": ":gh-epic-label",
        "type": "string",
        "system": "description"
      }
    }
  ];
  //set up
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  const IssueFields = require("src/models/jira/IssueFields.gs");
  const successCallBack = jest.fn();
  const errorCallBack = jest.fn();

  // execute
  var result = IssueFields.getAllCustomFields(successCallBack, errorCallBack);
  // verify call backs
  expect(successCallBack.mock.calls.length).toBe(1);
  expect(errorCallBack.mock.calls.length).toBe(0);
  // verify results
  var fieldListReturned = successCallBack.mock.calls[0][0];
  expect(fieldListReturned.length).toBe(5);
  expect(fieldListReturned[0].key).toBe("jst_epic");
  expect(fieldListReturned[1].key).toBe("abc");
  expect(fieldListReturned[2].key).toBe("def");
  expect(result).toBe(fieldListReturned);

});

test("headerNames", () => {
  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    return JSON.stringify([
      { key: "custom1", name: "Custom 1" },
      { key: "custom2", name: "Custom 2" },
      { key: "custom_epiclink", name: "Epic Link" }
    ]
    );
  });
  EpicField.setLinkKey("custom_epiclink");
  EpicField.setLabelKey("not used");
  expect(IssueFields.getHeaderName("hello world")).toBe("helloWorld");
  expect(IssueFields.getHeaderName("key")).toBe("Key");
  expect(IssueFields.getHeaderName("summary")).toBe("Summary");
  expect(IssueFields.getHeaderName("custom1")).toBe("Custom 1");
  expect(IssueFields.getHeaderName("custom2")).toBe("Custom 2");
  expect(IssueFields.getHeaderName("custom_epiclink")).toBe("Epic");
})


test("getCustomFields", () => {
  PropertiesService.resetMocks();
  PropertiesService.resetMockUserData();
  UserStorage.setValue(
    "favoriteCustomFields",
    [
      { key: "customx", name: "Custom X", schemaType: "Type 1" },
      { key: "customy", name: "Custom Y", schemaType: "Type 2" },
      { key: "customz", name: "Custom Z", type: "Type 3" }
    ]
  );
  var result = IssueFields.getAvailableCustomFields();
  expect(result.length).toBe(3);
  expect(result[0]).toEqual({ key: "customx", name: "Custom X", schemaType: "Type 1" });
  result = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_RAW);
  expect(result.length).toBe(3);
  expect(result).toEqual([
    { key: "customx", name: "Custom X", schemaType: "Type 1" },
    { key: "customy", name: "Custom Y", schemaType: "Type 2" },
    { key: "customz", name: "Custom Z", schemaType: "Type 3" }
  ]
  );
  result = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_SEARCH);
  expect(Object.keys(result).length).toBe(3);
  expect(result.customx).toBe("Custom X");
  expect(result.customy).toBe("Custom Y");
  expect(result.customz).toBe("Custom Z");

  result = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_UNIFY);
  expect(Object.keys(result).length).toBe(3);
  expect(result.customx).toBe("Type 1");
  expect(result.customy).toBe("Type 2");
  expect(result.customz).toBe("Type 3");
});

test("Creating Fields", () => {

  var epicField = IssueFields.createField_(
    EpicField.getKey(),
    EpicField.getName(),
    true,
    EpicField.EPIC_KEY,
    true
  );
  expect(epicField.supported).toBe(true);
  expect(epicField.name).toBe(EpicField.getName());
  expect(epicField.key).toBe(EpicField.getKey());
  expect(epicField.custom).toBe(true);
  expect(epicField.isVirtual).toBe(true);
});

test("Read Only fields", () => {
  var readonly = IssueFields.getReadonlyFields();
  expect(readonly).toContain("project");
  expect(readonly).toContain("created");
  expect(readonly).toContain("updated");
  expect(readonly).not.toContain("summary");
  expect(readonly).not.toContain("description");
  expect(readonly).not.toContain("assignee");
})