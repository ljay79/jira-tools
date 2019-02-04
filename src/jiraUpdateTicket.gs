// Node required code block
const Request = require('../src/jiraApi.gs');
const getAllJiraFields = require('./jiraCommon.gs').getAllJiraFields;
const unifyIssueAttrib = require('./jiraCommon.gs').unifyIssueAttrib;
const debug = require("./debug.gs").debug;
const getMatchingJiraField = require("./jiraCommon.gs").getMatchingJiraField;
const IssueTransitioner = require('./jiraIssueStatusUpdates/issueTransitioner.gs');
// End of Node required code block

/*
* @desc Takes a 2 x 2 array of values and uses them to update JIRA 
* @param headerRow {object} A dictionary where each key is the name of a Jira field and the value is the column index of that field in the data
* @param dataRows {array} A 2x2 array where each row is assumed to be data to be updated in an issue
* @return {object}
*/
function updateJiraIssues(headerRow, dataRows) {
  debug.info('updateJiraIssues called Keys:--%s  DATA ROWS %s', Object.keys(headerRow).join(","), dataRows);
  var result = { rowsUpdated: 0, status: false, message: "", finished: false, errors: [] };

  if (headerRow === null || Object.keys(headerRow).length == 0) {
    result.finished = true;
    result.message = "No values in header row";
  } else {

    if (dataRows == null || dataRows.length == 0) {
      result.status = true;
      result.finished = true;
      result.message = "No data sent";
      return result;

    } else {
      var statusTransitioner = new IssueTransitioner();
      allJiraFields = getAllJiraFields(
        function (allJiraFields) {
          for (var i = 0; i < dataRows.length; i++) {
            var rowData = packageRowForUpdate(allJiraFields, headerRow, dataRows[i]);
            if (rowData.key != null) {
              if (rowData.fields["status"] != null) {
                var statusTransition = statusTransitioner.transition(rowData.key, rowData.fields["status"]);
                delete (rowData.fields["status"]);
                if (!statusTransition.success) {
                  statusTransition.errors.forEach(function (message) {
                    result.errors.push("[" + rowData.key + "] " + message);
                  });
                }
              }
              var updateResult = updateIssueinJira(rowData,
                function (key, success, message) {
                  if (!success) {
                    // replace mention of specific field ids in error messages, try use field name
                    message = message.replace(/{Field:(.*?)}/g, function (match, fieldName) {
                      var errorField = getMatchingJiraField(allJiraFields, fieldName);
                      if (errorField != null) {
                        return errorField.name;
                      }
                      return "";
                    });
                    result.errors.push("[" + key + "] " + message);
                  }
                });
              if (updateResult) {
                result.rowsUpdated++;
              }
            } else {
              result.errors.push("No Key value found in row " + i);
            }
          }
          result.message = result.rowsUpdated + " jira issues(s) updated, " + result.errors.length + " errors.";
          result.status = (result.rowsUpdated > 0);
          result.finished = true;
        },
        function (errorMessage) {
          result.finished = true;
          result.status = false;
          result.message = "Could not retrieve all field definitions from JIRA " + errorMessage;
        }
      )
    }
  }

  return result;

}

/**
 * Takes a value from the spreadsheet and the definition of the field (retrieved from JIRA)
 * and converts it to JSON which JIRA should accept
 * Does not cover all fields
 * @param fieldDefinition - the definition of the field from JIRA
 * @param value - the value from the spreadsheet for the specified field
 */
function formatFieldValueForJira(fieldDefinition, value) {
  if (fieldDefinition.key == "labels") {
    if (value == "") {
      value = null;
    } else {
      value = value.split(",");
    }
    return value;
  }

  if (fieldDefinition.schemaType == "number") {
    if (value == "") {
      value = null;
    }
    return value;
  }
  if (fieldDefinition.custom && fieldDefinition.schemaType == "array|string") {
    // array|string as a schematpe is used by many fields
    // intended first to fix bug with setting sprint fields to empty
    // currently there is no other way to identify the sprint field
    if (value == "") {
      value = null;
    } else if (!isNaN(value)) {
      value = +value;
    }
    return value;
  }
  return value;
}

