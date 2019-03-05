var testData = require('./mockIssueTransitionData.js');
var jiraApiMock = require('../mocks/mockJiraApi.js');

var testTransitionResponses = require('./mockIssueTransitionData.js');

beforeEach(() =>  {
    jiraApiMock.resetMocks();
});

test("Dealing with error cases when retrieving the transition id needed", () => {
  const IssueTransitioner = require('../../src/jiraIssueStatusUpdates/issueTransitioner.gs');
  var issueTransitioner = new IssueTransitioner();
  jiraApiMock.setAllResponsesFail(500, { errorMessages: ["Mocked Error"] });
  var transitionStatus = issueTransitioner.getTransitionStatus("PBI-1", "Testing");
  expect(transitionStatus.transitionNeeded).toBe(true);
  expect(transitionStatus.errors.length).toBe(1);
  expect(jiraApiMock.call.mock.calls.length).toBe(1);


  // error with response from request for possible transitions
  jiraApiMock.resetMocks();
  jiraApiMock.setResponseSequence([
    { 'respData': { "key": "AB-1", "fields": { "status": { "name": "TO DO", } } }, success: true },
    { 'respData': { "errorMessages": ["Internal server error"], "errors": {} }, success: false, statusCode: 500 }
  ]);
  var transitionStatus = issueTransitioner.getTransitionStatus("AB-1", "Testing");
  expect(jiraApiMock.call.mock.calls.length).toBe(2);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
  expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("AB-1");
  expect(jiraApiMock.call.mock.calls[1][0]).toBe("issueTransitions");
  expect(jiraApiMock.call.mock.calls[1][1].issueIdOrKey).toBe("AB-1");
  expect(transitionStatus.errors.length).toBe(1);
  expect(transitionStatus.errors[0]).toBe("Could not fetch issues transition states: Internal server error");
  expect(transitionStatus.transitionNeeded).toBe(true);
});


test("Fetching transition id scenarios", () => {
  const IssueTransitioner = require('../../src/jiraIssueStatusUpdates/issueTransitioner.gs');
  var issueTransitioner =  new IssueTransitioner();

  // first test issue is already in the required status
  jiraApiMock.setResponseSequence([
      {'respData': {"key":"PBI-1","fields":{"status":{"name":"Testing",}}},  success:true}
  ]);
  var transitionStatus = issueTransitioner.getTransitionStatus("PBI-1","TESTING");
  expect(transitionStatus.transitionNeeded).toBe(false);
  expect(transitionStatus.errors.length).toBe(0);
  expect(jiraApiMock.call.mock.calls.length).toBe(1);

  // needs to move status but no transition is possible
  jiraApiMock.resetMocks();
  jiraApiMock.setResponseSequence([
      {'respData': {"key":"PBI-1","fields":{"status":{"name":"Testing",}}},  success:true},
      {'respData': {"transitions":testTransitionResponses.threeStatuses},  success:true}
  ]);
  var transitionStatus = issueTransitioner.getTransitionStatus("PBI-1","No Valid Status");
  expect(transitionStatus.transitionNeeded).toBe(true);
  expect(transitionStatus.transitionId).toBeNull();
  expect(transitionStatus.errors.length).toBe(0);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
  expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-1");
  expect(jiraApiMock.call.mock.calls[1][0]).toBe("issueTransitions");
  expect(jiraApiMock.call.mock.calls[1][1].issueIdOrKey).toBe("PBI-1");
  expect(jiraApiMock.call.mock.calls.length).toBe(2);

  // needs to move status but no transition is possible - uses cached config
  jiraApiMock.resetMocks();
  jiraApiMock.setResponseSequence([
      {'respData': {"key":"PBI-3","fields":{"status":{"name":"Testing",}}},  success:true}
  ]);
  var transitionStatus = issueTransitioner.getTransitionStatus("PBI-3","No Valid Status");
  expect(transitionStatus.transitionNeeded).toBe(true);
  expect(transitionStatus.transitionId).toBeNull();
  expect(transitionStatus.errors.length).toBe(0);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
  expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-3");


  // needs to move status, config is cached
  jiraApiMock.resetMocks();
  jiraApiMock.setResponseSequence([
      {'respData': {"key":"PBI-4","fields":{"status":{"name":"Testing",}}},  success:true},
      {'respData': {},  success:true, statusCode:204}

  ]);
  var transitionStatus = issueTransitioner.getTransitionStatus("PBI-4","dOnE");
  expect(transitionStatus.transitionNeeded).toBe(true);
  expect(transitionStatus.transitionId).toBe("31");
  expect(transitionStatus.errors.length).toBe(0);
  expect(jiraApiMock.call.mock.calls.length).toBe(1);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
  expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-4");
});

