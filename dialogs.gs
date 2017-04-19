//*** All UI Dialogs for this add-on ***//

/* Dialog: Settings */

/**
 * @desc Jira Settings Dialog preprocessor
 */
function getDialog(file, values) {
  var template = HtmlService.createTemplateFromFile(file);
  
  Logger.log('Processing: %s.html with %s', file, JSON.stringify(values));
  
  for (var name in values) {
    template[name] = values[name];
  }
  
  return template.evaluate();
}

/**
 * @desc Jira Settings Dialog constructor
 */
function dialogSettings() {
  var dialog = getDialog('dialogSettings', getServerCfg());
  
  dialog
    .setWidth(300)
    .setHeight(280)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  
  Logger.log('Processed: %s', dialog);
    
  SpreadsheetApp.getUi().showModalDialog(dialog, 'Jira Server Settings');
}

/**
 * @desc Helper for our Settings Dialogs HTML.
 * @return {object} 
 */
function getServerCfg() {
  return {
    available: getCfg('available'),
    domain: getCfg('jira_domain'),
    username: getCfg('jira_username'),
    password: getCfg('jira_password')
  };
}

/**
 * @desc Save Jira server settings, provided in dialog form and perform 
 *     a connection test to Jira api.
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return {object} Object({status: [boolean], response: [string]})
 */
function saveSettings(jsonFormData) {
  setCfg('available', false);
  setCfg('jira_domain', jsonFormData.jira_domain);
  setCfg('jira_username', jsonFormData.jira_username);
  setCfg('jira_password', jsonFormData.jira_password);

  var test = testConnection();

  return {status: test.status, message: test.response};
}

/* Dialog: Settings - END */