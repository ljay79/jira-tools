
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
      //var status = getIssueStatus(responseData.fields);
      var status = unifyIssueAttrib('status', responseData);
      // dependent cell value update
      switch(jiraCell.type) {
        case CELLTYPE_JIRAID:
          var link = '=HYPERLINK("' + getCfg('jira_url') + '/browse/' + jiraCell.ticketId + '";"' + jiraCell.ticketId + ' [' + status.value + ']")';
          rows.getCell(rowIdx, colIdx).setValue(link);
          break;

        case CELLTYPE_TEXT:
        default:
          var newValue = jiraCell.ticketId + ' [' + status.value + ']';
          newValue = jiraCell.value.replace(jiraCell.ticketId, newValue);
          rows.getCell(rowIdx, colIdx).setValue(newValue);
          break;
      }
      
      SpreadsheetApp.flush();

    } else {
      // Something funky is up with the JSON response.
      debug.error("Failed to retrieve ticket data for ID [" + jiraCell.ticketId + "]! responseData:%s; httpResponse:%s; statusCode:%s", responseData, httpResponse, statusCode);
    }
  };

  var error = function(responseData, httpResponse, statusCode) {
    if( statusCode == 404 ) {
      rows.getCell(rowIdx, colIdx).setNote("This Jira ticket does not exist on " + getCfg('jira_url'));
    } else {
      // Jira returns all errors that occured in an array (if using the application/json mime type)
      rows.getCell(rowIdx, colIdx).setNote("Jira Error: " + responseData.errorMessages.join(","));
    }
  };

  var request = new Request(), cellVal = '';

  for (var r=0; r<values.length; r++) {
    rowIdx = r + 1;
    for (var c=0; c<values[r].length; c++) {
      colIdx = c + 1;
      cellVal = values[r][c];

      if( cellVal.length < 3 || typeof cellVal !== 'string' || null === cellVal.match(/[a-zA-Z\w]/) )
        continue;

      jiraCell = grepJiraCell(cellVal);
      if(jiraCell.type == CELLTYPE_EMPTY || jiraCell.ticketId === null) continue;

      request.call(method, {issueIdOrKey: jiraCell.ticketId})
        .withSuccessHandler(ok)
        .withFailureHandler(error);
      }
  }
}
