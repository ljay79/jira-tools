
jiraApiMock = require('./mocks/mockJiraApi.js');
const debug = require("../src/debug.gs").debug;
global.environmentConfiguration = require('../src/environmentConfiguration.gs');


beforeEach(() => {
  debug.enable(true);
  jest.resetModules();
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
    schema: { type: "array|string" },
    key: "components",
    name: "Components",
    custom: false,
    supported: true
  },
  {
    schema: { type: "array|string" },
    key: "fixVersions",
    name: "Fix Versions",
    custom: false,
    supported: true
  }
]

test('processing list of Jira Issues with status transition', () => {

  // set up field types
  var fieldList = [
    {
      schema: { type: "string" },
      key: "columnA",
      name: "XYZ field",
      custom: false
    },
    {
      schema: { type: "string" },
      key: "columnB",
      name: "ABC field",
      custom: false
    },
    {
      schema: { type: "string" },
      key: "issuekey",
      name: "Key",
      custom: false
    },
    {
      schema: { type: "string" },
      key: "issuekey",
      name: "Key",
      custom: false
    },
    {
      schema: { type: "string" },
      key: "status",
      name: "Status",
      custom: false
    }
  ];

  jiraApiMock.setAllResponsesSuccesfull(204);
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  var jiraStatusTransitioner = require('../src/jiraIssueStatusUpdates/issueTransitioner.gs');
  jest.mock('../src/jiraIssueStatusUpdates/issueTransitioner.gs', () => jest.fn());
  var mockTransitionFunction = jest.fn().mockImplementation(function () {
    return { success: true, errors: [] };
  });
  jiraStatusTransitioner.mockImplementation(function () {
    return {
      transition: mockTransitionFunction
    }
  });

  const updateJiraIssues = require('../src/jiraUpdateTicket.gs').updateJiraIssues;

  var result = updateJiraIssues({ columnA: 1, Key: 0 }, [["PBI-1", "column A value"]]);
  expect(mockTransitionFunction.mock.calls.length).toBe(0);

  jiraApiMock.resetMocks();
  jiraApiMock.setAllResponsesSuccesfull(204);
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  var result = updateJiraIssues({ status: 2, columnA: 1, Key: 0 }, [["PBI-1", "column A value", "DONE"]]);
  expect(mockTransitionFunction.mock.calls.length).toBe(1);
  expect(mockTransitionFunction.mock.calls[0][0]).toBe("PBI-1");
  expect(mockTransitionFunction.mock.calls[0][1]).toBe("DONE");
  expect(result.message).not.toBeNull();
  expect(result.rowsUpdated).toBe(1);
  expect(result.errors.length).toBe(0);
  expect(result.status).toBe(true);
  expect(result.finished).toBe(true);
  expect(jiraApiMock.call.mock.calls.length).toBe(2);
  // status should be removed when calling to save the other fields
  expect(Object.keys(jiraApiMock.call.mock.calls[1][1].fields).length).toBe(1);
  expect(jiraApiMock.call.mock.calls[1][1].fields["columnA"]).toBe("column A value");


  // only the status is changed but a comment should still be added to the issue
  jiraApiMock.resetMocks();
  jiraApiMock.setAllResponsesSuccesfull(204);
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  var result = updateJiraIssues({ status: 1, Key: 0 }, [["PBI-1", "DONE"]]);
  expect(mockTransitionFunction.mock.calls.length).toBe(2);
  expect(mockTransitionFunction.mock.calls[0][0]).toBe("PBI-1");
  expect(mockTransitionFunction.mock.calls[0][1]).toBe("DONE");
  expect(result.message).not.toBeNull();
  expect(result.rowsUpdated).toBe(1);
  expect(result.errors.length).toBe(0);
  expect(result.status).toBe(true);
  expect(result.finished).toBe(true);
  expect(jiraApiMock.call.mock.calls.length).toBe(2);
  // status should be removed when calling to save the other fields
  expect(Object.keys(jiraApiMock.call.mock.calls[1][1].fields).length).toBe(0);
  // a comment was made
  expect(jiraApiMock.call.mock.calls[1][1]["update"]["comment"][0]["add"]["body"]).toBeDefined();


  jiraApiMock.resetMocks();
  mockTransitionFunction.mockClear();
  mockTransitionFunction.mockImplementationOnce(function () {
    return { success: false, errors: ["an error"] };
  });
  jiraApiMock.setAllResponsesSuccesfull(204);
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  var result = updateJiraIssues({ status: 2, columnA: 1, Key: 0 }, [["PBI-1", "column A value", "DONE"]]);
  expect(mockTransitionFunction.mock.calls.length).toBe(1);
  expect(mockTransitionFunction.mock.calls[0][0]).toBe("PBI-1");
  expect(mockTransitionFunction.mock.calls[0][1]).toBe("DONE");
  expect(result.message).not.toBeNull();
  expect(result.rowsUpdated).toBe(1);
  expect(result.errors.length).toBe(1);
  expect(result.status).toBe(true);
  expect(result.finished).toBe(true);
  expect(jiraApiMock.call.mock.calls.length).toBe(2);
  // status should be removed when calling to save the other fields
  expect(Object.keys(jiraApiMock.call.mock.calls[1][1].fields).length).toBe(1);
  expect(jiraApiMock.call.mock.calls[1][1].fields["columnA"]).toBe("column A value");
  // a comment was made
  expect(jiraApiMock.call.mock.calls[1][1]["update"]["comment"][0]["add"]["body"]).toBeDefined();

});

