/**
 * Available/Supported REST calls for JIRA rest api.
 * Reference: https://docs.atlassian.com/jira/REST/cloud/
 * @object
 */
var restMethods = {
  'onDemand': {
    'dashboard'     : '/dashboard',
    'issueStatus'   : {method: '/issue/{issueIdOrKey}', queryparams:{fields: ['status']}},
    'worklogOfIssue': {method: '/issue/{issueIdOrKey}/worklog'},
    'filter'        : {method: '/filter/{filterId}'},
    //'search': {method: '/search', queryparams: {jql:'', fields: [], properties: [], maxResults: 100, validateQuery: 'strict'}} // GET
    'search'        : {method: '/search'}, // POST
    'myFilters'     : {method: '/filter/my', queryparams: {includeFavourites: 'false'}},

    'userSearch'    : {method: '/user/search', queryparams: {startAt:0, maxResults: 100, username:'%'}},
    'groupSearch'   : {method: '/groups/picker', queryparams: {maxResults: 100, query: ''}},
    'field'         : {method: '/field'}
  },
  'server': {
    'dashboard'     : '/dashboard',
    'issueStatus'   : {method: '/issue/{issueIdOrKey}', queryparams:{fields: ['status']}},
    'worklogOfIssue': {method: '/issue/{issueIdOrKey}/worklog'},
    'filter'        : {method: '/filter/{filterId}'},
    'search'        : {method: '/search'}, // POST
    // server api doesnt support /filter/my
    'myFilters'     : {method: '/filter/favourite', queryparams: {includeFavourites: 'false'}},

    'userSearch'    : {method: '/user/search', queryparams: {startAt:0, maxResults: 100, username:'%'}},
    'groupSearch'   : {method: '/groups/picker', queryparams: {maxResults: 100, query: ''}},
    'field'         : {method: '/field'}
  }
};

var httpErrorCodes = {
  400:	'Bad Request',
  401:	'Unauthorized',
  403:	'Forbidden',
  404:	'Not Found',
  405:	'Method Not Allowed',
  407:	'Proxy Authentication Required',
  408:	'Request Time-out',
  410:	'Gone',
  413:	'Request Entity Too Large',
  414:	'Request-URL Too Long',
  429:	'Too Many Requests',
  500:	'Internal Server Error',
  502:	'Bad Gateway',
  503:	'Service Unavailable',
  504:	'Gateway Time-out',
  509:	'Bandwidth Limit Exceeded',
  510:	'Not Extended'
};

/**
 * Test JIRA API connection with provided settings.
 * @return {object}  Object({status:[boolean], response:[string]})
 */
function testConnection() {
  var req = new Request, response;

  var ok = function(responseData, httpResponse, statusCode) {
    response = 'Connection successfully established.';
    debug.log('%s to server [%s] %s', response, getCfg('server_type'), getCfg('jira_url'));
    setCfg('available', true);
  };

  var error = function(responseData, httpResponse, statusCode) {
    response = 'Could not connect to Jira Server!' + '['+statusCode+']';
    debug.warn('%s Server [%s] %s', response, getCfg('server_type'), getCfg('jira_url'));
    setCfg('available', false);
  };

  req.call('dashboard')
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return {status: (getCfg('available')=='true'), response: response};
};

/**
 * Class Request
 * Performs an request to Jira RESTfull API.
 */
