
IssueSearch = require("src/models/jira/IssueSearch.gs");

test("Issue search 1",()=> {
  var s = new IssueSearch('');
  s.setOrderBy('updated', 'DESC')
   .setFields(['summary', 'issuetype', 'priority', 
		'status', 'updated', 'assignee', 
		'duedate', 'project', 'customfield_11102'])
    .setMaxResults(50)
    .setMaxPerPage(10);

    onSuccess = function(a,b,c) {
      debug.log('%s', '----------ON SUCCESS-----------');
      debug.log('%s %s %s', JSON.stringify(a), b, c);
      debug.log('%s', '---------------------1');
      
      debug.log('AMOUNT: %s !', a.length);
    };
    onFailure = function(a,b,c) {
      debug.log('%s', '----------ON FAILURE-----------');
      debug.log('a:%s b:%s c:%s', a, b, c);
      debug.log('%s', '---------------------1');
    };
    
    s.search()
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure)
    ;
  });

  test("Search scenario 2",() => {

  var s = new IssueSearch('worklogDate>="2017-07-02" and worklogDate<="2017-07-11" and worklogAuthor="jrosemeier"');
  s.setOrderBy('updated', 'DESC')
  .setFields(['id','key','issuetype','project','status','summary']);


  onSuccess = function(a,b,c) {
    debug.log('%s', '----------ON SUCCESS-----------');
    debug.log('%s %s %s', JSON.stringify(a), b, c);
    debug.log('%s', '---------------------1');
    
    debug.log('AMOUNT: %s !', a.length);
  };
  onFailure = function(a,b,c) {
    debug.log('%s', '----------ON FAILURE-----------');
    debug.log('a:%s b:%s c:%s', a, b, c);
    debug.log('%s', '---------------------1');
  };
  
  s.search()
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
  ;
})


