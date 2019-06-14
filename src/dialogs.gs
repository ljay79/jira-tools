// Node required code block
const extend = require('./jsLib.gs').extend;
// End of Node required code block


//*** All UI Dialogs for this add-on ***//

/**
 * @desc Jira Dialog preprocessor
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
