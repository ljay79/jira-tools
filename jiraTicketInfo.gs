/**
 * Refresh all Jira tables in the current sheet
 */
function refreshTickets() {
  var method = "issueStatus";

  // Pull the bits and pieces you need from the spreadsheet
  var sheet = getTicketSheet();
  var datarange = sheet.getDataRange();
  var notes = datarange.getNotes();

  for (var i in notes) {
    for (var j in notes[i]) {
      if (j != "fill" && notes[i][j]) {
        if (notes[i][j].indexOf("[jira-tools]") == 0) {
          Logger.log("notes[%s][%s] = %s", i, j, notes[i][j]);
          var markpos = notes[i][j].indexOf(">>>");
          if (markpos != -1) {
            jsonFormData = notes[i][j].slice(markpos + 3);
            var cell = datarange.getCell(parseInt(i)+1, parseInt(j)+1);
            sheet.setActiveRange(cell);
            insertIssuesFromFilter(JSON.parse(jsonFormData));
          } else {
            // FIXME: warn about a [jira-tools] note that's missing the >>> mark
          }
        }
      }
    }
  }
}