test("Dealing with transitioning issues from one project", () => {
    const IssueTransitioner = require('../../src/jiraIssueStatusUpdates/issueTransitioner.gs');
    var issueTransitioner =  new IssueTransitioner();

    // first test issue is already in the required status
    issueTransitioner.getTransitionStatus = jest.fn().mockImplementation( () =>{
      return { transitionNeeded: false, errors: [], transitionId: null, srcStatus: "Testing" };
    }); 

    var transitionResponse = issueTransitioner.transition("PBI-1","TESTING");
    expect(transitionResponse.success).toBe(true);
    expect(transitionResponse.errors.length).toBe(0);
    expect(jiraApiMock.call.mock.calls.length).toBe(0);

    // needs to move status but no transition is possible
    jiraApiMock.resetMocks();
    issueTransitioner.getTransitionStatus = jest.fn().mockImplementation( () =>{
      return { transitionNeeded: true, errors: [], transitionId: null, srcStatus: "Testing" };
    }); 
    var transitionResponse = issueTransitioner.transition("PBI-1","No Valid Status");
    expect(issueTransitioner.getTransitionStatus).toBeCalled();
    expect(issueTransitioner.getTransitionStatus.mock.calls[0][1]).toBe("No Valid Status");

    expect(transitionResponse.success).toBe(false);
    expect(transitionResponse.errors.length).toBe(1);
    expect(jiraApiMock.call.mock.calls.length).toBe(0);



    // needs to move status
    jiraApiMock.resetMocks();
    jiraApiMock.setResponseSequence([
        {'respData': {},  success:true, statusCode:204}

    ]);
    issueTransitioner.getTransitionStatus = jest.fn().mockImplementation( () =>{
      return { transitionNeeded: true, errors: [], transitionId: "31", srcStatus: "Testing" };
    }); 
    var transitionResponse = issueTransitioner.transition("PBI-4","dOnE");
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueTransitionUpdate");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-4");
    expect(jiraApiMock.call.mock.calls[0][1].transition.id).toBe("31");
    expect(transitionResponse.success).toBe(true);
    expect(transitionResponse.updated).toBe(true);
    expect(transitionResponse.errors.length).toBe(0);
});


test("Dealing with errors when transitioning an issue", () => {
  const IssueTransitioner = require('../../src/jiraIssueStatusUpdates/issueTransitioner.gs');
  var issueTransitioner = new IssueTransitioner();
  issueTransitioner.getTransitionStatus = jest.fn().mockImplementation( () =>{
    return { transitionNeeded: true, errors: [], transitionId: "31", srcStatus: "Testing" };
  })

  // error updating the transition id
  jiraApiMock.resetMocks();
  jiraApiMock.setResponseSequence([
     {'respData': {"errorMessages":["Internal server error"],"errors":{}},  success:false, statusCode:500}
  ]);
  var transitionResponse = issueTransitioner.transition("BC-1","Done");
  expect(issueTransitioner.getTransitionStatus).toBeCalled();
  expect(issueTransitioner.getTransitionStatus.mock.calls[0][0]).toBe("BC-1");
  expect(issueTransitioner.getTransitionStatus.mock.calls[0][1]).toBe("Done");
  expect(transitionResponse.success).toBe(false);
  expect(transitionResponse.updated).toBe(false);
  expect(transitionResponse.errors.length).toBe(1);
  expect(jiraApiMock.call.mock.calls.length).toBe(1);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueTransitionUpdate");
  expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("BC-1");
  expect(jiraApiMock.call.mock.calls[0][1].transition.id).toBe("31");
});

