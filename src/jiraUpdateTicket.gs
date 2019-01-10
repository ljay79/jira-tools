// Require imports
const Request = require('../src/jiraApi.gs');
const getAllJiraFields = require('./jiraCommon.gs').getAllJiraFields;
const unifyIssueAttrib = require('./jiraCommon.gs').unifyIssueAttrib;
const debug = {
    info: console.log
}
const getMatchingJiraField = require("../src/jiraCommon.gs").getMatchingJiraField;
// End of Require imports
/*
* @desc Takes a 2 x 2 array of values and uses them to update JIRA 
* @param headerRow {object} A dictionary where each key is the name of a Jira field and the value is the column index of that field in the data
* @param dataRows {array} A 2x2 array where each row is assumed to be data to be updated in an issue
* @return {object}
*/
function updateJiraIssues(headerRow,dataRows, callback) {
    //debug.info('updateJiraIssues called Keys:--%s  DATA ROWS %s', Object.keys(headerRow).join(","),dataRows);
    result = {rowsUpdated:0, status: true, message: null, finished: false };
    
    if (headerRow === null || Object.keys(headerRow).length==0) {
        result.status = false;
        result.finished = true;
        result.rowsUpdated = 0;
        result.message = "No Header Row sent";
        return result;
    } 
    
    if (dataRows == null || dataRows.length == 0) {
        result.status = true;
        result.finished = true;
        result.rowsUpdated = 0;
        result.message = "No Data";
        return result;

    }
    getAllJiraFields(
        function(allJiraFields) {
            var callbackresult = {rowsUpdated:0, status: true, message: null, finished: false };
            for (var i=0;i<dataRows.length;i++) {
                var rowData = packageRowForUpdate(allJiraFields,headerRow,dataRows[i]);
                if (rowData.key != null) {
                    callbackresult.rowsUpdated++;
                } else {
                    callbackresult.message = "No Key value found in row "+i;
                }
            }
            callbackresult.status = true;
            callbackresult.finished = true;
            if (callback != null) {
                callback(callbackresult);
            }
        }, 
        function(errorMessage) {
            var callbackresult = {rowsUpdated:0, status: true, message: null, finished: false };
            callbackresult.finished = true;
            callbackresult.status = false;
            callbackresult.message = errorMessage;
            if (callback != null) {
                callback(callbackresult);
            }
    });
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
    var method = "issue";
    var request = new Request();
    var ok = function(responseData, httpResponse, statusCode){
        // Check the data is valid and the Jira fields exist
        if(responseData && responseData.fields) {
            // it worked
            var status = unifyIssueAttrib('status', responseData);
            callback(issueData.key,true,"");
        } else {
            callback(issueData.key,false,"Unexpected Error");
        }
    };

    var error = function(responseData, httpResponse, statusCode) {
        if( statusCode == 404 ) {
            // JIRA ISSUE NOT FOUND
            callback(issueData.key,false,issueData.key+" Not found");
        } else {
            var message = "Jira Error: " + responseData.errorMessages.join(",") || responseData.errorMessages;
            callback(issueData.key,false,message);
        }
        
    };

    request.call(method, {issueIdOrKey: issueData.key})
        .withSuccessHandler(ok)
        .withFailureHandler(error);
    
}

module.exports = {updateJiraIssues: updateJiraIssues, packageRowForUpdate: packageRowForUpdate, updateIssueinJira: updateIssueinJira, getMatchingJiraFields:getMatchingJiraFields};