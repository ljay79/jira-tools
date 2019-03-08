
jiraApiMock = require('./mocks/mockJiraApi.js');
IssueFields = require('src/models/jira/IssueFields.gs');

beforeAll(() => {
  //set the cached field list
  IssueFields.setAllFields_(jiraFieldList);
});

beforeEach(() => {
  jiraApiMock = require('./mocks/mockJiraApi.js');
  jiraApiMock.resetMocks();
});

const jiraFieldList = [
  {
    key: "issueKey",
    name: "Key",
    custom: false,
    schemaType: 'string',
    supported: true

  },
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

  },
  {
    key: "number1",
    name: "first number test field",
    custom: false,
    schemaType: 'number',
    supported: true
  },
  {
    key: "custom_sprint",
    name: "Sprint",
    schemaType: "array|string",
    custom: true,
    supported: true
  },
  {
    key: "labels",
    name: "Labels",
    schemaType: "array|string",
    custom: false,
    supported: true
  },
  {
    schemaType: "array|string",
    key: "components",
    name: "Components",
    custom: false,
    supported: true
  },
  {
    schemaType: "array|string",
    key: "fixVersions",
    name: "Fix Versions",
    custom: false,
    supported: true
  },
  {
    schemaType: "user",
    key: "assignee",
    name: "Assignee",
    custom: false,
    supported: true
  },
  {
    schemaType: "string",
    key: "columnA",
    name: "XYZ field",
    custom: false
  },
  {
    schemaType: "string",
    key: "columnB",
    name: "ABC field",
    custom: false
  },
  {
    schemaType: "string",
    key: "issuekey",
    name: "Key",
    custom: false
  },
  {
    schemaType: "string",
    key: "issuekey",
    name: "Key",
    custom: false
  },
  {
    schemaType: "string",
    key: "status",
    name: "Status",
    custom: false
  },
  {
    schemaType: "number",
    key: "timeoriginalestimate",
    name: "Original Estimate",
    custom: false

  },
  {
    schemaType: "date",
    key: "duedate",
    name: "Due Date",
    custom: false
  },
  {
    schemaType: "number",
    key: "timeestimate",
    name: "Remaining Estimate",
    custom: false
  },
  {
    schemaType: "priority",
    key: "priority",
    name: "Priority",
    custom: false
  }
]



describe('processing list of Jira Issues with status transition', () => {


  const updateJiraIssues = require('../src/jiraUpdateIssue.gs').updateJiraIssues;

  // mock the transitioning code
  const jiraStatusTransitioner = require('../src/jiraIssueStatusUpdates/issueTransitioner.gs');
  jest.mock('../src/jiraIssueStatusUpdates/issueTransitioner.gs', () => jest.fn());
  const mockTransitionFunction = jest.fn().mockImplementation(function () {
    return { success: true, errors: [] };
  });
  jiraStatusTransitioner.mockImplementation(function () {
    return {
      transition: mockTransitionFunction
    }
  });

  test("No status transition", () => {
    jiraApiMock.setAllResponsesSuccesfull(204);
    var result = updateJiraIssues({ columnA: 1, Key: 0 }, [["PBI-1", "column A value"]]);
    expect(mockTransitionFunction.mock.calls.length).toBe(0);
  });

  test("One issue with field status transition", () => {
    jiraApiMock.setAllResponsesSuccesfull(204);
    var result = updateJiraIssues({ status: 2, columnA: 1, Key: 0 }, [["PBI-1", "column A value", "DONE"]]);
    expect(mockTransitionFunction.mock.calls.length).toBe(1);
    expect(mockTransitionFunction.mock.calls[0][0]).toBe("PBI-1");
    expect(mockTransitionFunction.mock.calls[0][1]).toBe("DONE");
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(0);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    // status should be removed when calling to save the other fields
    expect(Object.keys(jiraApiMock.call.mock.calls[0][1].fields).length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][1].fields["columnA"]).toBe("column A value");
  });

  test("only the status is changed but a comment should still be added to the issue", () => {

    jiraApiMock.setAllResponsesSuccesfull(204);
    var result = updateJiraIssues({ status: 1, Key: 0 }, [["PBI-1", "DONE"]]);
    expect(mockTransitionFunction.mock.calls.length).toBe(2);
    expect(mockTransitionFunction.mock.calls[0][0]).toBe("PBI-1");
    expect(mockTransitionFunction.mock.calls[0][1]).toBe("DONE");
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(0);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    // status should be removed when calling to save the other fields
    expect(Object.keys(jiraApiMock.call.mock.calls[0][1].fields).length).toBe(0);
    // a comment was made
    expect(jiraApiMock.call.mock.calls[0][1]["update"]["comment"][0]["add"]["body"]).toBeDefined();
  });

  test("Error handling", () => {

    mockTransitionFunction.mockClear();
    mockTransitionFunction.mockImplementationOnce(function () {
      return { success: false, errors: ["an error"] };
    });
    jiraApiMock.setAllResponsesSuccesfull(204);
    var result = updateJiraIssues({ status: 2, columnA: 1, Key: 0 }, [["PBI-1", "column A value", "DONE"]]);
    expect(mockTransitionFunction.mock.calls.length).toBe(1);
    expect(mockTransitionFunction.mock.calls[0][0]).toBe("PBI-1");
    expect(mockTransitionFunction.mock.calls[0][1]).toBe("DONE");
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(1);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    // status should be removed when calling to save the other fields
    expect(Object.keys(jiraApiMock.call.mock.calls[0][1].fields).length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][1].fields["columnA"]).toBe("column A value");
    // a comment was made
    expect(jiraApiMock.call.mock.calls[0][1]["update"]["comment"][0]["add"]["body"]).toBeDefined();
  });
});

