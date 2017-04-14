/**
 * @desc Get current active sheet
 * @return {Sheet}
 */
function getTicketSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

/**
 * @desc Find valid Jira Ticket ID from cell value.
 *     Valid ticket id format: KEY-123
 * @param cellValue {string}
 * @return {string}    Returns Jira ticket ID if found or NULL
 */
function grepJiraTicketId(cellValue) {
  var ticketId = cellValue.match(/[A-Z]+\-\d+/);
  return (ticketId==null ? null : ticketId[0]);
}

// const not available, but better solution needed
var CELLTYPE_EMPTY = -1;
var CELLTYPE_JIRAID = 10; // entire cell includes Jira ticket id only ("JIRA-123" or "JIRA-123 [Status]")
var CELLTYPE_TEXT = 20;  // Jira ticket id is within text ("lorem ipsum JIRA-123 [Status] dolores")

/**
 * @desc More sufficiticated cell value analyzation. For multiple ways of ticket Ids within text.
 *       Checks the cell value and returns a object with information for type,value,ticketId and match parts.
 * @param cellValue {string}
 * @return {object}
 */
function grepJiraCell(cellValue) {
  var cellProps = {
    type: CELLTYPE_EMPTY,
    value: cellValue,
    ticketId: null,
    parts: []
  };
  
  if(cellValue.trim() == '') {
    return cellProps;
  }
  
  //@TODO: regexp requires lots of tweaking

  // match: "JIRA-123"
  match = cellValue.match(/^([A-Z]+\-\d+)$/);
  if(match && match.length == 2) {
    cellProps = {
      type: CELLTYPE_JIRAID,
      value: cellValue,
      ticketId: match[1],
      parts: match
    }
    return cellProps;
  }
  
  // match: "JIRA-123 [Status]"
  match = cellValue.match(/^([A-Z]+\-\d+)\s?(\[[\w\s]+\])$/);
  if(match && match.length == 3) {
    cellProps = {
      type: CELLTYPE_JIRAID,
      value: cellValue,
      ticketId: match[1],
      parts: match
    }
    return cellProps;
  }
  
  // match: "lorem ipsum JIRA-123 [Status] dolores"
  match = reverse(cellValue).match(/(.*)((\][\w\s]+\[)\s?(\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})))(.*)/);
  if(match && match.length == 6) {
    // remove status part
    cellValue = cellValue.replace(' ' + reverse(match[3]), '').trim();
    cellProps = {
      type: CELLTYPE_TEXT,
      value: cellValue,
      ticketId: reverse(match[4]),
      parts: match
    }
    return cellProps;
  }
  
  // match: "lorem ipsum JIRA-123 dolores"
  match = reverse(cellValue).match(/(\d+-[A-Z]+(?!-?[a-zA-Z]{1,10}))(.*)/);
  if(match && match.length == 3) {
    cellProps = {
      type: CELLTYPE_TEXT,
      value: cellValue,
      ticketId: reverse(match[1]),
      parts: match
    }
    return cellProps;
  }
  
  return cellProps;
  
/* Debug Info
IN: IT-123
OUT: {"type":10,"value":"IT-123","ticketId":"IT-123","parts":["IT-123","IT-123"]}
----------------------------------
IN: IT-123 [Status]
OUT: {"type":10,"value":"IT-123 [Status]","ticketId":"IT-123","parts":["IT-123 [Status]","IT-123","[Status]"]}
----------------------------------
IN: Lorem ispum IT-123
OUT: {"type":20,"value":"Lorem ispum IT-123","ticketId":"IT-123","parts":["321-TI mupsi meroL","321-TI"," mupsi meroL"]}
----------------------------------
IN: Lorem ispum IT-123 dolores
OUT: {"type":20,"value":"Lorem ispum IT-123 dolores","ticketId":"IT-123","parts":["321-TI mupsi meroL","321-TI"," mupsi meroL"]}
----------------------------------
IN: Lorem ispum IT-123 [Status]
OUT: {"type":20,"value":"Lorem ispum IT-123","ticketId":"IT-123","parts":["]sutatS[ 321-TI mupsi meroL","","]sutatS[ 321-TI","]sutatS[","321-TI"," mupsi meroL"]}
----------------------------------
IN: Lorem ispum IT-123 [Status] dolores
OUT: {"type":20,"value":"Lorem ispum IT-123 dolores","ticketId":"IT-123","parts":["serolod ]sutatS[ 321-TI mupsi meroL","serolod ","]sutatS[ 321-TI","]sutatS[","321-TI"," mupsi meroL"]}
----------------------------------
*/
}

/**
 * @desc Helper to simplify Jira's status field response. 
 *     Less IF/ELSE and property scopes needed.
 * @param fields {Object}  JSON objec from Jira response attribute 'fields'
 * @return {Object} Object({name:[string], color:[string]})
 */
function getIssueStatus(fields) {
  var o = {
    'name': 'n/a',
    'color': ''
  };

  try {
    o.name = fields.status.name;
    o.color = fields.status.statusCategory.colorName;
  } catch (e) {}

  return o;
}
