/**
 * Model class for interactions with JIRA changelogs
 *
 */

// Node required code block
const JiraRequest = require('src/jiraApi.gs');
// End of Node required code block

IssueChangelogs = (function () {

    function getAllChangelogs(successCallBack, errorCallBack) {
        var request = new JiraRequest();

        var ok = function (respData, httpResp, status) {

            if (!respData) {
                error(respData, httpResp, status);
            } else {
                if (successCallBack != null) {
                    successCallBack(respData);
                }
            }
        };

        var error = function (respData, httpResp, status) {
            var jiraErrorMessage = "";
            if (respData != null && respData.errorMessages != null) {
                jiraErrorMessage = respData.errorMessages.join(",") || respData.errorMessages;
            }
            var msg = "Failed to retrieve Jira Fields info with status [" + status + "]!\\n"
                + jiraErrorMessage;
            if (errorCallBack != null) {
                errorCallBack(msg, httpResp, status);
            }
        };
        request.call("history")
            .withSuccessHandler(ok)
            .withFailureHandler(error);
    }

    return {
        getAllChangelogs: getAllChangelogs
    }
})();


// Node required code block
module.exports = IssueChangelogs;
// End of Node required code block
