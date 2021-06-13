// Node required code block
const BUILD = require("./Code.gs").BUILD;
const Storage_ = require("./Storage.gs").Storage_;
const UserStorage = require("src/models/gas/UserStorage.gs");
const CustomFields = require("src/models/jira/CustomFields.gs");
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
  var authType = getCfg_('authType');

  if(available === undefined || !password || !url || (!username && authType != 'autht3')) {
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

  if (null == UserStorage.getValue('dspdurationas'))
    UserStorage.setValue('dspdurationas', "w");

  if (null == UserStorage.getValue('issue_update_comment'))
    UserStorage.setValue('issue_update_comment', 1);

  // Jira onDemand or Server
  var server_type = getCfg_('server_type');
  if (server_type == null) server_type = 'onDemand';
  setCfg_('server_type', server_type);

  // migrate from 1.4.4 to <
  var _cfields = UserStorage.getValue('favoriteCustomFields') || [];
  debug.info('Migrated custom fields from: %o', _cfields);
  CustomFields.save(_cfields);
  debug.info('Migrated custom fields to  : %o', CustomFields.load());

  // migrate from 1.4.6
  if (null == UserStorage.getValue('only_my_filters'))
    UserStorage.setValue('only_my_filters', 1);

  // migrate to 1.4.9
  var _authtype = getCfg_('authType');
  if (_authtype == null)
    setCfg_('authType', 'autht2');

  // set done
  UserStorage.setValue('defaults_initialized', 'true');
}

/**
 * @desc Helper for our Settings Dialogs HTML.
 * @return {object}
 */
function getAddonConfig_() {
  return {
    buildNumber: BUILD,
    available: getCfg_('available'),
    url: getCfg_('jira_url'),
    authType: getCfg_('authType') || 'auth1',
    username: getCfg_('jira_username'),
    password: getCfg_('jira_password'),
    custom_fn_enabled: getCfg_('custom_fn_enabled') || 0,
    workhours: UserStorage.getValue('workhours'),
    dspdurationas: UserStorage.getValue('dspdurationas'),
    issue_update_comment: UserStorage.getValue('issue_update_comment') || 0
  };
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
