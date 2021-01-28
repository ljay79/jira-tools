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

    var sidebar = getDialog('views/sidebar/settings', getAddonConfig_());

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

    var _uname = '',
        _pwd = '';

    switch(jsonFormData.authtype) {
        case 'autht1': // username + password
            _uname = jsonFormData.at1_username || '';
            _pwd = jsonFormData.at1_password || '';
            break;
        case 'autht2': // email + api token
        default:
            _uname = jsonFormData.at2_email || '';
            _pwd = jsonFormData.at2_password || '';
            break;
        case 'autht3': // personal access token
            _pwd = jsonFormData.at3_token || '';
            break;
    }

    var url = trimChar(jsonFormData.jira_url, "/");
    setCfg_('available', false);
    setCfg_('jira_url', url);
    setCfg_('authType', jsonFormData.authtype);
    setCfg_('jira_username', _uname);
    setCfg_('jira_password', _pwd);

    var test = this._testConnection(); // doesnt test authentification yet
    var _isServer = (url.indexOf('atlassian.net') == -1 || jsonFormData.authtype == 'autht3');
    setCfg_('server_type', _isServer ? 'server' : 'onDemand');

    // fetch user profile and save current users jira name and accountId
    var me = new MySelf();
    me.fetch();

    return {status: test.status, message: test.response};
  },

  /**
   * @desc Save Jira Add-on options/settings, provided in sidebar form
   * @param jsonFormData {object}  JSON Form object of all form values
   * @return {object} Object({status: [boolean], response: [string]})
   */
  callbackSaveOptions : function (jsonFormData) {
    debug.log(this.name + '.callbackSaveOptions(%s)', JSON.stringify(jsonFormData));

    setCfg_('custom_fn_enabled', (jsonFormData.custom_fn_enabled == 'on') ? 1 : 0);
    UserStorage.setValue('workhours', jsonFormData.ts_workhours);
    UserStorage.setValue('dspdurationas', jsonFormData.ts_dspdurationas);
    UserStorage.setValue('issue_update_comment', (jsonFormData.issue_update_comment == 'on') ? 1 : 0);

    return {status: true, message: 'Options successfully saved.'};
  },
  
  /**
   * @desc Test JIRA API connection with provided settings.
   * @TODO Doesnt test authentification yet
   * @return {object}  Object({status:[boolean], response:[string]})
   */
  _testConnection: function() {
    var req = new Request, response;

    var ok = function(responseData, httpResponse, statusCode) {
      response = 'Connection successfully established.';
      debug.log('%s to server [%s] %s', response, getCfg_('server_type'), getCfg_('jira_url'));
      setCfg_('available', true);
    };

    var error = function(responseData, httpResponse, statusCode) {
      response = 'Could not connect to Jira Server!';
      response += httpErrorCodes[statusCode] ? '\n ('+statusCode+') ' + httpErrorCodes[statusCode] : '('+statusCode+')';
      debug.warn('Server [%s] %s; Response: %s', getCfg_('server_type'), getCfg_('jira_url'), response);
      setCfg_('available', false);
    };

    req.call('dashboard')
      .withSuccessHandler(ok)
      .withFailureHandler(error);

    return {status: (getCfg_('available')==true), response: response};
  }

}

// Node required code block
module.exports = {
  menuSettings : menuSettings,
  callbackSettings_saveAccess: callbackSettings_saveAccess,
  callbackSettings_saveOptions: callbackSettings_saveOptions,
  Settings_Controller_ : Settings_Controller_
}
// End of Node required code block