test('processing list of Jira Issues', () => {

  const updateJiraIssues = require('../src/jiraUpdateTicket.gs').updateJiraIssues;
  var result = updateJiraIssues({}, []);
  expect(result.rowsUpdated).toBe(0);
  expect(result.status).toBe(false);
  expect(result.finished).toBe(true);
  expect(result.message).not.toBeNull();


  var result = updateJiraIssues({ columnA: 1, Key: 0 }, []);
  expect(result.rowsUpdated).toBe(0);
  expect(result.status).toBe(false);
  expect(result.finished).toBe(true);


  // set up field types
  var fieldList = [
    {
      schema: { type: "string" },
      key: "columnA",
      name: "XYZ field",
      custom: false
    },
    {
      schema: { type: "string" },
      key: "columnB",
      name: "ABC field",
      custom: false
    },
    {
      schema: { type: "string" },
      key: "issuekey",
      name: "Key",
      custom: false
    }
  ];

  jiraApiMock.setAllResponsesSuccesfull(204);
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);

  var result = updateJiraIssues({ columnA: 1, Key: 0 }, [["PBI-1", "column A value"]]);
  expect(result.message).not.toBeNull();
  expect(result.rowsUpdated).toBe(1);
  expect(result.errors.length).toBe(0);
  expect(result.status).toBe(true);
  expect(result.finished).toBe(true);
  expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated + 1);

  jiraApiMock.setAllResponsesSuccesfull(204);
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  var result = updateJiraIssues({ columnA: 1, Key: 0 }, [["PBI-1", "column A value"], ["PBI-2", "column A value 2"]]);
  expect(result.message).not.toBeNull();
  expect(result.rowsUpdated).toBe(2);
  expect(result.errors.length).toBe(0);
  expect(result.status).toBe(true);
  expect(result.finished).toBe(true);
  expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated + 1);

  jiraApiMock.setAllResponsesSuccesfull(204);
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  var result = updateJiraIssues({ columnA: 1, Key: 0 }, [[null, "column A value"], ["", "column A value"], ["PBI-2", "column A value 2"]]);
  expect(result.message).not.toBeNull();
  expect(result.rowsUpdated).toBe(1);
  expect(result.errors.length).toBe(2);
  expect(result.errors[0]).toContain("No Key value found in row");
  expect(result.errors[1]).toContain("No Key value found in row");
  expect(result.status).toBe(true);
  expect(result.finished).toBe(true);
  expect(jiraApiMock.call.mock.calls.length).toBe(result.rowsUpdated + 1);


  jiraApiMock.setAllResponsesFail();
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  var result = updateJiraIssues({ columnA: 1, Key: 0 }, [["PBI-1", "column A value"], ["PBI-2", "column A value 2"]]);
  expect(result.message).not.toBeNull();
  expect(result.rowsUpdated).toBe(0);
  expect(result.errors.length).toBe(2);
  expect(result.status).toBe(false);
  expect(result.finished).toBe(true);
  expect(jiraApiMock.call.mock.calls.length).toBe(3);

  jiraApiMock.setAllResponsesFail(400, {
    errors: {
      columnA: "field specific error",
      columnB: "something wrong here too"
    }
  });
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
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
  expect(jiraApiMock.call.mock.calls.length).toBe(3);

});


