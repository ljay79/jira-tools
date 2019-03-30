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
  customFunctionAllowed();

  var request   = new Request();
  var response  = {};

  if(TicketId == '') {
    throw new Error("{TicketId} can not be empty.");
  }

  if(!EpicField.isUsable()) {
    debug.error("epicField seems not be configured: %s", EpicField.getJson());
    throw new Error("Please configure your Jira Epic field first. Go to 'Project Aid for Jira' -> 'Configure custom fields'");
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
    return value;
  } else {
    debug.error("In JST_EPICLABEL; Response %s", response);
    throw new Error(response.respData.errorMessages.join(",") || response.respData.errorMessages);
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
  customFunctionAllowed();

  if (undefined == JQL || JQL == '') {
    throw new Error("{JQL} can not be empty.");
  }

  var request   = new Request();
  var response  = {}, data = {
    jql        : JQL, 
    fields     : ['summary'], 
    maxResults : 1
  };

  response = request.call('search', data, {'method' : 'post'}).getResponse();
  if(response.statusCode === 200 && response.respData && response.respData.total >= 0) {
    debug.log("JST_getTotalForSearchResult [%s]: response: %s", response.statusCode, response);
    return parseInt(response.respData.total || 0);
  } else {
    var msg = response.respData.errorMessages ? (response.respData.errorMessages.join(",") || response.respData.errorMessages) : response;
    msg = JSON.stringify(msg);
    if (response.statusCode == 401) {
      msg = msg + ' for Jira user [' + getCfg_('jira_username') + ']';
    }
    throw new Error("[" + response.statusCode + "] - " + msg + " - JQL: " + JQL);
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
  customFunctionAllowed();

  // - checks - 
  if (undefined == JQL || JQL == '') {
    throw new Error("{JQL} can not be empty.");
  }

  if (undefined == Fields || Fields == '') {
    throw new Error("{Fields} can not be empty.");
  } else if(typeof Fields !== 'string') {
    throw new Error("{Fields} must be a string. A comma separated list of JIRA field names.");
  }

  Limit = parseInt(Limit) || 1;
  if (Limit > 100) {
    throw new Error("{Limit} must be between 1 and 100.");
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

    return results;

  } else {
    var msg = (response.respData && response.respData.errorMessages) ? response.respData.errorMessages.join("\n") : JSON.stringify(response);
    if (response.statusCode == 401) {
      msg = msg + ' for Jira user [' + getCfg_('jira_username') + ']';
    }
    throw new Error("[" + response.statusCode + "] - " + msg);
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
  customFunctionAllowed();

  Seconds = parseInt(Seconds) || 0;

  return formatTimeDiff(Seconds);
}

/**
 * @desc Check if custom function is enabled by user otherwise throws new Error.
 * @throws Error
 * @return Void
 */
function customFunctionAllowed() {
  var custom_fn_enabled = getCfg_('custom_fn_enabled');

  if(custom_fn_enabled === undefined || custom_fn_enabled == 0) {
    throw new Error("You need to enable custom functions. Open 'Add-ons > Project Aid for Jira > Settings' and toggle 'Custom Functions' to enabled.");
  }
}
