// Require imports
const Request = require('../src/jiraApi.gs');
const unifyIssueAttrib = require('./jiraCommon.gs').unifyIssueAttrib;
const debug = {
    info: console.log
}
// End of Require imports
/*
* @desc Takes a 2 x 2 array of values and uses them to update JIRA 
* @param headerRow {object} A dictionary where each key is the name of a Jira field and the value is the column index of that field in the data
* @param dataRows {array} A 2x2 array where each row is assumed to be data to be updated in an issue
* @return {object}
*/
function updateJiraIssues(headerRow,dataRows) {
    debug.info('updateJiraIssues called Keys:--%s  DATA ROWS %s', Object.keys(headerRow).join(","),dataRows);
    result = {rowsUpdated:0, status: true, message: null };
    if (headerRow === null || Object.keys(headerRow).length==0) {
        result.status = false;
        result.message = "No Header Row sent";
    } else {
        for (var i=0;i<dataRows.length;i++) {
            var rowData = packageRowForUpdate(headerRow,dataRows[i]);
            if (rowData.key != null) {
                result.rowsUpdated++;
            } else {
              // an error
            }
        }
        result.status = true;
    }
    return result;
}

function packageRowForUpdate(headerRow, dataRow) {
    var keyFieldName = "Key";
    var result = {key:null,fields:{}};
    for (var headerRowName in headerRow) {
        var index = headerRow[headerRowName];
        var value = dataRow[index];
        if (value != null) {
            if (headerRowName != keyFieldName) {
                result.fields[headerRowName] = value;
            } else {
                if (value.length > 0) {
                    result.key = value;
                }
            }
        }
    }
    return result;
}

function updateIssueinJira(issueData, callback) {
    var method = "issueStatus";
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

module.exports = {updateJiraIssues: updateJiraIssues, packageRowForUpdate: packageRowForUpdate, updateIssueinJira: updateIssueinJira};