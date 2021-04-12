/**
 * Model class for interactions with JIRA changelogs
 *
 */

// Node required code block
const JiraRequest = require('src/jiraApi.gs');
// End of Node required code block

interface HistoryEntry {
    /** The name of the field changed. */
    field?: string;
    /** The type of the field changed. */
    fieldtype?: string;
    /** The ID of the field changed. */
    fieldId?: string;
    /** The details of the original value. */
    from?: string;
    /** The details of the original value as a string. */
    fromString?: string;
    /** The details of the new value. */
    to?: string;
    /** The details of the new value as a string. */
    toString?: string;
}
// namespace IssueChangelogs {

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
// }


// Node required code block
module.exports = getAllChangelogs;
// End of Node required code block
