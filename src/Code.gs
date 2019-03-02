/**
 * @copyright Copyright (c) 2017-2019, Jens Rosemeier. All rights reserved.
 *            Copyrights licensed under GNU GENERAL PUBLIC LICENSE v3.
 * 
 * @github  https://github.com/ljay79/jira-tools
 * @author  Jens Rosemeier <github@jens79.de> - https://github.com/ljay79
 * @author  Paul Lemon - https://github.com/paul-lemon
 * @author  Daniel Kulbe - https://github.com/DanielKulbe
 * 
 * @OnlyCurrentDoc  Limits the script to only accessing the current spreadsheet.
 */

var BUILD = '1.1.2';

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
    .addItem('List issues from filter', 'dialogIssueFromFilter')
    .addItem('Create time report', 'dialogTimesheet')
    .addSeparator()
    .addItem('Update formulas in active sheet', 'recalcCustomFunctions')
    .addItem('Update issue key status "KEY-123 [Done]"', 'dialogRefreshTicketsIds')
    .addItem('Jira field map', 'sidebarJiraFieldMap')
    .addSeparator()
    .addItem('Settings', 'dialogSettings')
    .addItem('Configure custom fields', 'dialogCustomFields')
    .addItem('About', 'dialogAbout');

    if (environmentConfiguration.features.updateJira.enabled) {
        menu.addSeparator()
        .addItem('Update Jira Issues (BETA)', 'dialogIssuesFromSheet');
    }

    menu.addToUi();
}

// Node required code block
module.exports = {
  onOpen: onOpen
}
// End of Node required code block