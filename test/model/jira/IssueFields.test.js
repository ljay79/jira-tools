global.PropertiesService = require('test/mocks/PropertiesService');
jiraApiMock = require('test/mocks/mockJiraApi.js');
const UserStorage = require("src/models/gas/UserStorage.gs");
global.EpicField = require("src/models/jira/EpicField.gs");
const CUSTOMFIELD_FORMAT_RAW = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_RAW;
const CUSTOMFIELD_FORMAT_SEARCH = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_SEARCH;
const CUSTOMFIELD_FORMAT_UNIFY = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_UNIFY;

test("field validation", () => {
    var fieldList = [
        {
            key:        "summary",
            name:       "Summary",
            custom:     false,
            schemaType: 'string',
            supported:  true
        },
        {
            key:        "custom1234",
            name:       "My custom field",
            custom:     true,
            schemaType: 'datetime',
            supported:  true

        },
        {
            key:        "custom5678",
            name:       "My custom field 2",
            custom:     true,
            schemaType: 'datetime',
            supported:  true

        }
    ]

    const getMatchingJiraField = require("src/models/jira/IssueFields.gs").getMatchingJiraField;
    
    var matchedField = getMatchingJiraField(fieldList,"Summary");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("summary");

    var matchedField = getMatchingJiraField(fieldList,"My custom field");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    var matchedField = getMatchingJiraField(fieldList,"An unrecognised field");
    expect(matchedField).toBeNull();


    var matchedField = getMatchingJiraField(fieldList,"custom1234");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    var matchedField = getMatchingJiraField(fieldList,"my CUStom field");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    var matchedField = getMatchingJiraField(fieldList,"my CUStom field ");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    var matchedField = getMatchingJiraField(fieldList," my CUStom field ");
    expect(matchedField).not.toBeNull();
    expect(matchedField.key).toBe("custom1234");

    
});

test("Convert Jira Field Responses to internal field data", () => {
    const convertJiraFieldResponseToFieldRecord = require("src/models/jira/IssueFields.gs").convertJiraFieldResponseToFieldRecord;
    
    var result = convertJiraFieldResponseToFieldRecord({
        schema:{type:"string"},
        key: "xyz",
        name: "XYZ field",
        custom: false
    });
    expect(result.key).toBe("xyz");
    expect(result.custom).toBe(false);
    expect(result.name).toBe("XYZ field");
    expect(result.supported).toBe(true);
    expect(result.schemaType).toBe("string");

    result = convertJiraFieldResponseToFieldRecord({
        schema:{type:"a custom field not recognised"},
        key: "abc",
        name: "ABC field",
        custom: true
    });
    expect(result.key).toBe("abc");
    expect(result.custom).toBe(true);
    expect(result.name).toBe("ABC field");
    expect(result.supported).toBe(false);
    expect(result.schemaType).toBe("a custom field not recognised");



    result = convertJiraFieldResponseToFieldRecord({
        schema:{type:"string"},
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

test("Get all fields from Jira", () => {
    var fieldList = [
        {
            schema:{type:"string"},
            key: "xyz",
            name: "XYZ field",
            custom: false
        },
        {
            schema:{type:"a custom field not recognised"},
            key: "abc",
            name: "ABC field",
            custom: true
        },
        {
            schema:{type:"string"},
            id: "def",
            name: "DEF field",
            custom: true
        }
    ];
    jiraApiMock.setNextJiraResponse(200,"field",fieldList);

    const getAllJiraFields = require("src/models/jira/IssueFields.gs").getAllJiraFields;
    
    const successCallBack =jest.fn();
    const errorCallBack =jest.fn();
    var result = getAllJiraFields(successCallBack,errorCallBack);
    expect(successCallBack.mock.calls.length).toBe(1);
    expect(errorCallBack.mock.calls.length).toBe(0);
    var fieldListReturned = successCallBack.mock.calls[0][0];
    expect(fieldListReturned.length).toBe(3);
    expect(fieldListReturned[0].key).toBe("abc");
    expect(fieldListReturned[1].key).toBe("def");
    expect(fieldListReturned[2].key).toBe("xyz");
    expect(result).toBe(fieldListReturned);

    successCallBack.mockClear();
    errorCallBack.mockClear();
    jiraApiMock.withSuccessHandler.mockClear();
    jiraApiMock.withFailureHandler.mockImplementationOnce((callback) => { 
        callback({errorMessages:["mocked error"]},404,false); 
        return jiraApiMock});

    var result = getAllJiraFields(successCallBack,errorCallBack);
    expect(successCallBack.mock.calls.length).toBe(0);
    expect(errorCallBack.mock.calls.length).toBe(1);
    expect(result.length).toBe(0);
});


test("Get all custom fields from Jira", () => {
  var fieldList = [
      {
          schema:{type:"string"},
          key: "xyz",
          name: "XYZ field",
          custom: false
      },
      {
          schema:{type:"a custom field not recognised"},
          key: "abc",
          name: "ABC field",
          custom: true
      },
      {
          schema:{type:"string"},
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
  jiraApiMock.setNextJiraResponse(200,"field",fieldList);
  const getAllCustomJiraFields = require("src/models/jira/IssueFields.gs").getAllCustomJiraFields;
  const successCallBack =jest.fn();
  const errorCallBack =jest.fn();

  // execute
  var result = getAllCustomJiraFields(successCallBack,errorCallBack);
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

test("headerNames",() => {
  const headerNames = require("src/models/jira/IssueFields.gs").headerNames;
  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    return JSON.stringify([
      {key:"custom1",name:"Custom 1"},
      {key:"custom2",name:"Custom 2"}
    ] 
    );
  });
  expect(headerNames("hello world")).toBe("helloWorld");
  expect(headerNames("key")).toBe("Key");
  expect(headerNames("summary")).toBe("Summary");
  expect(headerNames("custom1")).toBe("Custom 1");
  expect(headerNames("custom2")).toBe("Custom 2");
})


test("getCustomFields",() => {
  PropertiesService.resetMocks();
  PropertiesService.resetMockUserData();
  UserStorage.setValue(
    "favoriteCustomFields",
    [
      {key:"customx",name:"Custom X",type: "Type 1"},
      {key:"customy",name:"Custom Y",type: "Type 2"}
    ]
  );
  const getCustomFields = require("src/models/jira/IssueFields.gs").getCustomFields;
  var result = getCustomFields();
  expect(result.length).toBe(2);
  expect(result[0]).toEqual({key:"customx",name:"Custom X",type: "Type 1"});
  result = getCustomFields(CUSTOMFIELD_FORMAT_RAW);
  expect(result.length).toBe(2);
  expect(result).toEqual([
    {key:"customx",name:"Custom X",type: "Type 1"},
    {key:"customy",name:"Custom Y",type: "Type 2"}
  ] 
  );
  result = getCustomFields(CUSTOMFIELD_FORMAT_SEARCH);
  expect(Object.keys(result).length).toBe(2);
  expect(result.customx).toBe("Custom X");
  expect(result.customy).toBe("Custom Y");

  result = getCustomFields(CUSTOMFIELD_FORMAT_UNIFY);
  expect(Object.keys(result).length).toBe(2);
  expect(result.customx).toBe("Type 1");
  expect(result.customy).toBe("Type 2");
});