/**
 * @file Contains controller class and sidebar/callback method for add-on settings.
 */

/**
 * @desc Wrapper: Sidebar for "Settings"
 */
function menuSettings() {
  Settings_Controller_.sidebar();
}

/**
 * Creates a new Settings_Controller_ object, controller for multiple actions.
 */
Settings_Controller_ = {
  name : 'Settings_Controller_',

  /**
   * @desc Menu called to open new sidebar dialog.
   */
  sidebar : function () {
    initDefaults();

    var sidebar = getDialog('views/sidebar/settings', getServerCfg());

    debug.log('Processed: %s', sidebar);

    var html = HtmlService.createHtmlOutput(sidebar.getContent())
      .setTitle('Settings')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    ;

    SpreadsheetApp.getUi().showSidebar(html);
  }

}

// Node required code block
module.exports = {
  menuSettings : menuSettings,
  Settings_Controller_ : Settings_Controller_
}
// End of Node required code block
