// Node required code block
const getCfg_ = require("./settings.gs").getCfg_;
const setCfg_ = require("./settings.gs").setCfg_;
// End of Node required code block

/**
 * @desc Forces trigger to re-calculate all custom functions / formulars in the active sheet.
 *       No official function for this, but this trick does it.
 * @return Void
 */
function recalcCustomFunctions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); 
  sheet.insertRowBefore(1).deleteRow(1);
}

/**
 * Fetch EPIC label from Jira instance for a given Jira Issue Key of type EPIC.
 *
 * @param {"JST-123"} TicketId    A well-formed Jira EPIC Ticket Id / Key.
 * @return {String}    Epic label
 * @customfunction
 */
function JST_EPICLABEL(TicketId) {
  customFunctionAllowed_();

  var request   = new Request();
  var response  = {};

  if(TicketId == '') {
    throw new CustomFunctionErrorException("{TicketId} can not be empty.");
  }

  if(!EpicField.isUsable()) {
    debug.error("epicField seems not be configured: %s", EpicField.getJson());
    throw new CustomFunctionErrorException("Please configure your Jira Epic field first. Go to 'Project Aid for Jira' -> 'Configure custom fields'");
  }

  response = request.call('issueStatus', {
    issueIdOrKey: TicketId, 
    fields: [
      'summary',
      EpicField.getLabelKey()
    ]
  }).getResponse();

  if(response.statusCode === 200 && response.respData && response.respData.fields) {
    var value = response.respData.fields[EpicField.getLabelKey()];
    if ( value === undefined || value == '') value = TicketId;
    StorageCounter.log();
    return value;
  } else {
    debug.error("In JST_EPICLABEL; Response %s", response);
    throw new CustomFunctionErrorException(response.respData.errorMessages.join(",") || response.respData.errorMessages);
  }
}

/**
 * Fetch the total count of results for given Jira JQL search query.
 *
 * @param {"status = Done"} JQL    A well-formed Jira JQL query (https://confluence.atlassian.com/jirasoftwarecloud/advanced-searching-764478330.html#Advancedsearching-ConstructingJQLqueries).
 * @return {Number}    Total number of results
 * @customfunction
 */
function JST_getTotalForSearchResult(JQL) {
  customFunctionAllowed_();

  if (undefined == JQL || JQL == '') {
    throw new Error("{JQL} can not be empty.");
  }

  var request   = new Request();
  var response  = {}, data = {
    jql: JQL
  };

  response = request.call('search', data, {'method' : 'post'}).getResponse();
  if(response.statusCode === 200 && response.respData && response.respData.count >= 0) {
    debug.log("JST_getTotalForSearchResult [%s]: response: %s", response.statusCode, response);
    StorageCounter.log();
    return parseInt(response.respData.count || 0);
  } else {
    var msg = response.respData.errorMessages ? (response.respData.errorMessages.join(",") || response.respData.errorMessages) : response;
    msg = JSON.stringify(msg);
    if (response.statusCode == 401) {
      msg = msg + ' for Jira user [' + getCfg_('jira_username') + ']';
    }
    throw new CustomFunctionErrorException("[" + response.statusCode + "] - " + msg + " - JQL: " + JQL);
  }
}

/**
 * (Mini) Search for Jira issues using JQL.
 *
 * @param {"status = Done"} JQL    A well-formed Jira JQL query (https://confluence.atlassian.com/jirasoftwarecloud/advanced-searching-764478330.html#Advancedsearching-ConstructingJQLqueries).
 * @param {"summary,status"} Fields    Jira issue field IDs. e.g.: "key,summary,status"
 * @param {10} Limit    Number of results to return. 1 to 100. Default: 1
 * @param {0} StartAt    The index of the first result to return (0-based)
 * @return {Array}    Array of results
 * @customfunction
 */
function JST_search(JQL, Fields, Limit, StartAt) {
  customFunctionAllowed_();

  //@TODO: requires upgrade to API v3
  throw new CustomFunctionErrorException("`JST_search` is currently not supported by this version of the add-on.");

  // - checks - 
  if (undefined == JQL || JQL == '') {
    throw new CustomFunctionErrorException("{JQL} can not be empty.");
  }

  if (undefined == Fields || Fields == '') {
    throw new CustomFunctionErrorException("{Fields} can not be empty.");
  } else if(typeof Fields !== 'string') {
    throw new CustomFunctionErrorException("{Fields} must be a string. A comma separated list of JIRA field names.");
  }

  Limit = parseInt(Limit) || 1;
  if (Limit > 100) {
    throw new CustomFunctionErrorException("{Limit} must be between 1 and 100.");
  }
  
  StartAt = parseInt(StartAt) || 0;

  debug.log("JST_search([%s]; [%s]; [%s])", JQL, Fields, Limit);

  // sanitize string and split to array
  var aFields = Fields.replace(/;/g, ",").replace(/(^,)|(,$)/g, "").replace(/\s+/g, '').split(',');
  aFields.filter(function(item) { 
    return item != ' ';
  });

  // - logic -
  var request   = new Request();
  var response  = {}, data = {
    jql        : JQL, 
    fields     : aFields, 
    maxResults : Limit,
    startAt    : StartAt
  };

  response = request.call('search', data, {'method' : 'post'}).getResponse();

  if(response.statusCode === 200 && response.respData && response.respData.total >= 0) {
    //debug.log("JST_search [%s], Total: %s: response: %s", response.statusCode, response.respData.total, response);
    debug.log("JST_search [%s], Total: %s", response.statusCode, response.respData.total);

    var issue = null, key = null, rowValues = [], results = [];
    for(var i=0; i<response.respData.issues.length; i++) {
      issue = response.respData.issues[i];
      rowValues = [];

      // loop over each requested field
      for(var j=0; j<aFields.length; j++) {
        key = unifyIssueAttrib(aFields[j], issue);
        // for some custom formatting
        switch(true) {
          case key.hasOwnProperty('date'):
            key.value = (key.value != null) ? key.date : '';
            break;
        }
        rowValues.push( key.value == null ? aFields[j] : key.value );
      }//END:j
      results.push( rowValues );
    }//END:i

    StorageCounter.log();
    
    return results;

  } else {
    var msg = (response.respData && response.respData.errorMessages) ? response.respData.errorMessages.join("\n") : JSON.stringify(response);
    if (response.statusCode == 401) {
      msg = msg + ' for Jira user [' + getCfg_('jira_username') + ']';
    }
    throw new CustomFunctionErrorException("[" + response.statusCode + "] - " + msg);
  }
}


