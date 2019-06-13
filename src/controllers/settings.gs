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
 * @desc Wrapper: Settings callback handler for saving jira access settings
 * @return {object} Object({status: [boolean], tables: [object]})
 */
function callbackSettings_saveAccess(args) {
  return Settings_Controller_.callbackSaveAccess(args);
}

/**
 * @desc Wrapper: Settings callback handler for saving add-on options
 * @return {object} Object({status: [boolean], tables: [object]})
 */
function callbackSettings_saveOptions(args) {
  return Settings_Controller_.callbackSaveOptions(args);
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
    debug.log(this.name + '.sidebar()');
    initDefaults();

    var sidebar = getDialog('views/sidebar/settings', getServerCfg());

    debug.log('Processed: %s', sidebar);

    var html = HtmlService.createHtmlOutput(sidebar.getContent())
      .setTitle('Settings')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    ;

    SpreadsheetApp.getUi().showSidebar(html);
  },
  
  /**
   * @desc Save Jira access settings, provided in dialog form and perform 
   *     a connection test to Jira api.
   * @param jsonFormData {object}  JSON Form object of all form values
   * @return {object} Object({status: [boolean], response: [string]})
   */
  callbackSaveAccess : function (jsonFormData) {
    debug.log(this.name + '.callbackSaveSettings()');

    var url = trimChar(jsonFormData.jira_url, "/");
    setCfg_('available', false);
    setCfg_('jira_url', url);
    setCfg_('jira_username', jsonFormData.jira_username);
    setCfg_('jira_password', jsonFormData.jira_password);

    var test = testConnection(); // doesnt test authentification yet

    setCfg_('server_type', (url.indexOf('atlassian.net') == -1) ? 'server' : 'onDemand');

    return {status: test.status, message: test.response};
  },

  /**
   * @desc Save Jira Add-on options/settings, provided in sidebar form
   * @param jsonFormData {object}  JSON Form object of all form values
   * @return {object} Object({status: [boolean], response: [string]})
   */
  callbackSaveOptions : function (jsonFormData) {
    debug.log(this.name + '.callbackSaveOptions()');

    setCfg_('custom_fn_enabled', (jsonFormData.custom_fn_enabled == 'on') ? 1 : 0);
    UserStorage.setValue('workhours', jsonFormData.ts_workhours);
    UserStorage.setValue('dspuseras_name', parseInt(jsonFormData.ts_dspuseras_name));
    UserStorage.setValue('dspdurationas', jsonFormData.ts_dspdurationas);

    return {status: true, message: 'Options successfully saved.'};
  }

}

// Node required code block
module.exports = {
  menuSettings : menuSettings,
  Settings_Controller_ : Settings_Controller_
}
// End of Node required code block
