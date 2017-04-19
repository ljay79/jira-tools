/**
 * Available/Supported REST calls for JIRA rest api.
 * Reference: https://docs.atlassian.com/jira/REST/cloud/
 * @object
 */
var restMethods = {
  'dashboard': '/dashboard',
  'issueStatus': {method: '/issue/{issueIdOrKey}', queryparams:{fields: ['status']}},
  'myFilters': {method: '/filter/my', queryparams: {includeFavourites: true}}
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

  this.ok = function(responseData, httpResponse, statusCode) {
    response = 'Connection successfully established.';
    setCfg('available', true);
  };

  this.error = function(responseData, httpResponse, statusCode) {
    response = 'Could not connect to Jira Server!' + '['+statusCode+']';
    setCfg('available', false);
  };

  req.call('dashboard')
    .withSuccessHandler(this.ok)
    .withFailureHandler(this.error);

  return {status: (getCfg('available')=='true'), response: response};
};

/**
 * Class Request
 * Performs an request to Jira RESTfull API.
 */
function Request() {
  var statusCode, httpResponse, responseData,
      available = getCfg('available'),
      domain = getCfg('jira_domain'),
      username = getCfg('jira_username'),
      password = getCfg('jira_password'),
      jiraMethod = null,
      jiraQueryParams = {};

  this.init = function() {
    // prepare for initialization if necessary
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
   * @desc 
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
   * @param args {object}    Optioal object of additional fetchArgs (see UrlFetchApp.fetch())
   * @return {this}    Allows chaining
   */
  this.call = function(method, data, args) {
    if( !hasSettings(false) ) {
      // check if server settings are available
      responseData = null;
      httpResponse = null;
      statusCode = -1;
      
      // dont bother trying to connect - use .withFailureHandler() to act on this failure
      return this;
    }

    jiraMethod = (typeof restMethods[method] === 'object') ? restMethods[method].method : restMethods[method];
    jiraQueryParams = (typeof restMethods[method] === 'object') ? restMethods[method].queryparams : {};

    var urlParams = {};
    this.prepareParams(urlParams, jiraQueryParams);

    // RESTfull URL to request
    var fetchUrl = 'https://' + domain + '/rest/api/2' + jiraMethod;

    // data payload vs. url params handling
    var temp, 
        args = {}, 
        payload = {};

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

    args.payload = payload;
    // build full fetch URL    
    fetchUrl = buildUrl(fetchUrl, urlParams);

    responseData = null;
    httpResponse = UrlFetchApp.fetch(fetchUrl, this.getFetchArgs(args));
    statusCode = parseInt( httpResponse.getResponseCode() );

    if (httpResponse) {
      try {
        // we care about json response content only
        responseData = JSON.parse(httpResponse.getContentText());
      } catch(e) {
        if(httpErrorCodes[statusCode]) responseData = httpErrorCodes[statusCode];
        else responseData = 'Unable to make requests to Jira!';
      }
    } else {
      responseData = 'Unable to make requests to Jira!';
    }

    if( typeof responseData == 'string' ) {
      responseData = {errorMessages: [responseData]};
    }

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

  // call init
  this.init();
}
