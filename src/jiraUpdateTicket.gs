// Require imports
const Request = require('../src/jiraApi.gs');
const getAllJiraFields = require('./jiraCommon.gs').getAllJiraFields;
const unifyIssueAttrib = require('./jiraCommon.gs').unifyIssueAttrib;
const debug = require("./debug.gs");
const getMatchingJiraField = require("../src/jiraCommon.gs").getMatchingJiraField;
// End of Require imports
/*
* @desc Takes a 2 x 2 array of values and uses them to update JIRA 
* @param headerRow {object} A dictionary where each key is the name of a Jira field and the value is the column index of that field in the data
* @param dataRows {array} A 2x2 array where each row is assumed to be data to be updated in an issue
* @return {object}
*/
function updateJiraIssues(headerRow,dataRows) {
    debug.info('updateJiraIssues called Keys:--%s  DATA ROWS %s', Object.keys(headerRow).join(","),dataRows);
    var result = {rowsUpdated:0, status: false, message: "", finished: false, errors:[] };
    
    if (headerRow === null || Object.keys(headerRow).length==0) {
        result.finished = true;
        result.message = "No values in header row";
    } else {
    
        if (dataRows == null || dataRows.length == 0) {
            result.status = true;
            result.finished = true;
            result.message = "No data sent";
            return result;

        } else {
            getAllJiraFields(
                function(allJiraFields) {
                    for (var i=0;i<dataRows.length;i++) {
                        var rowData = packageRowForUpdate(allJiraFields,headerRow,dataRows[i]);
                        if (rowData.key != null) {
                            var updateResult = updateIssueinJira(rowData, 
                                function(key,success,message){
                                    if (!success) {
                                        result.errors.push("Error with Issue "+key+" error="+message);
                                    }
                                });
                            if (updateResult) {
                                result.rowsUpdated++;
                            } 
                        } else {
                            result.errors.push("No Key value found in row "+i);
                        }
                    }
                    result.message = result.rowsUpdated+" jira issues(s) updated, "+result.errors.length+" errors.";
                    result.status = (result.rowsUpdated>0);
                    result.finished = true;
                }, 
                function(errorMessage) {
                    result.finished = true;
                    result.status = false;
                    result.message = "Could not retrieve all field definitions from JIRA "+errorMessage;
                }
            )
        }
    }

    return result;

}

function packageRowForUpdate(allJiraFields, headerRow, dataRow) {
    var keyFieldName = "issueKey";
    var result = {key:null,fields:{}};
    var filteredHeaders = getMatchingJiraFields(allJiraFields,headerRow);
    for (var headerId in filteredHeaders) {
        var index = filteredHeaders[headerId];
        var value = dataRow[index];
        if (value != null) {
            if (headerId != keyFieldName) {
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

function getMatchingJiraFields(allJiraFields,headerRow) {
    var filteredHeadings = {};
    Object.keys(headerRow).forEach( function(fieldTitle) {
        var matchField = getMatchingJiraField(allJiraFields,fieldTitle);
        if (matchField != null) {
            filteredHeadings[matchField.key] = headerRow[fieldTitle];
        } 
    });
    return filteredHeadings;
}

function updateIssueinJira(issueData, callback) {
    debug.log("updateIssueinJira called issueData="+issueData);
    var method = "issueUpdate";
    var request = new Request();
    var ok = function(responseData, httpResponse, statusCode){
        // Check the data is valid and the Jira fields exist
        if(statusCode==200) {
            // it worked
            var status = unifyIssueAttrib('status', responseData);
            callback(issueData.key,true,"");
        } else {
            callback(issueData.key,false,responseData.message);
        }
    };

    var error = function(responseData, httpResponse, statusCode) {
        if( statusCode == 404 ) {
            // JIRA ISSUE NOT FOUND
            callback(issueData.key,false,issueData.key+" Not found");
        } else {
            var jiraErrorMessage = "";
            if (responseData != null && responseData.errorMessages != null) {
                jiraErrorMessage =responseData.errorMessages.join(",") || responseData.errorMessages;
            }
            var message = "Jira Error: " + jiraErrorMessage;
            callback(issueData.key,false,message);
        }
        
    };
    request.call(method, {issueIdOrKey: issueData.key, fields: issueData.fields});
    request.withSuccessHandler(ok)
    request.withFailureHandler(error)
    return (request.getResponse().statusCode == 200);
    
}

module.exports = {updateJiraIssues: updateJiraIssues, packageRowForUpdate: packageRowForUpdate, updateIssueinJira: updateIssueinJira, getMatchingJiraFields:getMatchingJiraFields};