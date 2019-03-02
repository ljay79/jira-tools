// Node required code block
const extend = require('./jsLib.gs').extend;
// End of Node required code block


//*** All UI Dialogs for this add-on ***//

/**
 * @desc Jira Settings Dialog preprocessor
 * @param file {string}  Filename
 * @param values {object}
 * @return {HtmlOutput}
 */
function getDialog(file, values) {
  var template = HtmlService.createTemplateFromFile(file);

  // privacy (remove clear text password and username from possible debug logging
  var debugValue = {};
  extend(debugValue, values);
  if (debugValue.password) delete debugValue.password;
  if (debugValue.username) delete debugValue.username;
  debug.log('Processing: %s.html with %s', file, JSON.stringify(debugValue));
  for (var name in values) {
    template[name] = values[name];
  }

  return template.evaluate();
}

/* Dialog: Settings */

/**
 * @desc Jira Settings Dialog constructor
 */
function dialogSettings() {
  initDefaults();

  var dialog = getDialog('dialogSettings', getServerCfg());

  dialog
    .setWidth(360)
    .setHeight(500)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Jira Server Settings');
}

/**
 * @desc Helper for our Settings Dialogs HTML.
 * @return {object} 
 */
function getServerCfg() {
  return {
    available: getCfg_('available'),
    url: getCfg_('jira_url'),
    username: getCfg_('jira_username'),
    password: getCfg_('jira_password'),
    workhours: UserStorage.getValue('workhours'),
    dspuseras_name: UserStorage.getValue('dspuseras_name'),
    dspdurationas: UserStorage.getValue('dspdurationas')
  };
}

/* Dialog: Settings - END */

/**
 * @desc Fetch all Jira Issue IDs from active sheet and update their status.
 *     Example: Cell with value "TIS-123" becomes "TIS-123 [Done]". 
 *     Status msg in brackets gets updated.
 * @return void
 */
function dialogRefreshTicketsIds() {
  if (!hasSettings(true)) return;

  refreshTickets();
}

/* Dialog: Import Issues */

/**
 * @desc Dialog to choose issues filter
 */
function dialogIssueFromFilter() {
  if (!hasSettings(true)) return;

  var customFields = getCustomFields(CUSTOMFIELD_FORMAT_SEARCH);
  var userColumns = UserStorage.getValue('userColumns') || [];
  var dialog = getDialog('dialogIssuesFromFilter', {
    columns: ISSUE_COLUMNS,
    customFields: customFields,
    userColumns: userColumns.length > 0 ? userColumns : jiraColumnDefault
  });

  // try to adjust height depending on amount of jira fields to show
  var rowH = 32;
  var height = 424;
  height += (Math.ceil(Object.keys(ISSUE_COLUMNS).length % 4) * rowH);
  height += (Math.ceil(Object.keys(customFields).length % 4) * rowH);

  dialog
    .setWidth(600)
    .setHeight(height)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'List Jira issues from filter');
}

/* Dialog: Import Issues - END */

/* Dialog: About */

/**
 * @desc Dialog "About"
 */
function dialogAbout() {
  var tempActiveUserKey = Session.getTemporaryActiveUserKey();
  var userProps = PropertiesService.getUserProperties();
  var dialog = getDialog('dialogAbout', {
    buildNumber: BUILD,
    debugging: userProps.getProperty('debugging'),
    tempUserKey: tempActiveUserKey,
    environmentConfiguration: environmentConfiguration,
    debugEnabled: debug.isEnabled()
  });

  dialog
    .setWidth(480)
    .setHeight(420)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'About');
}

/* Dialog: About - END */


/* Dialog: Worklog */

/**
 * @desc Dialog to create worklog based on user/group selection
 */
function dialogTimesheet() {
  if (!hasSettings(true)) return;

  var dialog = getDialog('dialogTimesheet');

  dialog
    .setWidth(420)
    .setHeight(360)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Create time report');
}

/* Dialog: Worklog - END */

/* Dialog: Update Fields in Jira Issues from Spreadsheet */
/*
* @desc Gets the selected cells in the spreadsheet and separates to headers and datarows
* @return {object}
*/
function getDataForJiraUpdateFromSheet() {
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

function getValidFieldsToEditJira() {
  var validFields = {};
  var userSelectedcustomFields = getCustomFields(CUSTOMFIELD_FORMAT_SEARCH);
  var systemFields = ISSUE_COLUMNS;
  validFields = extend(validFields, userSelectedcustomFields);
  validFields = extend(validFields, systemFields);
  return validFields;
}

function dialogIssuesFromSheet() {
  if (!hasSettings(true)) return;
  var selectedData = getDataForJiraUpdateFromSheet();
  var fieldsToUse = { "": "select a jira field...", issueKey: "Key" };
  fieldsToUse = extend(fieldsToUse, getValidFieldsToEditJira());
  selectedData.allJiraFields = fieldsToUse;

  var readOnlyFields = { "Updated": true, "Issue Type": true, "Created": true };
  selectedData.readOnlyFields = readOnlyFields;
  var dialog = getDialog('dialogIssuesFromSheet', selectedData);
  dialog
    .setWidth(420)
    .setHeight(360)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Update Jira Issues (BETA)');
}

function dialogProcessIssuesFromSheet(headerFieldsToUse) {
  if (!hasSettings(true)) return;
  var selectedData = getDataForJiraUpdateFromSheet();
  var data = selectedData.dataRows;
  return updateJiraIssues(headerFieldsToUse, data);
}


/* Dialog: Update Fields in Jira Issues from Spreadsheet - END */

/* Dialog: Custom Fields */

/**
 * @desc Dialog to configure Jira custom fields
 */
function dialogCustomFields() {
  if (!hasSettings(true)) return;

  var dialog = getDialog('dialogCustomFields', {favoriteCustomFields: (UserStorage.getValue('favoriteCustomFields') || [])});

  dialog
    .setWidth(480)
    .setHeight(460)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Configure Custom Fields');
}

/* Dialog: Custom Fields - END */


/* Sidebar: Field Map */

/**
 * @desc Show sidebar with Jira field map listing
 * @param fieldMap {object}
 */
function sidebarFieldMap(fieldMap) {
  var dialog = getDialog('sidebarFieldMap', { fieldMap: fieldMap });

  debug.log('Processed: %s', dialog);

  var html = HtmlService.createHtmlOutput(dialog.getContent())
    .setTitle('Jira Field Map')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    ;

  SpreadsheetApp.getUi().showSidebar(html);
}

/* Sidebar: Field Map - END */


/* Sidebar: Quick Menu */

/**
 * @desc Show sidebar with Quick Menu for all/most features
 */
function sidebarQuickMenu() {
  var dialog = getDialog('sidebarQuickMenu');

  debug.log('Processed: %s', dialog);

  var html = HtmlService.createHtmlOutput(dialog.getContent())
    .setTitle('Quick Menu')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    ;

  SpreadsheetApp.getUi().showSidebar(html);
}
/* Sidebar: Quick Menu - END */


// Node required code block
module.exports = { dialogAbout: dialogAbout, getDialog: getDialog }
// End of Node required code block
