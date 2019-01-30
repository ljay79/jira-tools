// Node required code block
const BUILD = require("./Code.gs").BUILD;
const fieldEpic = require("./customFields.gs").fieldEpic;
const Storage_ = require("./Storage.gs").Storage_;

//Mock for google's PropertiesService
const PropertiesService = function() {
  var data = {};
  var userProperties = {
    getProperty: function (key) {
      return data[key];
    },
    setProperty: function (key, value) {
      data[key] = value;
    }
  }

  return {
    getUserProperties: function() {
      return userProperties;
    }
  }
}();
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

function setCfg(key, value) {
  var keyname = 'serverConfig.' + key;
  Storage.setValue(keyname, value);
  return this;
}

/**
 * @desc Short Helper to get a server config property from users storage
 * @param key {string}
 * @return {string}||NULL
 */
function getCfg(key) {
  var keyname = 'serverConfig.' + key;
  return Storage.getValue(keyname);
}

/**
 * @desc Helper to check if server settings are available
 * @param alert {boolean}  TRUE=prompts a Browser message box, FALSE=returns boolean
 * @return {boolean}
 */
function hasSettings(alert) {
  initDefaults();

  var available = getCfg('available');
  var url = getCfg('jira_url');
  var username = getCfg('jira_username');
  var password = getCfg('jira_password');

  if(available === undefined || !username || !password || !url) {
    if(alert) Browser.msgBox("Jira Error", 
                   "Please configure the Jira Settings first!\\n\\n" +
                   '"Add-ons -> Jira Sheet Tools -> Settings"', Browser.Buttons.OK);
    return false;
  }

  /*
   * backwards compatibility <0.12.0 jira url http vs https
   * Until v0.12.0 we expected settings for Jira domain/url to be domain name only
   * and assumed its always running under https .
   * Now we have user enter full url including the scheme in case he wants to use http:// over https:// .
   */
  if( url.indexOf('http') != 0 ) { //catched both 'http' and 'https' at beginning of url
    // old var, need to attached https as default scheme
    url = 'https://' + url;
    setCfg('jira_url', url);
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
  var build         = Storage.getValue('BUILD') || 0;
  var isInitialized = Storage.getValue('defaults_initialized') || 'false';
  if (isInitialized == 'true' && build == BUILD) return;

  Storage.setValue('BUILD', BUILD);

  var _tmp = Storage.getValue('jst_epic');
  if (_tmp == null || _tmp.usable === false) 
    Storage.setValue('jst_epic', fieldEpic);

  if (null == Storage.getValue('workhours'))
    Storage.setValue('workhours', 8);

  if (null == Storage.getValue('dspuseras_name'))
    Storage.setValue('dspuseras_name', 1);

  if (null == Storage.getValue('dspdurationas'))
    Storage.setValue('dspdurationas', "w");

  // Jira onDemand or Server
  var server_type = getCfg('server_type');
  if (server_type == null) server_type = 'onDemand';
  setCfg('server_type', server_type);

  // set done
  Storage.setValue('defaults_initialized', 'true');
}

/**
 * @desc Save Jira server settings, provided in dialog form and perform 
 *     a connection test to Jira api.
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return {object} Object({status: [boolean], response: [string]})
 */
function saveSettings(jsonFormData) {
  var url = trimChar(jsonFormData.jira_url, "/");
  setCfg('available', false);
  setCfg('jira_url', url);
  setCfg('jira_username', jsonFormData.jira_username);
  setCfg('jira_password', jsonFormData.jira_password);
  Storage.setValue('workhours', jsonFormData.ts_workhours);
  Storage.setValue('dspuseras_name', parseInt(jsonFormData.ts_dspuseras_name));
  Storage.setValue('dspdurationas', jsonFormData.ts_dspdurationas);

  var test = testConnection();

  if (url.indexOf('atlassian.net') == -1) {
    setCfg('server_type', 'server');
  }

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
  getCfg: getCfg,
  setCfg: setCfg,
  hasSettings: hasSettings
}
// End of Node required code block
