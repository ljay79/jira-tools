/**
 * Fetch EPIC label from Jira instance for a given Jira Issue Key of type EPIC.
 *
 * @param {"JST-123"} TicketId    A well-formed Jira EPIC Ticket Id / Key.
 * @return {String}    Epic label
 * @customfunction
 */
function JST_EPICLABEL(TicketId) {
  var request   = new Request();
  var response  = {};
  var epicField = getVar('jst_epic');

  if(TicketId == '') {
    throw new Error("{TicketId} can not be empty.");
  }

  if(undefined == epicField || epicField.usable === false || epicField.label_key == null) {
    throw new Error("Please configure your Jira Epic field first. Go to 'Jira Sheet Tools' -> 'Configure Custom Fields'");
  }

  response = request.call('issueStatus', {
    issueIdOrKey: TicketId, 
    fields: [
      'summary',
      epicField.label_key
    ]
  }).getResponse();

  if(response.statusCode === 200 && response.respData && response.respData.fields) {
    var value = response.respData.fields[epicField.label_key];
    if ( value === undefined || value == '') value = TicketId;
    return value;
  } else {
    throw new Error("Jira Error: " + response.respData.errorMessages.join(",") || response.respData.errorMessages);
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

  if(response.statusCode === 200 && response.respData && response.respData.total) {
    debug.log("JST_getTotalForSearchResult [%s]: response: %s", response.statusCode, response);
    return parseInt(response.respData.total || 0);
  } else {
    throw new Error("[" + response.statusCode + "] - " + response.respData.errorMessages.join(",") || response.respData.errorMessages);
  }
}

/**
 * @desc Forces trigger to re-calculate all custom functions / formulars in the active sheet.
 *       No official function for this, but this trick does it.
 * @return Void
 */
function recalcCustomFunctions() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet(); 
  sheet.insertRowBefore(1).deleteRow(1);
}
