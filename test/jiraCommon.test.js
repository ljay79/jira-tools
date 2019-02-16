jiraApiMock = require('./mocks/mockJiraApi.js');


test("Call to retrieve an issues status", function() {
    jiraApiMock.resetMocks();
    const getIssue = require('../src/jiraCommon.gs').getIssue;
    var response = getIssue("PBI-222");
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-222");
    expect(Object.keys(jiraApiMock.call.mock.calls[0][1]).length).toBe(1);
});
