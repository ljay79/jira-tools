/**
 * @author Jens Rosemeier <github@jens79.de>
 * @github  https://github.com/ljay79/jira-tools
 *
 * ToDo/Notes:
 * - use google auth with token based Jira RESTful API vs. cleartext password
 * - add feature to insert worklogs - list of worklogs, using dialog with filter input
 * - add feature to insert list of tickets (issue overview) based on available Jira filters
 */

var BUILD = 0170;
var LOGGING = true;

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
  SpreadsheetApp.getUi().createAddonMenu()
    // Tools
    .addItem('Refresh Ticket Data', 'dialogRefreshTicketsIds')
    
    // Add "Insert ..." menu with submenu
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Insert...')
      .addItem('List Issues from Filter', 'dialogIssueFromFilter')
      .addItem('Worklog', 'dialogWorklog')
    )

    .addSeparator()
    .addItem('Settings', 'dialogSettings')
    .addItem('About', 'dialogAbout')
  
    .addToUi();
}

/**
 * @desc Simple Logger.log wrapper for centralized enabling/disabling log messages
 * @param format  A Format or message to log
 * @param values  Optional values to pass into format msg
 * @return void
 */
function log(format, values, arg1, arg2) {
  if(LOGGING !== true) return;

  if(arguments.length == 0) {
    Logger.log(format);
  } else {
    Logger.log(format, values, arg1, arg2);
  }
}
