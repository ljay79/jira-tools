
/* Dialog: Update Fields in Jira Issues from Spreadsheet */
/*
* @desc Gets the selected cells in the spreadsheet and separates to headers and datarows
* @return {object}
*/

/**
 * Menu action to show the dialog for updating jira issues
 */
function menuUpdateJiraIssues() {
  if (!hasSettings(true)) return;
  var selectedData = getDataForJiraUpdateFromSheet_();
  var fieldsToUse = { "": "select a jira field...", issueKey: "Key" };
  fieldsToUse = extend(fieldsToUse, getValidFieldsToEditJira_());
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

/**
 * Finds the list of valid JIRA fields which can be edited
 * @returns {array} an array of built in and user selected custom fields
 */
function getValidFieldsToEditJira_() {
  var validFields = {};
  var userSelectedcustomFields = getCustomFields(CUSTOMFIELD_FORMAT_SEARCH);
  var systemFields = ISSUE_COLUMNS;
  validFields = extend(validFields, userSelectedcustomFields);
  validFields = extend(validFields, systemFields);
  return validFields;
}
/* Dialog: Update Fields in Jira Issues from Spreadsheet - END */