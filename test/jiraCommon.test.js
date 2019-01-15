jiraApiMock = require('./mocks/mockJiraApi.js');

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
    jiraApiMock.setNextJiraResponse(200, "field", fieldList);

    const getAllJiraFields = require('../src/jiraCommon.gs').getAllJiraFields;
    const successCallBack = jest.fn();
    const errorCallBack = jest.fn();
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
        callback({errorMessages:["mocked error"]}, 404, false); 
        return jiraApiMock});

    getAllJiraFields(successCallBack,errorCallBack);
    expect(successCallBack.mock.calls.length).toBe(0);
    expect(errorCallBack.mock.calls.length).toBe(1);
});
