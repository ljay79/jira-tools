/**
 * @author Jens Rosemeier <github@jens79.de>
 * @github  https://github.com/ljay79/jira-tools
 * @copyright Jens Rosemeier, 2017-2018
 * 
 * @OnlyCurrentDoc  Limits the script to only accessing the current spreadsheet.
 *
 * ToDo/Notes:
 * - use google auth with token based Jira RESTful API vs. cleartext password
 */

var BUILD = '1.0.1';

/** 
 * Add a nice menu option for the users.
 */
function onOpen(e) {
  addMenu();

  if (e && e.authMode == ScriptApp.AuthMode.FULL) {
    var userProps = PropertiesService.getUserProperties();
    debug.enable( (userProps.getProperty('debugging')=='true') );
  }
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
  SpreadsheetApp.getUi().createAddonMenu()
    .addItem('Refresh Ticket Data', 'dialogRefreshTicketsIds')
    .addItem('Re-Calculate all formulas in active sheet', 'recalcCustomFunctions')
    .addItem('Show Jira Field Map', 'sidebarJiraFieldMap')
    
    .addSeparator()
    .addItem('List Issues from Filter', 'dialogIssueFromFilter')
    .addItem('Create Time Report', 'dialogTimesheet')

    .addSeparator()
    .addItem('Settings', 'dialogSettings')
    .addItem('Configure Custom Fields', 'dialogCustomFields')
    .addItem('About', 'dialogAbout')
  
    .addToUi();
}
