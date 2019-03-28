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
  _logTemplate(values,file);
  
  for (var name in values) {
    template[name] = values[name];
  }
  return template.evaluate();

  function _logTemplate(values,file) {
    var debugValue = {};
    extend(debugValue, values);
    if (debugValue.password) delete debugValue.password;
    if (debugValue.username) delete debugValue.username;
    debug.log('Processing: %s.html with %s', file, JSON.stringify(debugValue));
  }
}

/* Dialog: Settings */

/**
 * @desc Jira Settings Dialog constructor
 */
function dialogSettings() {
  initDefaults();

  var dialog = getDialog('dialogSettings', getServerCfg());

  dialog
    .setWidth(510)
    .setHeight(500)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Settings');
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

  var customFields = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_SEARCH);
  var userColumns = UserStorage.getValue('userColumns') || [];
  var dialog = getDialog('dialogIssuesFromFilter', {
    columns: IssueFields.getBuiltInJiraFields(),
    customFields: customFields,
    userColumns: userColumns.length > 0 ? userColumns : jiraColumnDefault
  });

  // try to adjust height depending on amount of jira fields to show
  var rowH = 32;
  var height = 424;
  height += (Math.ceil(Object.keys(IssueFields.getBuiltInJiraFields()).length % 4) * rowH);
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
