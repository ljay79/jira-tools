/**
 * @desc Helper to check if server settings are available
 * @param alert {boolean}  TRUE=prompts a Browser message box, FALSE=returns boolean
 * @return {boolean}
 */
function hasSettings(alert) {
  var available = getCfg('available');
  var domain = getCfg('jira_domain');
  var username = getCfg('jira_username');
  var password = getCfg('jira_password');

  if(available === undefined || !username || !password || !domain) {
    if(alert) Browser.msgBox("Jira Error", 
                   "Please configure the Jira Settings first!\\n\\n" +
                   '"Jira -> Settings"', Browser.Buttons.OK);
    return false;
  }
  
  return true;
}

/**
 * @desc Short Helper to set a server config property into users storage
 * @param key {string}
 * @param value {string}
 * @return {this}  Allow chaining
 */
function setCfg(key, value) {
  userProps.setProperty('serverConfig.' + key, value);
  return this;
}

/**
 * @desc Short Helper to get a server config property from users storage
 * @param key {string}
 * @return {string}||NULL
 */
function getCfg(key) {
  return userProps.getProperty('serverConfig.' + key);
}
