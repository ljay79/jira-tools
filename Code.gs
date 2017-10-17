/**
 * @author Jens Rosemeier <github@jens79.de>
 * @github  https://github.com/ljay79/jira-tools
 * @copyright Jens Rosemeier, 2017
 *
 * ToDo/Notes:
 * - use google auth with token based Jira RESTful API vs. cleartext password
 */

var BUILD = 0191;
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
    
    .addSeparator()
    .addItem('List Issues from Filter', 'dialogIssueFromFilter')
    .addItem('Create Time Report', 'dialogTimesheet')

    .addSeparator()
    .addItem('Settings', 'dialogSettings')
    .addItem('Configure Custom Fields', 'dialogCustomFields')
    .addItem('About', 'dialogAbout')
  
    .addToUi();
}

/**
 * @desc Simple Logger.log wrapper for centralized enabling/disabling log messages
 *       For console.log see: https://developers.google.com/apps-script/reference/base/console
 * @param format  A Format or message to log
 * @param values  Optional values to pass into format msg
 * @return void
 */
function log(format, values, arg1, arg2, arg3) {
  if(LOGGING !== true) return;

  if(arguments.length == 0) {
    Logger.log(format);
  } else {
    Logger.log(format, values, arg1, arg2, arg3);
  }
}