/**
 * Format time difference in seconds into nice duration format.
 *
 * @param {"12345"} Seconds    Duration in seconds
 * @return {String}
 * @customfunction
 */
function JST_formatDuration(Seconds) {
  customFunctionAllowed_();

  Seconds = parseInt(Seconds) || 0;

  return formatTimeDiff(Seconds);
}

/**
 * @desc Check if custom function is enabled by user otherwise throws new Error.
 * @throws Error
 * @return Void
 */
function customFunctionAllowed_() {
  if (!customFunctionsEnabled_()) {
    throw new Error("The document owner (you) must enable custom functions. Open 'Add-ons > Project Aid for Jira > Settings' and toggle 'Custom Functions' to enabled. If you are not the document owner, ask him to enable custom functions.");
  }

  // no return value; throws Error if feature is suspended
  customFunctionsSuspended_();
}

/**
 * @desc Check wether custom functions are enabled or not.
 * @return {boolean}
 */
function customFunctionsEnabled_() {
  return (getCfg_('custom_fn_enabled') == 1);
}


/**
 * @desc Custom Error Exception handler. Does same as Error just implemented a error counter.
 */
function CustomFunctionErrorException(message) {
  this.message = message;
  this._countHandler();

  // Use V8's native method if available, otherwise fallback
  if ("captureStackTrace" in Error)
      Error.captureStackTrace(this, CustomFunctionErrorException);
  else
      this.stack = (new Error()).stack;
}

CustomFunctionErrorException.prototype = Object.create(Error.prototype);
CustomFunctionErrorException.prototype.name = "JST_Error";
CustomFunctionErrorException.prototype.constructor = CustomFunctionErrorException;
CustomFunctionErrorException.prototype._countHandler = function() {
  var docProps = CacheService.getDocumentCache();
  var key = 'CUSTOM_FUNCTIONS_ERROR_COUNT';
  var count = docProps.get(key) || 0;
  docProps.put(key, ++count, 60*60);
};


/**
 * @desc Check for CustomFunctions Error count and decide to suspend any further calls for a while or not.
 * @throws Error
 * @return void
 */
function customFunctionsSuspended_() {
  var docProps   = CacheService.getDocumentCache();
  var key_count = 'CUSTOM_FUNCTIONS_ERROR_COUNT';
  var key_time  = 'CUSTOM_FUNCTIONS_ERROR_TIME';
  var count     = docProps.get(key_count) || 0;
  var now       = new Date();
  var _timeUntil = docProps.get(key_time);
  var timeUntil = new Date();

  debug.info('customFunctionsSuspended_(): Counter is at: %s', count);

  if (_timeUntil != null) {
    // suspension time is set, convert to Date object
    timeUntil.setTime(_timeUntil);
  }

  var timeUntilSeconds = Math.round(timeUntil.getTime() / 1000);
  var nowSeconds       = Math.round(now.getTime() / 1000);

  if (timeUntilSeconds > (nowSeconds+3)) {
    var _delay_seconds = timeUntilSeconds - nowSeconds;
    var _msg = "Suspension of custom functions for about " + _delay_seconds + " seconds because of to many errors! Please correct all your custom function calls in this document and wait before re-trying.";
    debug.warn("customFunctionsSuspended_():" + _msg + " Now: %s < Until: %s", now.toString(), timeUntil.toString());
    throw new Error(_msg);
  }

  // else
  if (count >= 100) {
    // set suspension +300s
    debug.info('customFunctionsSuspended_(): ... setting 300s suspension!');
    docProps.put(key_time, now.getTime() + (300*1000));

    // reset error counter
    docProps.put(key_count, 0);

  } else if (count >= 25 && count < 30) {
    // set suspension +300s
    debug.info('customFunctionsSuspended_(): ... setting 60s suspension!');
    docProps.put(key_time, now.getTime() + (60*1000));

  } else if (count >= 10 && count < 15) {
    // set suspension +30s
    debug.info('customFunctionsSuspended_(): ... setting 30s suspension!');
    docProps.put(key_time, now.getTime() + (30*1000));
  }
  
  StorageCounter.log();
}


// Node required code block
module.exports = {
  customFunctionAllowed_: customFunctionAllowed_
};
// End of Node required code block
