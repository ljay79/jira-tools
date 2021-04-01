/**
 * Model class for interactions with JIRA changelogs
 * @todo Currently this just contains all of the functions used across the code base - needs to be factored into a class
 */

// Node required code block
const JiraRequest = require('src/jiraApi.gs');
// End of Node required code block

// namespace IssueChangelogs {

    function getAllChangelogs(successCallBack, errorCallBack) {
        var changelogs;
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
        if (changelogs == null) {
            return [];
        } else {
            return changelogs;
        }
    }
// }


// Node required code block
module.exports = getAllChangelogs;
// End of Node required code block
