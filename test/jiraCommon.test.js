jiraApiMock = require('./mocks/mockJiraApi.js');

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
    jiraApiMock.setNextJiraResponse("field",fieldList);

    const getAllJiraFields = require('../src/jiraCommon.gs').getAllJiraFields;
    
    const successCallBack =jest.fn();
    const errorCallBack =jest.fn();
    getAllJiraFields(successCallBack,errorCallBack);
    expect(successCallBack.mock.calls.length).toBe(1);
    expect(errorCallBack.mock.calls.length).toBe(0);
    var fieldListReturned = successCallBack.mock.calls[0][0];
    expect(fieldListReturned.length).toBe(3);
    expect(fieldListReturned[0].key).toBe("abc");
    expect(fieldListReturned[1].key).toBe("def");
    expect(fieldListReturned[2].key).toBe("xyz");

    successCallBack.mockClear();
    errorCallBack.mockClear();
    jiraApiMock.withSuccessHandler.mockClear();
    jiraApiMock.withFailureHandler.mockImplementationOnce((callback) => { 
        callback({errorMessages:["mocked error"]},404,false); 
        return jiraApiMock});

    getAllJiraFields(successCallBack,errorCallBack);
    expect(successCallBack.mock.calls.length).toBe(0);
    expect(errorCallBack.mock.calls.length).toBe(1);
    expect(errorCallBack.mock.calls[0][0]).toContain("404");
});
