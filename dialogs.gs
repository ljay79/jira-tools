//*** All UI Dialogs for this add-on ***//

/**
 * @desc Jira Settings Dialog preprocessor
 * @param file {string}  Filename
 * @param values {object}
 * @return {HtmlOutput}
 */
function getDialog(file, values) {
  var template = HtmlService.createTemplateFromFile(file);

  log('Processing: %s.html with %s', file, JSON.stringify(values));

  for (var name in values) {
    template[name] = values[name];
  }
  
  return template.evaluate();
}

/* Dialog: Settings */

/**
 * @desc Jira Settings Dialog constructor
 */
function dialogSettings() {
  var dialog = getDialog('dialogSettings', getServerCfg());

  dialog
    .setWidth(340)
    .setHeight(400)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Jira Server Settings');
}

/**
 * @desc Helper for our Settings Dialogs HTML.
 * @return {object} 
 */
function getServerCfg() {
  return {
    available: getCfg('available'),
    url: getCfg('jira_url'),
    username: getCfg('jira_username'),
    password: getCfg('jira_password'),
    workhours: getVar('workhours')
  };
}

/* Dialog: Settings - END */

/**
 * @desc Fetch all Jira Issue IDs from active sheet and update their status.
 *     Example: Cell with value "TIS-123" becomes "TIS-123 [Done]". 
 *     Status msg in brackets gets updated.
 * @return void
 */
function dialogRefreshTicketsIds() {
  if(!hasSettings(true)) return;
  
  refreshTickets();
}

/* Dialog: Import Issues */

/**
 * @desc Dialog to choose issues filter
 */
function dialogIssueFromFilter() {
  if(!hasSettings(true)) return;

  var dialog = getDialog('dialogIssuesFromFilter', {
    columns: ISSUE_COLUMNS,
    defaultColumns: JSON.parse(getVar('jiraColumnDefault'))
  });

  dialog
    .setWidth(600)
    .setHeight(480)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'List Jira issues from filter');
}

/**
 * @desc Form handler for dialogIssuesFromFilter. Retrieve issues for given 
 *       filter with specified columns from Jira and insert into current active sheet.
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return {object} Object({status: [boolean], response: [string]})
 */
function insertIssuesFromFilter(jsonFormData) {
  jsonFormData = jsonFormData || {filter_id: 0};
  var filter = getFilter( parseInt(jsonFormData.filter_id) ),
      response = {status: false, message: ''};

  var ok = function(responseData, httpResponse, statusCode){
    // Check the data is valid and the Jira fields exist
    if(responseData) {
      // any issues in result?
      if(!responseData.hasOwnProperty('issues') || responseData.issues.length == 0) {
        response.message = "No issues were found to match your search.";
        Browser.msgBox(response.message, Browser.Buttons.OK);
        return;
      }

      var sheet = getTicketSheet();
      var cell = sheet.getActiveCell();

      var table = new IssueTable(sheet, cell, responseData);
      table.addHeader()
        .addSummary(filter.name)
        .fillTable();
      
      response.status = true;

    } else {
      // Something funky is up with the JSON response.
      response.message = "Failed to retrieve jira issues!";
      Browser.msgBox(response.message, Browser.Buttons.OK);
    }
  };

  var error = function(responseData, httpResponse, statusCode) {
    response.message = "Failed to retrieve jira issues from filter with status [" + statusCode + "]!\\n"
      + responseData.errorMessages.join("\\n");
    Browser.msgBox(response.message, Browser.Buttons.OK);
  };

  var data = {
    jql: filter.jql, 
    fields: jsonFormData['columns'] || [], 
    maxResults: LIST_ISSUES_MAX_RESULT, 
    validateQuery: (getCfg('server_type') == 'onDemand') ? 'strict' : true
  };

  var request = new Request();
  request.call('search', data, {'method' : 'post'})
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return response;
}

/* Dialog: Import Issues - END */

/* Dialog: About */

/**
 * @desc Dialog "About"
 */
function dialogAbout() {
  var dialog = getDialog('dialogAbout');

  dialog
    .setWidth(480)
    .setHeight(320)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'About');
}

/* Dialog: About - END */


/* Dialog: Worklog */

/**
 * @desc Dialog to create worklog based on user/group selection
 */
function dialogTimesheet() {
  if(!hasSettings(true)) return;

  var dialog = getDialog('dialogTimesheet');

  dialog
    .setWidth(480)
    .setHeight(400)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Create worklog');
}

/* Dialog: Worklog - END */
