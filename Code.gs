/**
 * @author Jens Rosemeier <github@jens79.de>
 * @github  https://github.com/ljay79/jira-tools
 *
 * ToDo/Notes:
 * - use google auth with token based Jira RESTful API vs. cleartext password
 * - add feature to insert worklogs - list of worklogs, using dialog with filter input
 * - add feature to insert list of tickets (issue overview) based on available Jira filters
 */

var userProps = PropertiesService.getUserProperties();

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
 */
function addMenu() {
  SpreadsheetApp.getUi()
    .createMenu('JIRA')
    // Tools
    .addItem('Refresh Ticket Data', 'refreshTicketsIds')
    
    // Add "Ïnsert ..." menu with submenu
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Insert...')
      //.addItem('Worklog', 'mySecondFunction')
      .addItem('List Issues from Filter', 'dialogIssueFromFilter'))

    .addSeparator()
    .addItem('Settings', 'dialogSettings')
    .addItem('About', 'dialogAbout')

    .addToUi();
}
