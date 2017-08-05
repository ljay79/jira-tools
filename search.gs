/*
 * Notes
 * check out Firebase as a JSON database; https://sites.google.com/site/scriptsexamples/new-connectors-to-google-services/firebase
 */

/*function testSearch() {
  var s = new SearchWorklog();

  onSuccess = function(a,b,c) {
    log('%s', '----------ON SUCCESS-----------');
    log('%s %s %s', a, b, c);
  };
  onFailure = function(a,b,c) {
    log('%s', '----------ON FAILURE-----------');
    log('%s %s %s', a, b, c);
  };
  
  s.filterDate('2017-08-01', '2017-07-01');
  s.filterByUser('jrosemeier');
  s.search()
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
  ;
}*/


/**
 * @desc Class SearchWorklog provides a simple interface for performing a search against Jira for worklogs.
 */
function SearchWorklog() {
  var fields = ['worklog'],
      startAt = 0, maxResults = 1000;
  var jql_worklogAuthor = '', 
      jql_worklogDateFrom, jql_worklogDateTo;
  var response = {
    'responseData': {},
    'statusCode': -1,
    'errorMessage': ''
  };

  /**
   * @desc Initialize anything necessary for the class object
   * @return void
   */
  this.init = function() {
    var _now = new Date();
    // from = now() - 7 days
    jql_worklogDateFrom = new Date();
    jql_worklogDateFrom.setDate(_now.getDate() - 7);
    jql_worklogDateFrom = jql_worklogDateFrom.toISOString().substring(0, 10);

    // to = now()
    jql_worklogDateTo = _now.toISOString().substring(0, 10);
  }
  
  /**
   * @desc Set the list of jira issue fields to be returned in search response for each issue.
   * @param aFields {Array}    Array of jira issue fields
   * @return {this}    Allow chaining
   */
  this.setFields = function(aFields) {
    if(aFields.constructor == Array) {
      fields = aFields;
    } else {
      throw '{aFields} is not an Array.';
    }

    return this;
  }

  /**
   * @desc Set result offset start for pagination of search results.
   * @param iStartAt {Number}    Number, default:0
   * @return {this}    Allow chaining
   */
  this.setStartAt = function(iStartAt) {
    if(iStartAt.constructor == Number) {
      startAt = iStartAt;
    } else {
      throw '{iStartAt} is not a Number.';
    }

    return this;
  }

  /**
   * @desc Set result offset limit for pagination of search results.
   * @param iMaxResults {Number}    Number, default:1000
   * @return {this}    Allow chaining
   */
  this.setMaxResults = function(iMaxResults) {
    if(iMaxResults.constructor == Number) {
      maxResults = iMaxResults;
    } else {
      throw '{iMaxResults} is not a Number.';
    }

    return this;
  }

  /**
   * @desc Set date filter for the search JQL. Date from and to
   * @param sDateFrom {String}    The filter start date in any format Date class constructor accepts ("YYYY-MM-DD")
   * @param sDateTo {String}    The filter end/to date in any format Date class constructor accepts ("YYYY-MM-DD")
   * @return {this}    Allow chaining
   */
  this.filterDate = function(sDateFrom, sDateTo) {
    if( sDateFrom ) {
      jql_worklogDateFrom = (new Date(sDateFrom)).toISOString().substring(0, 10);
    }
    if( sDateTo ) {
      jql_worklogDateTo = (new Date(sDateTo)).toISOString().substring(0, 10);
    }
    
    var _d = jql_worklogDateFrom;
    if( Date.parse(_d) > Date.parse(jql_worklogDateTo) ) {
      jql_worklogDateFrom = jql_worklogDateTo;
      jql_worklogDateTo   = _d;
    }
    
    return this;
  }

  /**
   * @desc Set JQL filter for searching worklogs from a single username
   * @param sUsername {String}    The Jira username we search worklogs for
   * @param {this}    Allow chaining
   */
  this.filterByUser = function(sUsername) {
    jql_worklogAuthor = ' worklogAuthor = "' + sUsername + '" ';
    
    return this;
  }

  /**
   * @desc Set JQL filter for searching worklogs from a jira group
   * @param sGroupname {String}    The Jira group name we search worklogs for
   * @param {this}    Allow chaining
   */
  this.filterByGroup = function(sGroupname) {
    jql_worklogAuthor = ' worklogAuthor in membersOf("' + sGroupname + '") ';
    
    return this;
  }
  
  /**
   * @desc Callback Success handler
   * @param fn {function}  Method to call on successfull request
   * @return {this}  Allow chaining
   */
  this.withSuccessHandler = function(fn) {
    if(response.statusCode === 200) {
      log('withSuccessHandler: [%s] calling: %s', response.statusCode, fn);
      fn.call(this, response.responseData, response.statusCode, response.errorMessage);
    }
    return this;
  };

  /**
   * @desc Callback Failure handler
   * @param fn {function}  Method to call on failed request
   * @return {this}  Allow chaining
   */
  this.withFailureHandler = function(fn) {
    if(response.statusCode !== 200) {
      log('withFailureHandler: [%s] calling: %s', response.statusCode, fn);
      fn.call(this, response.responseData, response.statusCode, response.errorMessage);
    }
    return this;
  };

 
  /**
   * @desc Prepare JQL search query
   * @return {String}
   */
  var getJql = function() {
    var jql = '';

    jql += 'worklogDate>="' + jql_worklogDateFrom + '" ';
    jql += ' and worklogDate<="' + jql_worklogDateTo + '" ';
    if( jql_worklogAuthor != '' ) jql += ' and ' + jql_worklogAuthor;

    log('Search JQL: [%s]', jql);

    //return encodeURIComponent(jql); //only when api call is performed as GET
    return jql;
  }
  
  /**
   * @desc OnSuccess handler for search request
   */
  var onSuccess = function(responseData, httpResponse, statusCode) {
    log('onSuccess: [%s]', statusCode);

    // nothing found
    if( responseData.total == 0 ) {
      response.errorMessage = responseData.hasOwnProperty('warningMessages') ? responseData.warningMessages : 'No results found.';
    }

    response.statusCode = statusCode;
    response.responseData = responseData;
  }

  /**
   * @desc OnFailure handler for search request
   */
  var onFailure = function(responseData, httpResponse, statusCode) {
    log('onFailure: [%s] %s', statusCode, responseData);

    var msgs = responseData.hasOwnProperty('errorMessages') ? responseData.errorMessages : [];
    msgs = msgs.concat((responseData.hasOwnProperty('warningMessages') ? responseData.warningMessages : []));

    response.statusCode = statusCode;
    response.errorMessage = msgs.join("\n");
  }

  this.search = function() {
    var data = {
      jql: getJql(), 
      fields: fields, 
      startAt: startAt,
      maxResults: maxResults
    };

    var request = new Request();
    request.call('search', data, {'method' : 'post'})
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure);

    return this;
  }
  
  this.init();
}
