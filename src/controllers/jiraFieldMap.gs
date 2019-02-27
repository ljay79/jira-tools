
/** 
 * Controller for showing all jira fields in a sidenar
 */


 // Node required code block

const IssueFields = require("src/models/jira/IssueFields.gs").IssueFields;
const getDialog = require("src/dialogs.gs").getDialog;
// End of Node required code block

/**
 * @desc Fetch list of all Jira fields (name and id) and show them in a sidebar.
 */
function menuJiraFieldMap() {

  var ok = function(fieldMap) {
    sidebarFieldMap_(fieldMap);
  };

  var error = function(msg) {
    Browser.msgBox(msg, Browser.Buttons.OK);
    debug.error(msg + " httpResp: %s", httpResp);
  };

  IssueFields.getAllFields(ok,error);
}


/**
 * @desc Show sidebar with Jira field map listing
 * @param fieldMap {object}
 */
function sidebarFieldMap_(fieldMap) {
  // only show actual jira fields to the user
  fieldMap = fieldMap.filter(function(field){
    return !field.isVirtual;
  });
  var dialog = getDialog('views/sidebar/fieldMap', { fieldMap: fieldMap });

  debug.log('Processed: %s', dialog);

  var html = HtmlService.createHtmlOutput(dialog.getContent())
    .setTitle('Jira Field Map')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    ;

  SpreadsheetApp.getUi().showSidebar(html);
}

// Node required code block
module.exports = {
  menuJiraFieldMap :menuJiraFieldMap
}
// End of Node required code block