global.PropertiesService = require('./mocks/PropertiesService');
jiraApiMock = require('./mocks/mockJiraApi.js');
SpreadsheetApp = require('./mocks/SpreadsheetApp');
jiraCommon = require('../src/jiraCommon.gs');


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

    const getMatchingJiraField = require("../src/jiraCommon.gs").getMatchingJiraField;
    
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
    const convertJiraFieldResponseToFieldRecord = require('../src/jiraCommon.gs').convertJiraFieldResponseToFieldRecord;
    
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

    const getAllJiraFields = require('../src/jiraCommon.gs').getAllJiraFields;
    
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

test("Call to retrieve an issues status", function() {
    jiraApiMock.resetMocks();
    const getIssue = require('../src/jiraCommon.gs').getIssue;
    var response = getIssue("PBI-222");
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-222");
    expect(Object.keys(jiraApiMock.call.mock.calls[0][1]).length).toBe(1);
});

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
  var expectedId = ('sid_' + sheetId).replace(/[^a-zA-Z0-9_]/g, '_');
  
  result = jiraCommon.sheetIdPropertySafe(sheetId);
  expect(result).toBe(expectedId);

  result = jiraCommon.sheetIdPropertySafe();
  expect(result).toBe(expectedId);

  SpreadsheetApp.resetMocks();
});
