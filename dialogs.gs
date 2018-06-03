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
  if(debugValue.password) delete debugValue.password;
  if(debugValue.username) delete debugValue.username;
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
    .setHeight(420)
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
    available: getCfg('available'),
    url: getCfg('jira_url'),
    username: getCfg('jira_username'),
    password: getCfg('jira_password'),
    workhours: getStorage_().getValue('workhours'),
    dspuseras_name: getStorage_().getValue('dspuseras_name')
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
  if(!hasSettings(true)) return;
  
  refreshTickets();
}

/* Dialog: Import Issues */

/**
 * @desc Dialog to choose issues filter
 */
function dialogIssueFromFilter() {
  if(!hasSettings(true)) return;

  var customFields = getCustomFields(CUSTOMFIELD_FORMAT_SEARCH);
  var userColumns = getStorage_().getValue('userColumns') || [];
  var dialog = getDialog('dialogIssuesFromFilter', {
    columns: ISSUE_COLUMNS,
    customFields: customFields,
    userColumns: userColumns.length > 0 ? userColumns : jiraColumnDefault
  });

  // try to adjust height depending on amount of jira fields to show
  var rowH = 28;
  var height = 404;
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
    tempUserKey: tempActiveUserKey
  });

  dialog
    .setWidth(480)
    .setHeight(400)
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
  if(!hasSettings(true)) return;

  var dialog = getDialog('dialogTimesheet');

  dialog
    .setWidth(420)
    .setHeight(360)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Create Time Report');
}

/* Dialog: Worklog - END */


/* Dialog: Custom Fields */

/**
 * @desc Dialog to configure Jira custom fields
 */
function dialogCustomFields() {
  if(!hasSettings(true)) return;

  var dialog = getDialog('dialogCustomFields', {favoriteCustomFields: (getStorage_().getValue('favoriteCustomFields') || [])});

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
  var dialog = getDialog('sidebarFieldMap', {fieldMap: fieldMap});

  debug.log('Processed: %s', dialog);

  var html = HtmlService.createHtmlOutput( dialog.getContent() )
    .setTitle('Jira Field Map')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
  ;

  SpreadsheetApp.getUi().showSidebar(html);
}

/* Sidebar: Field Map - END */
