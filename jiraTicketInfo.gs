/**
 * @desc Fetch all Jira Issue IDs from active sheet and update their status.
 *     Example: Cell with value "TIS-123" becomes "TIS-123 [Done]". 
 *     Status msg in brackets gets updated.
 * @return void
 */
function refreshTicketsIds() {
  if(!hasSettings(true)) return;
  
  refreshTickets();
}

/**
 * Make a request to jira for all listed tickets, and update the spreadsheet 
 */
function refreshTickets() {
  var method = "issueStatus";

  // Pull the bits and pieces you need from the spreadsheet
  var sheet = getTicketSheet();
  var rows = sheet.getDataRange();
  var values = rows.getValues();
  var jiraCell, rowIdx = 0, colIdx = 0;

  // Show the user a friendly message
  Browser.msgBox("Jira Tickets",
                 "Updating all Jira tickets in this sheet.\\nDepending on amount of data in this sheet, the process may take a while.", 
                 Browser.Buttons.OK);

  var ok = function(responseData, httpResponse, statusCode){
    // Check the data is valid and the Jira fields exist
    if(responseData && responseData.fields) {
      var status = getIssueStatus(responseData.fields);
      // dependent cell value update
      switch(jiraCell.type) {
        case CELLTYPE_JIRAID:
          var link = '=HYPERLINK("https://' + getCfg('jira_domain') + '/browse/' + jiraCell.ticketId + '";"' + jiraCell.ticketId + ' [' + status.name + ']")';
          rows.getCell(rowIdx, colIdx).setValue(link);
          break;

        case CELLTYPE_TEXT:
        default:
          var newValue = jiraCell.ticketId + ' [' + status.name + ']';
          newValue = jiraCell.value.replace(jiraCell.ticketId, newValue);
          rows.getCell(rowIdx, colIdx).setValue(newValue);
          break;
      }
    } else {
      // Something funky is up with the JSON response.
      Logger.log(rowIdx, "Failed to retrieve ticket data for ID [" + jiraCell.ticketId + "]!");
    }
  };

  var error = function(responseData, httpResponse, statusCode) {
    if( statusCode == 404 ) {
      rows.getCell(rowIdx, colIdx).setNote("This Jira ticket does not exist on https://" + getCfg('jira_domain'));
    } else {
      // Jira returns all errors that occured in an array (if using the application/json mime type)
      rows.getCell(rowIdx, colIdx).setNote("Jira Error: " + responseData.errorMessages.join(","));
    }
  };

  var request = new Request();

  for (var r=0; r<values.length; r++) {
    rowIdx = r + 1;
    for (var c=0; c<values[r].length; c++) {
      colIdx = c + 1;
      jiraCell = grepJiraCell(values[r][c]);
      if(jiraCell.type == CELLTYPE_EMPTY || jiraCell.ticketId === null) continue;

      request.call('issueStatus', {issueIdOrKey: jiraCell.ticketId})
        .withSuccessHandler(ok)
        .withFailureHandler(error);
      }
  }
}
