/*
* @desc Takes a 2 x 2 array of values and uses them to update JIRA 
* @param headerRow {object} A dictionary where each key is the name of a Jira field and the value is the column index of that field in the data
* @param dataRows {array} A 2x2 array where each row is assumed to be data to be updated in an issue
* @return {object}
*/
function updateIssues(headerRow,dataRows) {
    result = {rowsUpdated:0, status: false, message: "no data selected"};
    return result;
}

module.exports = updateIssues;