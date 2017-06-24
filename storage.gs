/**
 * @desc Helper to check if server settings are available
 * @param alert {boolean}  TRUE=prompts a Browser message box, FALSE=returns boolean
 * @return {boolean}
 */
function hasSettings(alert) {
  var available = getCfg('available');
  var url = getCfg('jira_url');
  var username = getCfg('jira_username');
  var password = getCfg('jira_password');

  var jiraColumnDefault = getCfg('jiraColumnDefault');
  if( jiraColumnDefault != null ) {
    jiraColumnDefault = JSON.parse(jiraColumnDefault);
  }
  setCfg('jiraColumnDefault', JSON.stringify(jiraColumnDefault));

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
 * @desc Short Helper to set a server config property into users storage
 * @param key {string}
 * @param value {string}
 * @return {this}  Allow chaining
 */
function setCfg(key, value) {
  var userProps = PropertiesService.getUserProperties();
  userProps.setProperty('serverConfig.' + key, value);
  return this;
}

/**
 * @desc Short Helper to get a server config property from users storage
 * @param key {string}
 * @return {string}||NULL
 */
function getCfg(key) {
  var userProps = PropertiesService.getUserProperties();
  return userProps.getProperty('serverConfig.' + key);
}

// default issue fields/columns for issue listings
var jiraColumnDefault = [
  'summary',
  'issuetype',
  'priority',
  'status',
  'updated',
  'assignee',
  'due'
];
