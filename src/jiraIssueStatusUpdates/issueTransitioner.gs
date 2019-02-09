// Node required code block
const Request = require('../jiraApi.gs');
const getIssue = require('../jiraCommon.gs').getIssue;
const IssueTransitionConfiguration = require('./IssueTransitionConfiguration.gs');
// End of Node required code block

/**
 * Gets the list of transitions valid for the specified issue in its current status
 * @param {string} issueKey the id of the issue
 */
function getPossibleTransitions(issueKey) {
  var response = {
    'data': [],
    'status': -1,
    'errorMessage': ''
  };

  var ok = function (resp, httpResp, status) {
    if (resp && resp.transitions) {
      response = {
        'data': resp,
        'status': status,
        'errorMessage': resp.hasOwnProperty('warningMessages') ? resp.warningMessages : 'No results found.'
      };
    } else {
      // Something funky is up with the JSON response.
      debug.error("Failed to retrieve transition issue data for ID [" + issueKey + "]! resp:%s; httpResp:%s; status:%s", resp, httpResp, status);
    }
  };

  var error = function (resp, httpResp, status) {
    debug.error('[%s] %s - %s', status, resp, httpResp);

    var msgs = resp.hasOwnProperty('errorMessages') ? resp.errorMessages : [];
    msgs = msgs.concat((resp.hasOwnProperty('warningMessages') ? resp.warningMessages : []));

    response.status = status;
    response.errorMessage = "Could not fetch issues transition states: " + msgs.join("\n");
  };

  var request = new Request();
  request.call('issueTransitions', { issueIdOrKey: issueKey })
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return response;
}


/**
 * Constuctor for transitioning an issue from one status to another
 * checks current status of an issue first
 * gets the transitions possible from moving from that status
 * applies (if possible) the new status to the issue
 */
function IssueTransitioner() {
  var config = new IssueTransitionConfiguration();
  /**
   * @param issueKey the key of the issue to transition
   * @param newStatus the status that it is desired to transition to.
   */
  this.transition = function (issueKey, newStatus) {
    var returnData = { success: false, updated: false, errors: [] }
    
    var transitionStatus = this.getTransitionStatus(issueKey,newStatus);
    if (!transitionStatus.transitionNeeded) {
      // the issue is already in this state we can return
      returnData.success = true;
      return returnData;
    }
    if (transitionStatus.errors.length>0) {
      // some error occured 
      returnData.errors = transitionStatus.errors;
      return returnData;
    }
    var transitionId = transitionStatus.transitionId;
    if (transitionId == null) {
      returnData.errors.push("Status cannot be changed from '" + transitionStatus.srcStatus + "' to '" + newStatus + "', please check your the spelling of the status in your spreadsheet and the JIRA project configuration if the spelling is correct");
      return returnData;
    }
    transitionResult = makeTransition(issueKey, transitionId);
    returnData.success = transitionResult.success;
    if (transitionResult.errorMessage != null & transitionResult.errorMessage != "") {
      returnData.errors = [transitionResult.errorMessage];
    }
    returnData.updated = returnData.success;
    return returnData;
  }

  /**
   * Function to get the correct trantionsition id for this issue
   * 
   * @param issueKey - the key of the issue in JIRA
   * @param newStatus - the text description of the new status
   * 
  */
  this.getTransitionStatus = function(issueKey,newStatus) {
    newStatus = newStatus.toLowerCase();
    var result = getIssue(issueKey);
    var transitionStatus = { transitionNeeded: true, errors: [], transitionID: null, srcStatus: null }
    if (result.status != 200) {
      transitionStatus.errors.push(result.errorMessage);
      return transitionStatus;
    }
    transitionStatus.srcStatus = result.data.fields.status.name.toLowerCase();
    if (transitionStatus.srcStatus == newStatus) {
      transitionStatus.transitionNeeded = false;
      return transitionStatus;
    }
    if (!config.hasTransitionIds(issueKey, transitionStatus.srcStatus)) {
      var transitionsResponse = getPossibleTransitions(issueKey);
      if (transitionsResponse.status != 200) {
        transitionStatus.errors.push(transitionsResponse.errorMessage);
        return transitionStatus;
      }
      config.setTransitions(issueKey, transitionStatus.srcStatus, transitionsResponse.data.transitions);
    }
    transitionStatus.transitionId = config.getTransitionId(issueKey, transitionStatus.srcStatus, newStatus);
    return transitionStatus;
  }


  /**
   * Private function
   * Makes a request to the JIRA API to apply the transition to an issue
   * @param {string} issueKey issue key 
   * @param {integer} transitionId the id of the transition to move it to the desired state
   */
  function makeTransition(issueKey, transitionId) {
    var request = new Request();
    request.call('issueTransitionUpdate', { issueIdOrKey: issueKey, "transition": { "id": transitionId } });
    var resp = request.getResponse();
    returnData = { success: false, errorMessage: null };
    returnData.success = (resp.statusCode == 204);
    if (!returnData.success) {
      var msgs = resp.hasOwnProperty('errorMessages') ? resp.errorMessages : [];
      msgs = msgs.concat((resp.hasOwnProperty('warningMessages') ? resp.warningMessages : []));
      returnData.errorMessage = "Could not fetch issues transition states: " + msgs.join("\n");
    }
    return returnData;

  }
}

// Node required code block
module.exports = IssueTransitioner;
// End of Node required code block