function Request() {
  var statusCode, httpResponse, responseData,
      available, url, username, password,
      jiraMethod = null,
      jiraQueryParams = {};

  this.init = function() {
    server_type = getCfg('server_type') || 'onDemand';
    available = getCfg('available');
    url = getCfg('jira_url');
    username = getCfg('jira_username');
    password = getCfg('jira_password');
    jiraMethod = null;
  };

  /**
   * @desc Prepares fetchArgs object of arguments to pass to request of UrlFetchApp.fetch()
   * @param args {object} Ooptional object of additional arguments per request
   * @return {object}
   */
  this.getFetchArgs = function(args) {
    var fetchArgs = {
      contentType: "application/json",
      headers: {"Authorization": "Basic "},
      muteHttpExceptions : true
    };
    var encCred = Utilities.base64Encode(username + ":" + password);

    fetchArgs.headers = {
      "Authorization": "Basic " + encCred
    };

    extend(fetchArgs, args);

    return fetchArgs;
  };

  /**
   * @desc Migrates jiraQueryParams properties into urlParams
   */
  this.prepareParams = function(urlParams, jiraQueryParams) {
    for (var attr in jiraQueryParams) {
      if (jiraQueryParams.hasOwnProperty(attr)) {
        switch(true) {
          case (Object.prototype.toString.call(jiraQueryParams[attr]) === '[object Array]'):
            urlParams[attr] = jiraQueryParams[attr].join(',');
            break;
          case (typeof jiraQueryParams[attr] == 'object'):
            this.prepareParams(urlParams, jiraQueryParams[attr]);
            break;
          case (typeof jiraQueryParams[attr] == 'string'):
            urlParams[attr] = jiraQueryParams[attr];
            break;
        }
      }
    }
  };

  /**
   * @desc Call method, perform API request
   * @param method {string}    Name of method to call on api, see restMethods[] 
   *     for implemented api methods
   * @param data {mixed}    (prepared for later payload)
   * @param fetchArgs {object}    Optional object of additional fetchArgs (see UrlFetchApp.fetch())
   * @return {this}    Allows chaining
   */
  this.call = function(method, data, fetchArgs) {
    if( !hasSettings(false) ) {
      // check if server settings are available
      responseData = {errorMessages: ['Internal Error! No Jira Settings.']};
      httpResponse = null;
      statusCode = -1;

      // dont bother trying to connect - use .withFailureHandler() to act on this failure
      return this;
    }
    
    var timingLabel = 'JiraApi call('+method+')';
    debug.time(timingLabel);

    jiraMethod = (typeof restMethods[server_type][method] === 'object') ? restMethods[server_type][method].method : restMethods[server_type][method];
    jiraQueryParams = (typeof restMethods[server_type][method] === 'object') ? restMethods[server_type][method].queryparams : {};

    var fetchArgs = fetchArgs || {}, urlParams = {};
    this.prepareParams(urlParams, jiraQueryParams);

    // RESTfull URL to request
    var fetchUrl = url + '/rest/api/2' + jiraMethod;

    // data payload vs. url params handling
    var temp, 
        payload = {};

    // fill URL placeholders with attributes from data object if passed and available
    for (var attr in data) {
      if (data.hasOwnProperty(attr)) {
        temp = fetchUrl.replace('{' + attr + '}', data[attr]);
        if(temp != fetchUrl) {
          fetchUrl = temp;
        } else {
          // wasnt an attribute for the URL, so we add it to the requests payload
          payload[attr] = data[attr];
        }
      }
    }

    // fill URL queryparams with attributes from data/payload object if passed and available
    for (var attr in payload) {
      if(urlParams.hasOwnProperty(attr)) {
        urlParams[attr] = payload[attr];
        //payload.splice(attr, 1);
        delete payload[attr];
      }
    }

    fetchArgs.payload = JSON.stringify(payload);
    // do not add empty payload
    if(fetchArgs.payload == '{}') { delete fetchArgs['payload']; }

    // build full fetch URL    
    fetchUrl = buildUrl(fetchUrl, urlParams);
    debug.log('fetchUrl: %s', fetchUrl);
    debug.log('fetchArgs: %s', fetchArgs);

    responseData = null;
    try {
      httpResponse = UrlFetchApp.fetch(fetchUrl, this.getFetchArgs(fetchArgs));
      statusCode = parseInt( httpResponse.getResponseCode() );
    } catch (e) {
      debug.error('UrlFetchApp.fetch(%s) yielded an error: ' + e, fetchUrl);
      statusCode = 500;
    }

    if (httpResponse) {
      try {
        // we care about json response content only
        responseData = JSON.parse(httpResponse.getContentText());
      } catch(e) {
        if(httpErrorCodes[statusCode]) responseData = httpErrorCodes[statusCode];
        else responseData = 'Unable to make requests to Jira (02)!';
      }
    } else {
      responseData = 'Unable to make requests to Jira (01)!';
    }

    if( typeof responseData == 'string' ) {
      responseData = {errorMessages: [responseData]};
      statusCode = 500;
    }

    debug.timeEnd(timingLabel);

    return this;
  };

  /**
   * @desc API request Success handler
   * @param fn {function}  Method to call on successfull api request
   * @return {this}  Allow chaining
   */
  this.withSuccessHandler = function(fn) {
    if(statusCode === 200) {
      fn.call(this, responseData, httpResponse, statusCode);
    }
    return this;
  };

  /**
   * @desc API request Failure handler
   * @param fn {function}  Method to call on failed api request
   * @return {this}  Allow chaining
   */
  this.withFailureHandler = function(fn) {
    if(statusCode !== 200) {
      fn.call(this, responseData, httpResponse, statusCode);
    }
    return this;
  };

  /**
   * @desc Return raw response object from previous call.
   * @return {Object}    Response object: {respData: {..}, httpResp: {}, statusCode: Integer}
   */
  this.getResponse = function() {
    return {'respData': responseData, 'httpResp': httpResponse, 'statusCode': statusCode};
  };

  // call init
  this.init();
}