test('packing a row', () => {
  const packageRowForUpdate = require('../src/jiraUpdateTicket.gs').packageRowForUpdate;
  var result = packageRowForUpdate(jiraFieldList, { "My custom field": 1, Key: 0 }, ["PBI-1", "column A value"]);
  expect(result).not.toBeNull();
  expect(result.key).toBe("PBI-1");
  expect(result.fields).not.toBeNull();
  expect(result.fields.custom1234).toBe("column A value");
  expect(Object.keys(result.fields).length).toBe(1);

  var result = packageRowForUpdate(jiraFieldList, { Key: 0, "My custom field": 1, "My custom field 2": 3 }, ["PBI-1", "column A value", "should be ignored", "column B value"]);
  expect(result).not.toBeNull();
  expect(result.key).toBe("PBI-1");
  expect(result.fields).not.toBeNull();
  expect(result.fields.custom1234).toBe("column A value");
  expect(result.fields.custom5678).toBe("column B value");
  expect(Object.keys(result.fields).length).toBe(2);
  expect(result.update).not.toBeDefined();

  var result = packageRowForUpdate(jiraFieldList, { Key: 0, columnA: 1, columnB: 3 }, ["", "column A value", "should be ignored", "column B value"]);
  expect(result).not.toBeNull();
  expect(result.key).toBeNull();

  var result = packageRowForUpdate(jiraFieldList, { Key: 0, columnA: 1, columnB: 3 }, [null, "column A value", "should be ignored", "column B value"]);
  expect(result).not.toBeNull();
  expect(result.key).toBeNull();


  var result = packageRowForUpdate(jiraFieldList, { columnA: 1, columnB: 3 }, [null, "column A value", "should be ignored", "column B value"]);
  expect(result).not.toBeNull();
  expect(result.key).toBeNull();

  var result = packageRowForUpdate(jiraFieldList, { "My custom field": 1, Key: 0 }, ["PBI-22", "column A value"]);
  expect(result).not.toBeNull();
  expect(result.key).toBe("PBI-22");
  expect(result.fields).not.toBeNull();
  expect(result.fields.custom1234).toBe("column A value");
  expect(result.update).not.toBeDefined();
  expect(Object.keys(result.fields).length).toBe(1);


  var result = packageRowForUpdate(jiraFieldList, { number1: 1, issuekey: 0 }, ["PBI-22", ""]);
  expect(result).not.toBeNull();
  expect(result.key).toBe("PBI-22");
  expect(result.fields).not.toBeNull();
  expect(result.fields.number1).toBe(null);
  expect(Object.keys(result.fields).length).toBe(1);
  expect(result.update).not.toBeDefined();
});

