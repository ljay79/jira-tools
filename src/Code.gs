/**
 * @copyright Copyright (c) 2017-2025, Jens Rosemeier. All rights reserved.
 *            Copyrights licensed under GNU GENERAL PUBLIC LICENSE v3.
 *
 * @github  https://github.com/ljay79/jira-tools
 * @author  Jens Rosemeier <github@jens79.de> - https://github.com/ljay79
 * @author  Paul Lemon - https://github.com/paul-lemon
 * @author  Daniel Kulbe - https://github.com/DanielKulbe
 *
 * @OnlyCurrentDoc  Limits the script to only accessing the current spreadsheet.
 */

var BUILD = '1.5.2-beta';

/**
 * Add a nice menu option for the users.
 */
function onOpen(e) {
  addMenu();
};

/**
 * Runs when the add-on is installed.
 * This method is only used by the regular add-on, and is never called by
 * the mobile add-on version.
 *
 * @param {object} e The event parameter for a simple onInstall trigger. To
 *     determine which authorization mode (ScriptApp.AuthMode) the trigger is
 *     running in, inspect e.authMode. (In practice, onInstall triggers always
 *     run in AuthMode.FULL, but onOpen triggers may be AuthMode.LIMITED or
 *     AuthMode.NONE.)
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Add "Jira" Menu to UI.
 * @OnlyCurrentDoc
 */
function addMenu() {
  var menu = SpreadsheetApp.getUi().createAddonMenu()
    .addItem('Whats New?', 'menuWhatsNew')
    .addSeparator()
    .addItem('Create IssueTable from filter', 'menuInsertIssueFromFilter')
    .addItem('Refresh IssueTable', 'menuRefreshIssueTable')
    .addItem('Create time report', 'menuCreateTimeReport')
    .addItem('Update Jira Issues', 'menuUpdateJiraIssues')
    .addItem('Create changelog report', 'menuCreateChangelogReport')
    .addSeparator()
    .addItem('Update formulas in active sheet', 'recalcCustomFunctions')
    .addItem('Update issue key status...', 'dialogRefreshTicketsIds')
    .addItem('Show Jira field map', 'menuJiraFieldMap')
    .addSeparator()
    .addItem('Settings', 'menuSettings')
    .addItem('Configure custom fields', 'menuCustomFields')
    .addItem('About', 'dialogAbout')
    .addToUi();
}

/**
 * Deprecation notice to "server" users
 * @OnlyCurrentDoc
 */
function DeprecationNotice_() {
  debug.time('[DeprecationNotice_]');

  if (!hasSettings(false)) {
    return;
  }
  if (getCfg_('server_type') == 'onDemand') {
    return;
  }

  var key_count = 'DEPRECATION_NOTICE_SHOWN_COUNT';
  var docProps  = CacheService.getDocumentCache();
  var count     = docProps.get(key_count) || 0;
  var dialog    = getDialog('views/dialogs/dialogDeprecationNotice', {});

  if (count <= 0) {
    dialog
      .setWidth(480)
      .setHeight(400)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'Notice! Important!');

    docProps.put(key_count, 1);
  }

  debug.timeEnd('[DeprecationNotice_]');
}
// --

// Node required code block
module.exports = {
  onOpen: onOpen
}
// End of Node required code block
