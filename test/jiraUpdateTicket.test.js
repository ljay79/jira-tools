const updateIssues = require('../jiraUpdateTicket.gs');

test('sending no headers results in error', () => {
    var result = updateIssues({},[]);
    expect(result.rowsUpdated).toBe(0);
    expect(result.status).toBe(false);
    expect(result.message).not.toBeNull();
});