test("packing a row with Components and Fix Versions in the payload", () => {
  console.log("packing a row with Components and Fix Versions in the payload");
  const packageRowForUpdate = require('../src/jiraUpdateTicket.gs').packageRowForUpdate;
  var result = packageRowForUpdate(jiraFieldList, { "My custom field": 1, Key: 0,"Components":2 }, ["PBI-1", "column A value","x,y,z"]);
  expect(result).not.toBeNull();
  expect(result.key).toBe("PBI-1");
  expect(result.fields).not.toBeNull();
  expect(result.fields.custom1234).toBe("column A value");
  expect(result.update).not.toBeNull();
  expect(result.update.components).toBeDefined();
  expect(result.update.components.length).toBe(1);
  expect(result.update.components[0]).toEqual({ "set": [{ "name": "x" }, { "name": "y" }, { "name": "z" }] });
  expect(Object.keys(result.fields).length).toBe(1);
});

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
  const updateIssueinJira = require('../src/jiraUpdateTicket.gs').updateIssueinJira;

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

  const updateIssueinJira = require('../src/jiraUpdateTicket.gs').updateIssueinJira;

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
  const updateIssueinJira = require('../src/jiraUpdateTicket.gs').updateIssueinJira;
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
  const getMatchingJiraFields = require("../src/jiraUpdateTicket.gs").getMatchingJiraFields;

  var getFilteredList = getMatchingJiraFields(
    jiraFieldList, { "custom1234": 1, "Not a Match": 2, "My custom field 2": 3 }
  );
  expect(getFilteredList).not.toBeNull();
  expect(Object.keys(getFilteredList).length).toBe(2);
  expect(getFilteredList["custom1234"]).not.toBeNull();
  expect(getFilteredList["custom1234"].index).toBe(1);
  expect(getFilteredList["custom1234"].definition.name).toBe("My custom field");
  expect(getFilteredList["custom5678"].index).toBe(3);
  expect(getFilteredList["Not a Match"]).not.toBeDefined();
  expect(getFilteredList["My custom field 2"]).not.toBeDefined();
});


test("Format string fields for JIRA", () => {
  const formatFieldValueForJira = require('../src/jiraUpdateTicket.gs').formatFieldValueForJira;
  var jiraFieldToUse = jiraFieldList[0];
  expect(jiraFieldToUse.schemaType).toBe("string"); // just in case the test data gets re-ordered
  expect(formatFieldValueForJira(jiraFieldToUse, "PB-1")).toBe("PB-1"); // just pass it a string 
  expect(formatFieldValueForJira(jiraFieldToUse, "1223")).toBe("1223"); // just pass it a string 
  expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(""); // just pass it a string 
})

test("Format empty number fields for JIRA", () => {
  const formatFieldValueForJira = require('../src/jiraUpdateTicket.gs').formatFieldValueForJira;
  var jiraFieldToUse = jiraFieldList[4];
  expect(jiraFieldToUse.key).toBe("number1"); // just in case the test data gets re-ordered
  expect(jiraFieldToUse.schemaType).toBe("number"); // just in case the test data gets re-ordered
  expect(formatFieldValueForJira(jiraFieldToUse, "PB-1")).toBe("PB-1"); // just pass it a string
  expect(formatFieldValueForJira(jiraFieldToUse, "1223")).toBe("1223"); // just pass it a string
  expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null); // null required to clear a number field
})

test("Format empty sprint fields for JIRA", () => {
  const formatFieldValueForJira = require('../src/jiraUpdateTicket.gs').formatFieldValueForJira;
  var jiraFieldToUse = jiraFieldList[5];
  expect(jiraFieldToUse.key).toBe("custom_sprint"); // just in case the test data gets re-ordered
  expect(jiraFieldToUse.schemaType).toBe("array|string"); // just in case the test data gets re-ordered
  expect(formatFieldValueForJira(jiraFieldToUse, "PB-1")).toBe("PB-1"); // just pass it a string - let JIRA error
  expect(formatFieldValueForJira(jiraFieldToUse, "1223")).toBe(1223); // convert to number
  expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null); // null required to clear a number field
})

test("Sending labels to JIRA", () => {
  const formatFieldValueForJira = require('../src/jiraUpdateTicket.gs').formatFieldValueForJira;
  var jiraFieldToUse = jiraFieldList[6];
  expect(jiraFieldToUse.key).toBe("labels"); // just in case the test data gets re-ordered
  expect(jiraFieldToUse.schemaType).toBe("array|string"); // just in case the test data gets re-ordered
  expect(formatFieldValueForJira(jiraFieldToUse, "")).toBe(null);
  expect(formatFieldValueForJira(jiraFieldToUse, "GNS-Metapod")).toEqual(["GNS-Metapod"]);
  expect(formatFieldValueForJira(jiraFieldToUse, "GNS-Metapod,Test")).toEqual(["GNS-Metapod", "Test"]);

});

test("Including fields and/or items in the update ", () => {
  const updateIssueinJira = require('../src/jiraUpdateTicket.gs').updateIssueinJira;
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