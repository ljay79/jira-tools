// Node required code block
const BUILD = require("./Code.gs").BUILD;
const Storage_ = require("./Storage.gs").Storage_;
const UserStorage = require("src/models/gas/UserStorage.gs");
// End of Node required code block


// default issue fields/columns for issue listings
var jiraColumnDefault = [
  'summary',
  'issuetype',
  'priority',
  'status',
  'updated',
  'assignee',
  'duedate',
  'project'
];

/**
 * @desc Short Helper to set a server config property into users storage
 * @param key {string}
 * @param value {string}
 * @return {this}  Allow chaining
 */

function setCfg_(key, value) {
  var keyname = 'serverConfig.' + key;
  UserStorage.setValue(keyname, value);
  return this;
}

/**
 * @desc Short Helper to get a server config property from users storage
 * @param key {string}
 * @return {string}||NULL
 */
function getCfg_(key) {
  var keyname = 'serverConfig.' + key;
  return UserStorage.getValue(keyname);
}

/**
 * @desc Helper to check if server settings are available
 * @param alert {boolean}  TRUE=prompts a Browser message box, FALSE=returns boolean
 * @return {boolean}
 */
function hasSettings(alert) {
  initDefaults();

  var available = getCfg_('available');
  var url = getCfg_('jira_url');
  var username = getCfg_('jira_username');
  var password = getCfg_('jira_password');

  if(available === undefined || !username || !password || !url) {
    if(alert) Browser.msgBox("Jira Error", 
                   "Please configure the Jira Settings first!\\n\\n" +
                   '"Add-ons -> Project Aid for Jira -> Settings"', Browser.Buttons.OK);
    return false;
  }

  return true;
}

/**
 * @desc  Storage init / setting defaults
 *        Google Guide states, we should not access property storage during onInstall or onOpen,
 *        So we have to do it somehow else, initializing some vars.
 *        Need better testing utilities or advice to improve this dirty workaround.
 *
 */
function initDefaults() {
  var build         = UserStorage.getValue('BUILD') || 0;
  var isInitialized = UserStorage.getValue('defaults_initialized') || 'false';
  if (isInitialized == 'true' && build == BUILD) return;

  UserStorage.setValue('BUILD', BUILD);

  if (null == UserStorage.getValue('workhours'))
    UserStorage.setValue('workhours', 8);

  if (null == UserStorage.getValue('dspuseras_name'))
    UserStorage.setValue('dspuseras_name', 1);

  if (null == UserStorage.getValue('dspdurationas'))
    UserStorage.setValue('dspdurationas', "w");

  // Jira onDemand or Server
  var server_type = getCfg_('server_type');
  if (server_type == null) server_type = 'onDemand';
  setCfg_('server_type', server_type);

  // set done
  UserStorage.setValue('defaults_initialized', 'true');
}

/**
 * @desc Helper for our Settings Dialogs HTML.
 * @return {object} 
 */
function getServerCfg() {
  return {
    buildNumber: BUILD,
    available: getCfg_('available'),
    url: getCfg_('jira_url'),
    username: getCfg_('jira_username'),
    password: getCfg_('jira_password'),
    custom_fn_enabled: getCfg_('custom_fn_enabled') || 0,
    workhours: UserStorage.getValue('workhours'),
    dspuseras_name: UserStorage.getValue('dspuseras_name'),
    dspdurationas: UserStorage.getValue('dspdurationas')
  };
}


/**
 * @desc Save Jira server settings, provided in dialog form and perform 
 *     a connection test to Jira api.
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return {object} Object({status: [boolean], response: [string]})
 */
function saveSettings(jsonFormData) {
  var url = trimChar(jsonFormData.jira_url, "/");
  setCfg_('available', false);
  setCfg_('jira_url', url);
  setCfg_('jira_username', jsonFormData.jira_username);
  setCfg_('jira_password', jsonFormData.jira_password);
  setCfg_('custom_fn_enabled', (jsonFormData.custom_fn_enabled == 'on') ? 1 : 0);
  UserStorage.setValue('workhours', jsonFormData.ts_workhours);
  UserStorage.setValue('dspuseras_name', parseInt(jsonFormData.ts_dspuseras_name));
  UserStorage.setValue('dspdurationas', jsonFormData.ts_dspdurationas);

  var test = testConnection();

  setCfg_('server_type', (url.indexOf('atlassian.net') == -1) ? 'server' : 'onDemand');

  return {status: test.status, message: test.response};
}

/**
 * Delete entire user properties - for testing only
 */
function deleteAllProperties_()
{
  // Delete all user properties in the current script.
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
}


// Node required code block
module.exports = {
  getCfg_: getCfg_,
  setCfg_: setCfg_,
  hasSettings: hasSettings
}
// End of Node required code block
