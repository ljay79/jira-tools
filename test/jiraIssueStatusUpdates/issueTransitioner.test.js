var testData = require('./mockIssueTransitionData.js');
var jiraApiMock = require('../mocks/mockJiraApi.js');
const debug = require("../../src/debug.gs");

var testTransitionResponses = require('./mockIssueTransitionData.js');

beforeEach(() =>  {
    jiraApiMock.resetMocks();
});

test("Dealing with transitioning issues error cases", () => {
    const IssueTransitioner = require('../../src/jiraIssueStatusUpdates/issueTransitioner.js');
    var issueTransitioner = new IssueTransitioner();
    jiraApiMock.setAllResponsesFail(500,{errorMessages:["Mocked Error"]});
    var transitionResponse = issueTransitioner.transition("PBI-1","Testing");
    expect(transitionResponse.success).toBe(false);
    expect(transitionResponse.errors.length).toBe(1);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);

    // error with response from request to transitions
    jiraApiMock.resetMocks();
    jiraApiMock.setResponseSequence([
        {'respData': {"key":"AB-1","fields":{"status":{"name":"TO DO",}}},  success:true},
        {'respData': {"errorMessages":["Internal server error"],"errors":{}},  success:false, statusCode:500}
    ]);
    var transitionResponse = issueTransitioner.transition("AB-1","Testing");
    expect(jiraApiMock.call.mock.calls.length).toBe(2);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("AB-1");
    expect(jiraApiMock.call.mock.calls[1][0]).toBe("issueTransitions");
    expect(jiraApiMock.call.mock.calls[1][1].issueIdOrKey).toBe("AB-1");
    expect(transitionResponse.errors.length).toBe(1);
    expect(transitionResponse.errors[0]).toBe("Could not fetch issues transition states: Internal server error");
    expect(transitionResponse.success).toBe(false);

    // error updating the transition id

    jiraApiMock.resetMocks();
    jiraApiMock.setResponseSequence([
        {'respData': {"key":"AB-1","fields":{"status":{"name":"Testing",}}},  success:true},
        {'respData': {"transitions":testTransitionResponses.threeStatuses},  success:true},
        {'respData': {"errorMessages":["Internal server error"],"errors":{}},  success:false, statusCode:500}
   
    ]);
    var transitionResponse = issueTransitioner.transition("BC-1","Done");
    expect(jiraApiMock.call.mock.calls.length).toBe(3);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("BC-1");
    expect(jiraApiMock.call.mock.calls[1][0]).toBe("issueTransitions");
    expect(jiraApiMock.call.mock.calls[1][1].issueIdOrKey).toBe("BC-1");
    expect(jiraApiMock.call.mock.calls[2][0]).toBe("issueTransitionUpdate");
    expect(jiraApiMock.call.mock.calls[2][1].issueIdOrKey).toBe("BC-1");
    expect(jiraApiMock.call.mock.calls[2][1].transition.id).toBe("31");
    expect(transitionResponse.success).toBe(false);
    expect(transitionResponse.updated).toBe(false);
    expect(transitionResponse.errors.length).toBe(1);
});

test("Dealing with transitioning issues from one project", () => {
    const IssueTransitioner = require('../../src/jiraIssueStatusUpdates/issueTransitioner.js');
    var issueTransitioner =  new IssueTransitioner();

    // first test issue is already in the required status
    jiraApiMock.setResponseSequence([
        {'respData': {"key":"PBI-1","fields":{"status":{"name":"Testing",}}},  success:true}
    ]);
    var transitionResponse = issueTransitioner.transition("PBI-1","TESTING");
    expect(transitionResponse.success).toBe(true);
    expect(transitionResponse.errors.length).toBe(0);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);

    // needs to move status but no transition is possible
    jiraApiMock.resetMocks();
    jiraApiMock.setResponseSequence([
        {'respData': {"key":"PBI-1","fields":{"status":{"name":"Testing",}}},  success:true},
        {'respData': {"transitions":testTransitionResponses.threeStatuses},  success:true}
    ]);
    var transitionResponse = issueTransitioner.transition("PBI-1","No Valid Status");
    expect(transitionResponse.success).toBe(false);
    expect(transitionResponse.errors.length).toBe(1);
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
    var transitionResponse = issueTransitioner.transition("PBI-3","No Valid Status");
    expect(transitionResponse.success).toBe(false);
    expect(transitionResponse.errors.length).toBe(1);
    expect(jiraApiMock.call.mock.calls.length).toBe(1);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-3");


    // needs to move status, config is cached
    jiraApiMock.resetMocks();
    jiraApiMock.setResponseSequence([
        {'respData': {"key":"PBI-4","fields":{"status":{"name":"Testing",}}},  success:true},
        {'respData': {},  success:true, statusCode:204}

    ]);
    var transitionResponse = issueTransitioner.transition("PBI-4","dOnE");
    expect(jiraApiMock.call.mock.calls.length).toBe(2);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("PBI-4");
    expect(jiraApiMock.call.mock.calls[1][0]).toBe("issueTransitionUpdate");
    expect(jiraApiMock.call.mock.calls[1][1].issueIdOrKey).toBe("PBI-4");
    expect(jiraApiMock.call.mock.calls[1][1].transition.id).toBe("31");
    expect(transitionResponse.success).toBe(true);
    expect(transitionResponse.updated).toBe(true);
    expect(transitionResponse.errors.length).toBe(0);

// a full pass where the issue transition states required and then its updated
jiraApiMock.resetMocks();
    jiraApiMock.setResponseSequence([
        {'respData': {"key":"AB-1","fields":{"status":{"name":"Testing",}}},  success:true},
        {'respData': {"transitions":testTransitionResponses.threeStatuses},  success:true},
        {'respData': {},  success:true, statusCode:204}

    ]);
    var transitionResponse = issueTransitioner.transition("AB-1","DONE");
    expect(jiraApiMock.call.mock.calls.length).toBe(3);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("issueStatus");
    expect(jiraApiMock.call.mock.calls[0][1].issueIdOrKey).toBe("AB-1");
    expect(jiraApiMock.call.mock.calls[1][0]).toBe("issueTransitions");
    expect(jiraApiMock.call.mock.calls[1][1].issueIdOrKey).toBe("AB-1");
    expect(jiraApiMock.call.mock.calls[2][0]).toBe("issueTransitionUpdate");
    expect(jiraApiMock.call.mock.calls[2][1].issueIdOrKey).toBe("AB-1");
    expect(jiraApiMock.call.mock.calls[2][1].transition.id).toBe("31");
    expect(transitionResponse.success).toBe(true);
    expect(transitionResponse.updated).toBe(true);
    expect(transitionResponse.errors.length).toBe(0);
});

