/**
 * Fetch EPIC label from Jira instance for a given Jira Issue Key of type EPIC.
 *
 * @param {"JST-123"} TicketId    A well-formed Jira EPIC Ticket Id / Key.
 * @return {String}    Epic label
 * @customfunction
 */
function JST_EPICLABEL(TicketId) {
  var request   = new Request();
  var response  = {};
  var epicField = getVar('jst_epic');

  if(TicketId == '') {
    throw new Error("{TicketId} can not be empty.");
  }

  if(undefined == epicField || epicField.usable === false || epicField.label_key == null) {
    throw new Error("Please configure your Jira Epic field first. Go to 'Jira Sheet Tools' -> 'Configure Custom Fields'");
  }

  response = request.call('issueStatus', {
    issueIdOrKey: TicketId, 
    fields: [
      'summary',
      epicField.label_key
    ]
  }).getResponse();

  if(response.statusCode === 200 && response.respData && response.respData.fields) {
    var value = response.respData.fields[epicField.label_key];
    if ( value === undefined || value == '') value = TicketId;
    return value;
  } else {
    throw new Error("Jira Error: " + response.respData.errorMessages.join(","));
  }
}
