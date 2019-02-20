
global.PropertiesService = require('test/mocks/PropertiesService');
jiraApiMock = require('test/mocks/mockJiraApi.js');
IssueSearch = require("src/models/jira/IssueSearch.gs");
var debug = require("src/debug.gs").debug;

beforeEach(() => {
  jiraApiMock.resetMocks();
})
test("Issue search 1",()=> {
  var s = new IssueSearch('');
  s.setOrderBy('updated', 'DESC')
   .setFields(['summary', 'issuetype', 'priority', 
		'status', 'updated', 'assignee', 
		'duedate', 'project', 'customfield_11102'])
    .setMaxResults(50)
    .setMaxPerPage(10);

    onSuccess = jest.fn();
    onFailure = jest.fn();
    
    s.search()
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
    ;
    expect(jiraApiMock.call).toBeCalledTimes(1);
    expect(jiraApiMock.call.mock.calls[0][0]).toBe("search");
    var bodyOfCall = jiraApiMock.call.mock.calls[0][1];
    expect(bodyOfCall.jql).toBe(" ORDER BY updated DESC");
    expect(bodyOfCall.startAt).toBe(0);
    expect(bodyOfCall.maxResults).toBe(10);
    expect(bodyOfCall.fields.length).toBe(9);
    expect(jiraApiMock.call.mock.calls[0][2].method).toBe("post");tes
  });

  test("Search scenario 2",() => {
    var jql = 'worklogDate>="2017-07-02" and worklogDate<="2017-07-11" and worklogAuthor="jrosemeier"';
  var s = new IssueSearch(jql);
  s.setOrderBy('updated', 'DESC')
  .setFields(['id','key','issuetype','project','status','summary']);


  onSuccess = jest.fn();
  onFailure = jest.fn();
  
  s.search()
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure);

  expect(jiraApiMock.call).toBeCalledTimes(1);
  expect(jiraApiMock.call.mock.calls[0][0]).toBe("search");
  var bodyOfCall = jiraApiMock.call.mock.calls[0][1];
  expect(bodyOfCall.jql).toBe(jql+" ORDER BY updated DESC");
  expect(bodyOfCall.startAt).toBe(0);
  expect(bodyOfCall.maxResults).toBe(50);
  expect(bodyOfCall.fields.length).toBe(6);
  expect(jiraApiMock.call.mock.calls[0][2].method).toBe("post");
  ;
})


