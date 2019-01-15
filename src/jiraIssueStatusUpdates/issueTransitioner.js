// Require imports
const Request = require('../jiraApi.gs');
const getIssue = require('../jiraCommon.gs').getIssue;
const IssueTransitionConfiguration = require('./issueTransitionConfiguration.js');
// End of Require imports

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
    response.errorMessage = "Could not fetch issues transition states: "+msgs.join("\n");
  };

  var request = new Request();
  request.call('issueTransitions', { issueIdOrKey: issueKey })
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return response;
}

function makeTransition(issueKey, transitionId) {

  var request = new Request();
  request.call('issueTransitionUpdate', {issueIdOrKey: issueKey,"transition": {"id": transitionId}});
  var resp = request.getResponse();
  returnData = {success:false, errorMessage:null};
  returnData.success = (resp.statusCode == 204);
  if (!returnData.success) {
    var msgs = resp.hasOwnProperty('errorMessages') ? resp.errorMessages : [];
      msgs = msgs.concat((resp.hasOwnProperty('warningMessages') ? resp.warningMessages : []));
      returnData.errorMessage = "Could not fetch issues transition states: "+msgs.join("\n");
  }
  return returnData;

}

function IssueTransitioner() {
    var config = new IssueTransitionConfiguration();
    this.transition = function(issueKey,newStatus) {
        newStatus = newStatus.toLowerCase();
        var result = getIssue(issueKey);
        var returnData = {success:false, updated:false,errors: []}
        if (result.status != 200) {
            returnData.errors.push(result.errorMessage);
            return returnData;
        }
        var srcStatus = result.data.fields.status.name;
        srcStatus = srcStatus.toLowerCase();
        if (srcStatus == newStatus) {
            returnData.success = true;
            return returnData;
        }
        if (!config.hasTransitionIds(issueKey,srcStatus)) {
            var transitionsResponse = getPossibleTransitions(issueKey);
            if (transitionsResponse.status != 200) {
              returnData.errors.push(transitionsResponse.errorMessage);
              return returnData;
            }
            config.setTransitions(issueKey,srcStatus,transitionsResponse.data.transitions);
        }
        var transitionId = config.getTransitionId(issueKey,srcStatus,newStatus);
        if (transitionId == null) {
          returnData.errors.push("Issue cannot be transition from "+srcStatus+" to "+newStatus+", please check your JIRA project configuration");
          return returnData;
        }
        transitionResult = makeTransition(issueKey,transitionId);
        returnData.success = transitionResult.success;
        if (transitionResult.errorMessage != null & transitionResult.errorMessage != "") {
          console
          returnData.errors = [transitionResult.errorMessage];
        }
        returnData.updated =  returnData.success;
        return returnData;
    }
}

module.exports = IssueTransitioner;