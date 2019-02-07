
/**
 * A class used to store the configuration of Jira Issue transition for multiple project and issues status
 */
function IssueTransitionConfiguration() {

  // stores the congifurqation
  var config = {
  }

  // private function for converting a JIRA issue key to the prefix used in all issues for that project
  function convertIssueKeyToProjectPrefix(issueKey) {
    return issueKey.substring(0, issueKey.indexOf("-"));
  }

  /**
   * Does the configuration have details for the Issues project to transition from the sourceState to another
   * @param {string} issueKey the id of the issue - this will be truncated to get the project id
   */
  this.hasTransitionIds = function (issueKey, sourceState) {
    sourceState = sourceState.toLowerCase();
    var projectKey = convertIssueKeyToProjectPrefix(issueKey);
    if (config[projectKey] != null) {
      if (config[projectKey][sourceState] != null) {
        return true;
      }
    }
    return false;
  }

  /**
   * Store configuration for the Issues' project to transition from the sourceState to the data in transitionData
   * @param {string} issueKey the id of the issue - this will be truncated to get the project id
   * @param {string} sourceState the state for which the transitions are valid to move from
   * @param {string} transitionData the list of transition options from the JIRA REST Api
   */
  this.setTransitions = function (issueKey, sourceState, transitionData) {
    sourceState = sourceState.toLowerCase();
    var projectKey = convertIssueKeyToProjectPrefix(issueKey);
    if (config[projectKey] == null) {
      config[projectKey] = {};
    }
    config[projectKey][sourceState] = {};
    transitionData.forEach(function (item) {
      var destination = item.to.name.toLowerCase();
      config[projectKey][sourceState][destination] = item;
    });
  }

  /**
   * Return the transition ID previously stored in a call to setTransitions
   * The funtion will return the id if there has been data stored for the 
   * transition from sourceState -> destinationState for an issue with the same
   * project prefix as the data in issueKey
   * @param {string} issueKey the id of the issue - this will be truncated to get the project id
   * @param {string} sourceState the state for which the transitions are valid to move from
   * @param {string} transitionData the list of transition options from the JIRA REST Api
   */
  this.getTransitionId = function (issueKey, sourceState, destinationState) {
    sourceState = sourceState.toLowerCase();
    destinationState = destinationState.toLowerCase();

    var projectKey = convertIssueKeyToProjectPrefix(issueKey);
    if (!this.hasTransitionIds(issueKey, sourceState)) {
      return null;
    }
    if (config[projectKey][sourceState][destinationState] == null) {
      return null;
    }
    return config[projectKey][sourceState][destinationState].id;
  }
}
// Node required code block
module.exports = IssueTransitionConfiguration;
// End of Node required code block