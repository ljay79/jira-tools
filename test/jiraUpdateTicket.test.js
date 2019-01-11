
jiraApiMock = require('./mocks/mockJiraApi.js');
const debug = require("../src/debug.gs");


beforeEach(() =>  {
    debug.enable(true);
    jest.resetModules();
    jiraApiMock = require('./mocks/mockJiraApi.js');
    jiraApiMock.resetMocks();
});

const jiraFieldList = [
    {
        key: "issueKey",
        name: "Key",
        custom:     false,
        schemaType: 'string',
        supported:  true

    },
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


test('processing list of Jira Issues', () => {

    const updateJiraIssues = require('../src/jiraUpdateTicket.gs').updateJiraIssues;
    var result = updateJiraIssues({},[]);
    expect(result.rowsUpdated).toBe(0);
    expect(result.status).toBe(false);
    expect(result.finished).toBe(true);
    expect(result.message).not.toBeNull();


    var result = updateJiraIssues({columnA:1,Key:0},[]);
    expect(result.rowsUpdated).toBe(0);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);

    
    // set up field types
    var fieldList = [
        {
            schema:{type:"string"},
            key: "columnA",
            name: "XYZ field",
            custom: false
        },
        {
            schema:{type:"string"},
            key: "issueKey",
            name: "Key",
            custom: false
        }
    ];

    jiraApiMock.setAllResponsesSuccesfull();
    jiraApiMock.setNextJiraResponse("field",fieldList);

    var result = updateJiraIssues({columnA:1,Key:0},[["PBI-1","column A value"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(0);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated+1);

    jiraApiMock.setAllResponsesSuccesfull();
    jiraApiMock.setNextJiraResponse("field",fieldList);
    var result = updateJiraIssues({columnA:1,Key:0},[["PBI-1","column A value"],["PBI-2","column A value 2"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(2);
    expect(result.errors.length).toBe(0);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated+1);

    jiraApiMock.setAllResponsesSuccesfull();
    jiraApiMock.setNextJiraResponse("field",fieldList);
    var result = updateJiraIssues({columnA:1,Key:0},[[null,"column A value"],["","column A value"],["PBI-2","column A value 2"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]).toContain("No Key value found in row");
    expect(result.errors[1]).toContain("No Key value found in row");
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated+1);


    jiraApiMock.setAllResponsesFail();
    jiraApiMock.setNextJiraResponse("field",fieldList);
    var result = updateJiraIssues({columnA:1,Key:0},[["PBI-1","column A value"],["PBI-2","column A value 2"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(0);
    expect(result.errors.length).toBe(2);
    expect(result.status).toBe(false);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(3);
});


test('packing a row', () => {
    const packageRowForUpdate = require('../src/jiraUpdateTicket.gs').packageRowForUpdate;
    var result = packageRowForUpdate(jiraFieldList,{"My custom field":1,Key:0},["PBI-1","column A value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-1");
    expect(result.fields).not.toBeNull();
    expect(result.fields.custom1234).toBe("column A value");
    expect(Object.keys(result.fields).length).toBe(1);

    var result = packageRowForUpdate(jiraFieldList,{Key:0,"My custom field":1,"My custom field 2":3},["PBI-1","column A value","should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-1");
    expect(result.fields).not.toBeNull();
    expect(result.fields.custom1234).toBe("column A value");
    expect(result.fields.custom5678).toBe("column B value");
    expect(Object.keys(result.fields).length).toBe(2);

    var result = packageRowForUpdate(jiraFieldList,{Key:0,columnA:1,columnB:3},["","column A value","should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();

    var result = packageRowForUpdate(jiraFieldList,{Key:0,columnA:1,columnB:3},[null,"column A value","should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();


    var result = packageRowForUpdate(jiraFieldList,{columnA:1,columnB:3},[null,"column A value","should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();

    var result = packageRowForUpdate(jiraFieldList,{"My custom field":1,Key:0},["PBI-22","column A value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-22");
    expect(result.fields).not.toBeNull();
    expect(result.fields.custom1234).toBe("column A value");
    expect(Object.keys(result.fields).length).toBe(1);
});

test("Sending Individual Issues to Jira", () => {

    jiraApiMock.withFailureHandler.mockImplementationOnce((callback) => { callback({}, null, 404); return jiraApiMock});

    jiraApiMock.call.mockImplementationOnce(
        (method,params) => {
            return jiraApiMock;
        }
    );
    jiraApiMock.getResponse.mockImplementationOnce(
        () => {
            return {statusCode:404};
        }
    );
    const updateIssueinJira = require('../src/jiraUpdateTicket.gs').updateIssueinJira;
    
    const mockCallback = jest.fn((key, status, message) => {key});
    var result = updateIssueinJira({key:"PBI-1",fields:{a:"b"}},mockCallback);

    expect(result).toBe(false);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueUpdate");
    expect(jiraApiMock.call.mock.calls[0][1]["issueIdOrKey"]).toBe("PBI-1");
    expect(jiraApiMock.call.mock.calls[0][1]["fields"]["a"]).toBe("b");

    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toBe("PBI-1");
    expect(mockCallback.mock.calls[0][1]).toBe(false);
    expect(mockCallback.mock.calls[0][2]).toBe("PBI-1 Not found");
    
    jiraApiMock.setAllResponsesSuccesfull();
    mockCallback.mockClear();
    
    var result = updateIssueinJira({key:"PBI-2",fields:{a:"b"}},mockCallback);

    expect(result).toBe(true);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toBe("PBI-2");
    expect(mockCallback.mock.calls[0][1]).toBe(true);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueUpdate");
    expect(jiraApiMock.call.mock.calls[0][1]["issueIdOrKey"]).toBe("PBI-2");
    expect(jiraApiMock.call.mock.calls[0][1]["fields"]["a"]).toBe("b");


});

test("field validation", () => {
    const getMatchingJiraFields = require("../src/jiraUpdateTicket.gs").getMatchingJiraFields;

    var getFilteredList = getMatchingJiraFields(
        jiraFieldList, {"custom1234":1,"Not a Match":2,"My custom field 2":3}
    );
    expect(getFilteredList).not.toBeNull();
    expect(Object.keys(getFilteredList).length).toBe(2);
    expect(getFilteredList["custom1234"]).not.toBeNull();
    expect(getFilteredList["custom1234"]).toBe(1);
    expect(getFilteredList["custom5678"]).toBe(3);
    expect(getFilteredList["Not a Match"]).not.toBeDefined();
    expect(getFilteredList["My custom field 2"]).not.toBeDefined();


    
});
