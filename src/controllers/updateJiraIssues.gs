
/* Dialog: Update Fields in Jira Issues from Spreadsheet */


 // Node required code block

 //const getAllJiraFields = require("src/models/jira/IssueFields.gs").getAllJiraFields;
 const hasSettings = require("src/settings.gs").hasSettings;
 const getDialog = require("src/dialogs.gs").getDialog;
 const extend = require("src/jsLib.gs").extend;
 const getTicketSheet = require("src/jiraCommon.gs").getTicketSheet;
 const getValidFieldsToEditJira = require('src/models/jira/IssueFields.gs').getValidFieldsToEditJira
 // End of Node required code block

/**
 * Menu action to show the dialog for updating jira issues
 */
function menuUpdateJiraIssues() {
  if (!hasSettings(true)) return;
  var selectedData = getDataForJiraUpdateFromSheet_();
  var fieldsToUse = { "": "select a jira field...", issueKey: "Key" };
  fieldsToUse = extend(fieldsToUse, getValidFieldsToEditJira());
  selectedData.allJiraFields = fieldsToUse;
  var readOnlyFields = { "Updated": true, "Issue Type": true, "Created": true };
  selectedData.readOnlyFields = readOnlyFields;
  var dialog = getDialog('views/dialogs/updateJiraIssues', selectedData);
  dialog
    .setWidth(420)
    .setHeight(360)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Update Jira Issues (BETA)');
}

/**
 * Call back from the update issues dialog when the user has selected which columns 
 * to update and the corresponding JIRA fields
 * @param headerFieldsToUse the column headers and mappings the user has selected
 * @returns {object} the result from updateJiraIssues =  { rowsUpdated: X, status: true/false, message: "", finished: true/false, errors: [] }
 */
function callbackProcessIssuesFromSheet(headerFieldsToUse) {
  if (!hasSettings(true)) return;
  var selectedData = getDataForJiraUpdateFromSheet_();
  var data = selectedData.dataRows;
  return updateJiraIssues(headerFieldsToUse, data);
}


/**
 * Finds the selected rows and columns in the Google spreadsheet
 * Assumes the top row is the headers and all other rows 
 * correspond to an issue in JIRA
 * @returns {object} an object with the headerfields and then the datarows
 */
function getDataForJiraUpdateFromSheet_() {
  var cellValues = getTicketSheet().getActiveRange().getValues();
  var headerFields = {};
  var dataRows = [];
  if (cellValues.length > 0) {
    var firstRow = cellValues[0];
    for (var i = 0; i < firstRow.length; i++) {
      if (firstRow[i] != null && firstRow[i] != "") {
        headerFields[firstRow[i]] = i;
      }
    }
    cellValues.splice(0, 1);
    dataRows = cellValues;
  }
  var result = {
    headerFields: headerFields,
    dataRows: dataRows
  };
  return result;
}

/* Dialog: Update Fields in Jira Issues from Spreadsheet - END */



// Node required code block
module.exports = {
  callbackProcessIssuesFromSheet :callbackProcessIssuesFromSheet,
  menuUpdateJiraIssues: menuUpdateJiraIssues
}
// End of Node required code block