/**
 * Takes a row of data from the spreadsheet and converts it into a JSON object to be posted
 * to the JIRA rest API
 * @param allJiraFields  - the definition of all JIRA fields retrieved from the RESt API
 * @param headerRow - the header row from the spreadsheet
 * @param dataRow - the row of data from the spreadsheet
 */
function packageRowForUpdate(allJiraFields, headerRow, dataRow) {
  var keyFieldName = "issuekey";
  var result = { key: null, fields: {} };
  var filteredHeaders = getMatchingJiraFields(allJiraFields, headerRow);
  for (var headerId in filteredHeaders) {
    var index = filteredHeaders[headerId].index;
    var fieldDefinition = filteredHeaders[headerId].definition;
    var value = dataRow[index];
    if (value != null) {
      value = formatFieldValueForJira(fieldDefinition, value);
      if (headerId.toLowerCase() != keyFieldName) {
        result.fields[headerId] = value;

      } else {
        if (value.length > 0) {
          result.key = value;
        }
      }
    }
  }
  return result;
}

/**
 * Filters through the values in the header row from the spreadshet to find
 * the best matching fields defined in the JIRA instance
 * @param allJiraFields 
 * @param headerRow 
 */
function getMatchingJiraFields(allJiraFields, headerRow) {
  var filteredHeadings = {};
  Object.keys(headerRow).forEach(function (fieldTitle) {
    var matchField = getMatchingJiraField(allJiraFields, fieldTitle);
    if (matchField != null) {
      filteredHeadings[matchField.key] = {
        index: headerRow[fieldTitle],
        definition: matchField
      }
    }
  });
  return filteredHeadings;
}

/**
 * Updates a JIRA issue by making a call to the configured JIRA server
 * @param issueData - the JSON data for posting to the server
 * @param callback - a call back function when the request is made. 
 * @returns boolean - true if the issue has been updated succesfully
 */
function updateIssueinJira(issueData, callback) {
  debug.log("updateIssueinJira called issueData=" + issueData);
  var method = "issueUpdate";
  var request = new Request();
  var ok = function (responseData, httpResponse, statusCode) {
    // it worked
    var status = unifyIssueAttrib('status', responseData);
    callback(issueData.key, true, "");
  };

  var error = function (responseData, httpResponse, statusCode) {
    if (statusCode == 404) {
      // JIRA ISSUE NOT FOUND
      callback(issueData.key, false, issueData.key + " Not found");
    } else {
      var jiraErrorMessage = "";
      if (responseData != null) {
        if (responseData.errorMessages != null) {
          jiraErrorMessage = jiraErrorMessage + responseData.errorMessages.join(", ");
        }
        if (responseData.errors != null) {
          Object.keys(responseData.errors).forEach(function (fieldid) {
            jiraErrorMessage = jiraErrorMessage + "{Field:" + fieldid + "}: " + responseData.errors[fieldid] + ", ";
          });
        }
      }
      var message = jiraErrorMessage;
      callback(issueData.key, false, message);
    }

  };
  request.call(method, {
    issueIdOrKey: issueData.key,
    fields: issueData.fields,
    update: {
      comment: [{
        add: {
          body: "Updated by Jira Sheet Tools https://github.com/ljay79/jira-tool"
        }
      }]
    }
  });
  request.withSuccessHandler(ok);
  request.withFailureHandler(error);
  return (request.getResponse().success === true);

}

// Node required code block
module.exports = {
  updateJiraIssues: updateJiraIssues,
  packageRowForUpdate: packageRowForUpdate,
  updateIssueinJira: updateIssueinJira,
  getMatchingJiraFields: getMatchingJiraFields,
  formatFieldValueForJira: formatFieldValueForJira
};
// End of Node required code block