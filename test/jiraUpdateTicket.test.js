


beforeEach(() =>  {
    jest.resetModules();
});

test('processing headers and data rows', () => {
    const updateIssues = require('../src/jiraUpdateTicket.gs').updateIssues;
    const mockCallback = jest.fn((key, status) => {key});
    var result = updateIssues({},[],mockCallback);
    expect(result.rowsUpdated).toBe(0);
    expect(result.status).toBe(false);
    expect(result.message).not.toBeNull();
    expect(mockCallback.mock.calls.length).toBe(0);

    mockCallback.mockClear();
    var result = updateIssues({columnA:1,Key:0},[],mockCallback);
    expect(result.rowsUpdated).toBe(0);
    expect(result.status).toBe(true);
    expect(mockCallback.mock.calls.length).toBe(0);

    mockCallback.mockClear();
    var result = updateIssues({columnA:1,Key:0},[["PBI-1","column A value"]],mockCallback);
    expect(result.rowsUpdated).toBe(1);
    expect(result.status).toBe(true);
    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toBe("PBI-1");
    expect(mockCallback.mock.calls[0][1]).toBe(true);

    mockCallback.mockClear();
    var result = updateIssues({columnA:1,Key:0},[["PBI-1","column A value"],["PBI-2","column A value 2"]],mockCallback);
    expect(result.rowsUpdated).toBe(2);
    expect(result.status).toBe(true);
    expect(mockCallback.mock.calls.length).toBe(2);
    expect(mockCallback.mock.calls[0][0]).toBe("PBI-1");
    expect(mockCallback.mock.calls[0][1]).toBe(true);
    expect(mockCallback.mock.calls[1][0]).toBe("PBI-2");
    expect(mockCallback.mock.calls[1][1]).toBe(true);

    mockCallback.mockClear();
    var result = updateIssues({columnA:1,Key:0},[[null,"column A value"],["","column A value"],["PBI-2","column A value 2"]],mockCallback);
    expect(result.rowsUpdated).toBe(1);
    expect(result.status).toBe(true);
    expect(mockCallback.mock.calls.length).toBe(3);
    expect(mockCallback.mock.calls[0][0]).toBe(null);
    expect(mockCallback.mock.calls[0][1]).toBe(false);
    expect(mockCallback.mock.calls[0][2]).not.toBeNull();
    expect(mockCallback.mock.calls[1][0]).toBe(null);
    expect(mockCallback.mock.calls[1][1]).toBe(false);
    expect(mockCallback.mock.calls[1][2]).not.toBeNull();
    expect(mockCallback.mock.calls[2][0]).toBe("PBI-2");
    expect(mockCallback.mock.calls[2][1]).toBe(true);
    expect(mockCallback.mock.calls[2][2]).toBeNull();
});


test('packing a row', () => {
    const packageRowForUpdate = require('../src/jiraUpdateTicket.gs').packageRowForUpdate;
    var result = packageRowForUpdate({columnA:1,Key:0},["PBI-1","column A value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-1");
    expect(result.fields).not.toBeNull();
    expect(result.fields.columnA).toBe("column A value");
    expect(Object.keys(result.fields).length).toBe(1);

    var result = packageRowForUpdate({Key:0,columnA:1,columnB:3},["PBI-1","column A value","should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-1");
    expect(result.fields).not.toBeNull();
    expect(result.fields.columnA).toBe("column A value");
    expect(result.fields.columnB).toBe("column B value");
    expect(Object.keys(result.fields).length).toBe(2);

    var result = packageRowForUpdate({Key:0,columnA:1,columnB:3},["","column A value","should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();

    var result = packageRowForUpdate({Key:0,columnA:1,columnB:3},[null,"column A value","should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();


    var result = packageRowForUpdate({columnA:1,columnB:3},[null,"column A value","should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();
});

test("Sending Individual Issues to Jira", () => {

    const callMock =jest.fn();
    const withSuccessHandlerMock =jest.fn();
    const withFailureHandlerMock =jest.fn();
    const chain = {
        call:callMock,
        withSuccessHandler:withSuccessHandlerMock,
        withFailureHandler:withFailureHandlerMock,
    };
    callMock.mockImplementation(() => chain);
    withSuccessHandlerMock.mockImplementation(() => chain);
    withFailureHandlerMock.mockImplementation(() => chain);
    const mockRequest = jest.fn().mockImplementation(() => chain);

    jest.mock('../src/jiraApi.gs',function () {return function(){return {call:mockRequest}}});
    
    const mockCallback = jest.fn((key, status, message) => {key});

    withFailureHandlerMock.mockImplementationOnce((callback) => { callback({}, null, 404); return chain});

    callMock.mockImplementationOnce(
        (method,params) => {
            expect(method).toBe("issue");
            expect(params.keyOrIssueId).toBe("PBI-1");

            return chain;
        }
    );
    const updateIssueinJira = require('../src/jiraUpdateTicket.gs').updateIssueinJira;
    
    updateIssueinJira({key:"PBI-1",fields:{a:"b"}},mockCallback);

    expect(mockCallback.mock.calls.length).toBe(1);
    expect(mockCallback.mock.calls[0][0]).toBe("PBI-1");
    expect(mockCallback.mock.calls[0][1]).toBe(false);
    expect(mockCallback.mock.calls[0][2]).toBe("PBI-1 Not found");


});