describe('processing list of Jira Issues', () => {

  const updateJiraIssues = require('../src/jiraUpdateIssue.gs').updateJiraIssues;
  test("no records to update", () => {
    var result = updateJiraIssues({}, []);
    expect(result.rowsUpdated).toBe(0);
    expect(result.status).toBe(false);
    expect(result.finished).toBe(true);
    expect(result.message).not.toBeNull();



    var result = updateJiraIssues({ columnA: 1, Key: 0 }, []);
    expect(result.rowsUpdated).toBe(0);
    expect(result.status).toBe(false);
    expect(result.finished).toBe(true);
  });

  test("Update a single issue", () => {
    jiraApiMock.setAllResponsesSuccesfull(204);

    var result = updateJiraIssues({ columnA: 1, Key: 0 }, [["PBI-1", "column A value"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(0);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated);
  });

  test("Checking fields which must have a value", () => {
    jiraApiMock.setAllResponsesSuccesfull(204);

    var result = updateJiraIssues({ columnA: 2, priority: 1, Key: 0 }, [["PBI-1", "", "column A value"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(1);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueUpdate");
    expect(jiraApiMock.call.mock.calls[0][1].fields["priority"]).not.toBeDefined();


    var result = updateJiraIssues({ columnA: 2, priority: 1, Key: 0 }, [["PBI-1", "P1", "column A value"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(0);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(2);
    expect(jiraApiMock.call.mock.calls[1][0]).toBe("issueUpdate");
    expect(jiraApiMock.call.mock.calls[1][1].fields["priority"]).toEqual({ name: "P1" });
  });


  test("Update two issues", () => {
    jiraApiMock.setAllResponsesSuccesfull(204);
    var result = updateJiraIssues({ columnA: 1, Key: 0 }, [["PBI-1", "column A value"], ["PBI-2", "column A value 2"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(2);
    expect(result.errors.length).toBe(0);
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated);
  });


  test("Update multiple issues where two have no valid JIRA Issue Key", () => {
    jiraApiMock.setAllResponsesSuccesfull(204);
    var result = updateJiraIssues({ columnA: 1, Key: 0 }, [[null, "column A value"], ["", "column A value"], ["PBI-2", "column A value 2"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(1);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]).toContain("No Key value found in row");
    expect(result.errors[1]).toContain("No Key value found in row");
    expect(result.status).toBe(true);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated);
  });

  test("Update multiple issues where the server responds with errors", () => {
    jiraApiMock.setAllResponsesFail();
    var result = updateJiraIssues({ columnA: 1, Key: 0 }, [["PBI-1", "column A value"], ["PBI-2", "column A value 2"]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(0);
    expect(result.errors.length).toBe(2);
    expect(result.status).toBe(false);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(2);
  });

  test("Test specific field error messages from JIRA", () => {
    jiraApiMock.resetMocks();
    jiraApiMock.setAllResponsesFail(400, {
      errors: {
        columnA: "field specific error",
        columnB: "something wrong here too"
      }
    });
    var result = updateJiraIssues({ "XYZ field": 1, Key: 0, columnB: 2 }, [["PBI-1", "column A value", ""], ["PBI-2", "column A value 2", ""]]);
    expect(result.message).not.toBeNull();
    expect(result.rowsUpdated).toBe(0);
    expect(result.errors.length).toBe(2);
    expect(result.errors[0]).toContain("field specific error");
    expect(result.errors[0]).toContain("XYZ field");
    expect(result.errors[0]).toContain("ABC field");
    expect(result.errors[1]).toContain("field specific error");
    expect(result.errors[1]).toContain("XYZ field");
    expect(result.errors[1]).toContain("ABC field");
    expect(result.status).toBe(false);
    expect(result.finished).toBe(true);
    expect(jiraApiMock.call.mock.calls.length).toBe(2);
  });

});


describe("Packing data from a spreadsheet row ready for Jira API", () => {
  const packageRowForUpdate = require('../src/jiraUpdateIssue.gs').packageRowForUpdate;

  test('simple row', () => {
    var result = packageRowForUpdate({ "My custom field": 1, Key: 0 }, ["PBI-1", "column A value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-1");
    expect(result.fields).not.toBeNull();
    expect(result.fields.custom1234).toBe("column A value");
    expect(Object.keys(result.fields).length).toBe(1);

    var result = packageRowForUpdate({ Key: 0, "My custom field": 1, "My custom field 2": 3 }, ["PBI-1", "column A value", "should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-1");
    expect(result.fields).not.toBeNull();
    expect(result.fields.custom1234).toBe("column A value");
    expect(result.fields.custom5678).toBe("column B value");
    expect(Object.keys(result.fields).length).toBe(2);
    expect(result.update).not.toBeDefined();
    expect(result.fields.timetracking).not.toBeDefined();

    var result = packageRowForUpdate({ "My custom field": 1, Key: 0 }, ["PBI-22", "column A value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-22");
    expect(result.fields).not.toBeNull();
    expect(result.fields.custom1234).toBe("column A value");
    expect(result.update).not.toBeDefined();
    expect(result.fields.timetracking).not.toBeDefined();
    expect(Object.keys(result.fields).length).toBe(1);

    var result = packageRowForUpdate({ number1: 1, issuekey: 0 }, ["PBI-22", ""]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-22");
    expect(result.fields).not.toBeNull();
    expect(result.fields.number1).toBe(null);
    expect(Object.keys(result.fields).length).toBe(1);
    expect(result.update).not.toBeDefined();
    expect(result.fields.timetracking).not.toBeDefined();

  });

  test("Null value for a key", () => {
    var result = packageRowForUpdate({ Key: 0, columnA: 1, columnB: 3 }, ["", "column A value", "should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();

    var result = packageRowForUpdate({ Key: 0, columnA: 1, columnB: 3 }, [null, "column A value", "should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();


    var result = packageRowForUpdate({ columnA: 1, columnB: 3 }, [null, "column A value", "should be ignored", "column B value"]);
    expect(result).not.toBeNull();
    expect(result.key).toBeNull();


  });

  test("Put time estimates in format for JIRA", () => {
    var result = packageRowForUpdate(
      { "Original Estimate": 1, Key: 0 },
      ["PBI-1", "1d",]
    );
    /*schemaType: "string",
    key: "timeoriginalestimate",
    name: "Original Estimate",
    custom: false*/
    expect(result.key).toBe("PBI-1");
    expect(result.fields).toBeDefined();
    expect(result.fields.timeoriginalestimate).not.toBeDefined();
    expect(result.fields.timetracking).toBeDefined();
    expect(result.fields.timetracking.originalEstimate).toBeDefined();
    expect(result.fields.timetracking.originalEstimate).toBe("1d");
    /*
    "timetracking": {
      "originalEstimate": "10",
      "remainingEstimate": "5"
    },
    */

    var result = packageRowForUpdate(
      { "Original Estimate": 1, Key: 0 },
      ["PBI-1", "",]
    );
    /*schemaType: "string",
    key: "timeoriginalestimate",
    name: "Original Estimate",
    custom: false*/
    expect(result.key).toBe("PBI-1");
    expect(result.fields).toBeDefined();
    expect(result.fields.timeoriginalestimate).not.toBeDefined();
    expect(result.fields.timetracking).toBeDefined();
    expect(result.fields.timetracking.originalEstimate).toBeDefined();
    expect(result.fields.timetracking.originalEstimate).toBeNull();


    var result = packageRowForUpdate(
      { "Remaining Estimate": 1, Key: 0 },
      ["PBI-1", "1d",]
    );
    expect(result.key).toBe("PBI-1");
    expect(result.fields).toBeDefined();
    expect(result.fields.timeestimate).not.toBeDefined();
    expect(result.fields.timetracking).toBeDefined();
    expect(result.fields.timetracking.remainingEstimate).toBeDefined();
    expect(result.fields.timetracking.remainingEstimate).toBe("1d");
    var result = packageRowForUpdate(
      { "Original Estimate": 2, "Remaining Estimate": 1, Key: 0 },
      ["PBI-1", "1d", "2d"]
    );
    expect(result.key).toBe("PBI-1");
    expect(result.fields).toBeDefined();
    expect(result.fields.timeoriginalestimate).not.toBeDefined();
    expect(result.fields.timeestimate).not.toBeDefined();
    expect(result.fields.timetracking).toBeDefined();
    expect(result.fields.timetracking.remainingEstimate).toBeDefined();
    expect(result.fields.timetracking.remainingEstimate).toBe("1d");
    expect(result.fields.timetracking.originalEstimate).toBeDefined();
    expect(result.fields.timetracking.originalEstimate).toBe("2d");
  });


  test("packing a row with Components and Fix Versions in the payload", () => {
    var result = packageRowForUpdate({ "My custom field": 1, Key: 0, "Components": 2 }, ["PBI-1", "column A value", "x,y,z"]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-1");
    expect(result.fields).not.toBeNull();
    expect(result.fields.custom1234).toBe("column A value");
    expect(result.update).not.toBeNull();
    expect(result.update.components).toBeDefined();
    expect(result.update.components.length).toBe(1);
    expect(result.update.components[0]).toEqual({ "set": [{ "name": "x" }, { "name": "y" }, { "name": "z" }] });
    expect(Object.keys(result.fields).length).toBe(1);


    var result = packageRowForUpdate({ "My custom field": 1, Key: 0, "Components": 2 }, ["PBI-1", "column A value", ""]);
    expect(result).not.toBeNull();
    expect(result.key).toBe("PBI-1");
    expect(result.fields).not.toBeNull();
    expect(result.fields.custom1234).toBe("column A value");
    expect(result.update).not.toBeNull();
    expect(result.update.components).toBeDefined();
    expect(result.update.components.length).toBe(1);
    expect(result.update.components[0]).toEqual({ "set": [] });
    expect(Object.keys(result.fields).length).toBe(1);
  });
}
)



test("Posting Individual Issues to Jira - Not Found Error", () => {

  jiraApiMock.withFailureHandler.mockImplementationOnce(
    (callback) => {
      callback({
        errors: { a: "A had an issue with its payload" }
      }, null, 404);
      return jiraApiMock
    });

  jiraApiMock.call.mockImplementationOnce(
    (method, params) => {
      return jiraApiMock;
    }
  );
  jiraApiMock.getResponse.mockImplementationOnce(
    () => {
      return { statusCode: 404, success: false };
    }
  );
  const updateIssueinJira = require('../src/jiraUpdateIssue.gs').updateIssueinJira;

  const mockCallback = jest.fn((key, status, message) => { key });
  var result = updateIssueinJira({ key: "PBI-1", fields: { a: "b" } }, mockCallback);

  expect(result).toBe(false);
  expect(jiraApiMock.call.mock.calls.length).toBe(1);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueUpdate");
  expect(jiraApiMock.call.mock.calls[0][1]["issueIdOrKey"]).toBe("PBI-1");
  expect(jiraApiMock.call.mock.calls[0][1]["fields"]["a"]).toBe("b");

  expect(mockCallback.mock.calls.length).toBe(1);
  expect(mockCallback.mock.calls[0][0]).toBe("PBI-1");
  expect(mockCallback.mock.calls[0][1]).toBe(false);
  expect(mockCallback.mock.calls[0][2]).toBe("PBI-1 Not found");
});


test("Posting Individual Issues to Jira - Error with data passed to field", () => {

  jiraApiMock.setAllResponsesFail(400, {
    errors: { a: "A had an issue with its payload" }
  });

  const updateIssueinJira = require('../src/jiraUpdateIssue.gs').updateIssueinJira;

  const mockCallback = jest.fn((key, status, message) => { key });
  var result = updateIssueinJira({ key: "PBI-1", fields: { a: "b" } }, mockCallback);

  expect(result).toBe(false);
  expect(jiraApiMock.call.mock.calls.length).toBe(1);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueUpdate");
  expect(jiraApiMock.call.mock.calls[0][1]["issueIdOrKey"]).toBe("PBI-1");
  expect(jiraApiMock.call.mock.calls[0][1]["fields"]["a"]).toBe("b");

  expect(mockCallback.mock.calls.length).toBe(1);
  expect(mockCallback.mock.calls[0][0]).toBe("PBI-1");
  expect(mockCallback.mock.calls[0][1]).toBe(false);
  expect(mockCallback.mock.calls[0][2]).toContain("{Field:a}");
});

test("Posting Individual Issues to Jira - Success", () => {
  const updateIssueinJira = require('../src/jiraUpdateIssue.gs').updateIssueinJira;
  const mockCallback = jest.fn((key, status, message) => { key });
  jiraApiMock.setAllResponsesSuccesfull(204);
  var result = updateIssueinJira({ key: "PBI-2", fields: { a: "b" } }, mockCallback);
  expect(result).toBe(true);
  expect(mockCallback.mock.calls.length).toBe(1);
  expect(mockCallback.mock.calls[0][0]).toBe("PBI-2");
  expect(mockCallback.mock.calls[0][1]).toBe(true);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueUpdate");
  expect(jiraApiMock.call.mock.calls[0][1]["issueIdOrKey"]).toBe("PBI-2");
  expect(jiraApiMock.call.mock.calls[0][1]["fields"]["a"]).toBe("b");
  // should have a comment
  expect(jiraApiMock.call.mock.calls[0][1]["update"]["comment"][0]["add"]["body"]).toBeDefined();
});

test("field validation", () => {
  const getMatchingJiraFields = require("../src/jiraUpdateIssue.gs").getMatchingJiraFields;

  var getFilteredList = getMatchingJiraFields(
    { "custom1234": 1, "Not a Match": 2, "My custom field 2": 3, "Original Estimate": 4 }
  );
  expect(getFilteredList).not.toBeNull();
  expect(Object.keys(getFilteredList).length).toBe(3);
  expect(getFilteredList["custom1234"]).not.toBeNull();
  expect(getFilteredList["custom1234"].index).toBe(1);
  expect(getFilteredList["custom1234"].definition.name).toBe("My custom field");
  expect(getFilteredList["custom5678"].index).toBe(3);
  expect(getFilteredList["timeoriginalestimate"].index).toBe(4);
  expect(getFilteredList["timeoriginalestimate"].definition.name).toBe("Original Estimate");

  expect(getFilteredList["Not a Match"]).not.toBeDefined();
  expect(getFilteredList["My custom field 2"]).not.toBeDefined();
});

describe("Converting data from spreadsheet cells to Jira format - field by field ", () => {
  test("Format string fields for JIRA", () => {
    const formatFieldValueForJira = require('../src/jiraUpdateIssue.gs').formatFieldValueForJira;
    var jiraFieldToUse = jiraFieldList[0];
    expect(jiraFieldToUse.schemaType).toBe("string"); // just in case the test data gets re-ordered
    expect(formatFieldValueForJira(jiraFieldToUse, "PB-1")).toBe("PB-1"); // just pass it a string 
    expect(formatFieldValueForJira(jiraFieldToUse, "1223")).toBe("1223"); // just pass it a string 
    expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(""); // just pass it a string 
  })

  test("Format empty number fields for JIRA", () => {
    const formatFieldValueForJira = require('../src/jiraUpdateIssue.gs').formatFieldValueForJira;
    var jiraFieldToUse = jiraFieldList[4];
    expect(jiraFieldToUse.key).toBe("number1"); // just in case the test data gets re-ordered
    expect(jiraFieldToUse.schemaType).toBe("number"); // just in case the test data gets re-ordered
    expect(formatFieldValueForJira(jiraFieldToUse, "PB-1")).toBe("PB-1"); // just pass it a string
    expect(formatFieldValueForJira(jiraFieldToUse, "1223")).toBe("1223"); // just pass it a string
    expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null); // null required to clear a number field
  })



  test("Date Time fields for JIRA", () => {
    const formatFieldValueForJira = require('../src/jiraUpdateIssue.gs').formatFieldValueForJira;
    var jiraFieldToUse = jiraFieldList[16];
    expect(jiraFieldToUse.key).toBe("duedate"); // just in case the test data gets re-ordered
    expect(jiraFieldToUse.schemaType).toBe("date"); // just in case the test data gets re-ordered
    expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null); // null
    expect(formatFieldValueForJira(jiraFieldToUse, "abc")).toBe("abc"); // just pass it a string
    expect(formatFieldValueForJira(jiraFieldToUse, "12/04/1988")).toBe("12/04/1988"); // just pass it a string
  })

  test("Format empty sprint fields for JIRA", () => {
    const formatFieldValueForJira = require('../src/jiraUpdateIssue.gs').formatFieldValueForJira;
    var jiraFieldToUse = jiraFieldList[5];
    expect(jiraFieldToUse.key).toBe("custom_sprint"); // just in case the test data gets re-ordered
    expect(jiraFieldToUse.schemaType).toBe("array|string"); // just in case the test data gets re-ordered
    expect(formatFieldValueForJira(jiraFieldToUse, "PB-1")).toEqual(["PB-1"]); // just pass it a string - let JIRA error
    expect(formatFieldValueForJira(jiraFieldToUse, "1223")).toEqual(1223); // convert to number
    expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null); // null required to clear a number field
  })

  test("Sending labels to JIRA", () => {
    const formatFieldValueForJira = require('../src/jiraUpdateIssue.gs').formatFieldValueForJira;
    var jiraFieldToUse = jiraFieldList[6];
    expect(jiraFieldToUse.key).toBe("labels"); // just in case the test data gets re-ordered
    expect(jiraFieldToUse.schemaType).toBe("array|string"); // just in case the test data gets re-ordered
    expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null);
    expect(formatFieldValueForJira(jiraFieldToUse, "GNS-Metapod")).toEqual(["GNS-Metapod"]);
    expect(formatFieldValueForJira(jiraFieldToUse, "GNS-Metapod,Test")).toEqual(["GNS-Metapod", "Test"]);
    expect(formatFieldValueForJira(jiraFieldToUse, "GNS-Metapod, Test")).toEqual(["GNS-Metapod", "Test"]);
    expect(formatFieldValueForJira(jiraFieldToUse, ",GNS-Metapod, Test")).toEqual(["GNS-Metapod", "Test"]);
    expect(formatFieldValueForJira(jiraFieldToUse, ",GNS-Metapod,, Test")).toEqual(["GNS-Metapod", "Test"]);


    // bug https://github.com/ljay79/jira-tools/issues/173
    var fieldList = [{
      key: 'customfield_11121',
      name: 'cField Labels',
      custom: true,
      schemaType: 'array|string',
      supported: true,
      isVirtual: false
    }]
    expect(formatFieldValueForJira(fieldList[0], "")).toBe(null);
    expect(formatFieldValueForJira(fieldList[0], "GNS-Metapod")).toEqual(["GNS-Metapod"]);
    expect(formatFieldValueForJira(fieldList[0], "GNS-Metapod,Test")).toEqual(["GNS-Metapod", "Test"]);
    expect(formatFieldValueForJira(fieldList[0], "GNS-Metapod, Test")).toEqual(["GNS-Metapod", "Test"]);

  });

  test("Sending users to JIRA", () => {
    const formatFieldValueForJira = require('../src/jiraUpdateIssue.gs').formatFieldValueForJira;
    var jiraFieldToUse = jiraFieldList[9];
    expect(jiraFieldToUse.schemaType).toBe("user"); // just in case the test data gets re-ordered
    expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null);
    expect(formatFieldValueForJira(jiraFieldToUse, "plemon")).toEqual({ name: "plemon" });

  });


  test("Sending prioirty values to JIRA", () => {
    const formatFieldValueForJira = require('../src/jiraUpdateIssue.gs').formatFieldValueForJira;
    var jiraFieldToUse = jiraFieldList[18];
    expect(jiraFieldToUse.schemaType).toBe("priority"); // just in case the test data gets re-ordered
    expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null);
    expect(formatFieldValueForJira(jiraFieldToUse, "P1")).toEqual({ name: "P1" });
  });
});


test("Including fields and/or items in the update ", () => {
  const updateIssueinJira = require('../src/jiraUpdateIssue.gs').updateIssueinJira;
  const mockCallback = jest.fn((key, status, message) => { key });
  jiraApiMock.setAllResponsesSuccesfull(204);
  var componentsData = [{ "set": [{ "name": "Engine" }, { "name": "Trans/A" }] }];

  var result = updateIssueinJira({
    key: "PBI-2",
    update: { "components": componentsData }
  }, mockCallback);
  expect(result).toBe(true);
  expect(mockCallback.mock.calls.length).toBe(1);
  expect(mockCallback.mock.calls[0][0]).toBe("PBI-2");
  expect(mockCallback.mock.calls[0][1]).toBe(true);
  var putCall = jiraApiMock.call.mock.calls[0];
  expect(putCall[0]).toBe("issueUpdate");
  expect(putCall[1]["issueIdOrKey"]).toBe("PBI-2");
  expect(putCall[1]["update"]["fields"]).not.toBeDefined();
  expect(Object.keys(putCall[1]["update"]).length).toBe(2);
  expect(putCall[1]["update"]["components"]).toBeDefined();
  expect(putCall[1]["update"]["components"]).toBe(componentsData);
  // should have a comment
  expect(jiraApiMock.call.mock.calls[0][1]["update"]["comment"][0]["add"]["body"]).toBeDefined();

  mockCallback.mockReset();
  jiraApiMock.call.mockReset();

  var result = updateIssueinJira({
    key: "PBI-2",
    update: { "components": componentsData },
    fields: { a: "b" }
  }, mockCallback);
  expect(result).toBe(true);
  expect(mockCallback.mock.calls.length).toBe(1);
  expect(mockCallback.mock.calls[0][0]).toBe("PBI-2");
  expect(mockCallback.mock.calls[0][1]).toBe(true);
  var putCall = jiraApiMock.call.mock.calls[0];
  expect(putCall[0]).toBe("issueUpdate");
  expect(putCall[1]["issueIdOrKey"]).toBe("PBI-2");
  expect(jiraApiMock.call.mock.calls[0][1]["fields"]["a"]).toBe("b");
  expect(Object.keys(putCall[1]["update"]).length).toBe(2);
  expect(putCall[1]["update"]["components"]).toBeDefined();
  expect(putCall[1]["update"]["components"]).toBe(componentsData);
  // should have a comment
  expect(jiraApiMock.call.mock.calls[0][1]["update"]["comment"][0]["add"]["body"]).toBeDefined();
});