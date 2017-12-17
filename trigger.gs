/**
 * @desc Check if given trigger state is currently running or not.
 *       TRUE = is running, FALSE = not running
 * @param fName {String}    Triggers function name
 * @return {Boolean}
 */
function checkTriggerState(fName) {
  var triggerStateName = 'trigger_state_' + fName;
  var state = getVar(triggerStateName) || false;
  
  return state;
}

/**
 * @desc Setting the running state of a trigger
 * @param fName {String}    Trigger function name
 * @param state {Boolean}    True=running, False=not running/finished
 * @return VOID
 */
function setTriggerState(fName, state) {
  var triggerStateName = 'trigger_state_' + fName;
  setVar(triggerStateName, state);
}


/**
 * @desc Adding a new trigger for epic cells. Only 2 time-based triggers of this kind allowed at same time.
 *
 * @param key {String}    Jira issue key to convert to epic
 * @param rowIdx {Integer}    Num of row (for x/y coordinates in sheet)
 * @param colIdx {Integer}    Num of column (for x/y coordinates in sheet)
 * @return VOID
 */
function addTriggerEpicCell(key, rowIdx, colIdx) {
  var triggerName = 'trigger_epicCell';
  var timeAfter   = 1000 * 2; // 2sec default
  var epicCells   = getVar('bucket_epicCells') || [];

  epicCells.push({s: getTicketSheet().getName(), k: key, r: rowIdx, c:colIdx});
  setVar('bucket_epicCells', epicCells);

  // prevent too many triggers
  var triggers = ScriptApp.getProjectTriggers();
  var count    = 0;
  for (var i = 0; i < triggers.length; i++) {
    // keep only 2 of these triggers at same time, set 2nd one to +30sec
    if (triggerName == triggers[i].getHandlerFunction() && ++count >= 2) {
      ScriptApp.deleteTrigger(triggers[i]);
      timeAfter = 1000 * 30; // 30sec
      break;
    }
  }

  // set time based trigger
  ScriptApp.newTrigger(triggerName)
    .timeBased()
    .after(timeAfter)
    .create();
}

/**
 * Clear all time based triggers. Best to call onOpen()
 */
function clearTimeTriggers(byHandlerName) {
  var handlersToClear = (byHandlerName != null) ? [byHandlerName] : ['trigger_epicCell'];
  var triggers = ScriptApp.getProjectTriggers();

  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getEventType() == ScriptApp.EventType.CLOCK && handlersToClear.indexOf(triggers[i].getHandlerFunction()) > -1) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}


/* ------------------------------------------------------ */


// runtime storage for all fetched epic data, prevent redundant api calls to retrieve epic info
var TRIGGER_BUCKET_EPIC = [];

/**
 * @desc Time-based trigger to convert epic cell content from Jira issue key into Epic label/name with link.
 * @return VOID
 */
function trigger_epicCell() {
  debug.log('===trigger_epicCell()===');
  var triggerName = 'trigger_epicCell';

  if( true === checkTriggerState(triggerName) ) {
    debug.log('Triggered function "'+triggerName+'" currently running, skipping this instance ...');
    return;
  }

  setTriggerState(triggerName, true); // flag triggered FN as state running

  // get epic cells stored in storage
  var bucket = getVar('bucket_epicCells') || [];

  // sort by issue key
  /*bucket.sort(function(a, b) {
    if (a.k < b.k)
      return -1;
    if (a.k > b.k)
      return 1;
    return 0;
  });*/ // not necessary with TRIGGER_BUCKET_EPIC storage

  if (bucket.length === 0 ) {
    // bucket is empty - nothing to do, so we can clear all such triggers (old and current ones)
    clearTimeTriggers(triggerName);
  }

  while(bucket.length > 0) {
    var bucketValue = bucket.shift();
    setVar('bucket_epicCells', bucket);

    // logic to convert current epic cell
    try {
      convertEpicCell(bucketValue.s, bucketValue.k, bucketValue.r, bucketValue.c);
    } catch(e) {
      debug.error("Catched error:\n%s\nFile: %s\nLine:%s", e.message, e.fileName, e.lineNumber);
    }

    bucket = getVar('bucket_epicCells') || [];
  }

  // set state as finished
  setTriggerState(triggerName, false);
}

/**
 * @desc Convert a sheet cell into Jira Epic data cell. Fetching epic info from api.
 * @param sheetName {String}    Sheetname cell coord refers to
 * @param key {String}    Jira issue key to convert to epic
 * @param rowIdx {Integer}    Num of row (for x/y coordinates in sheet)
 * @param colIdx {Integer}    Num of column (for x/y coordinates in sheet)
 * @return VOID
 */
function convertEpicCell(sheetName, key, rowIdx, colIdx) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (sheet == null) sheet = getTicketSheet();

  var request   = new Request();
  var cell      = sheet.getRange(rowIdx, colIdx);
  var jiraCell  = grepJiraCell(cell.getValue());
  var epicField = getVar('jst_epic');

  if(jiraCell.type !== CELLTYPE_JIRAID) {
    debug.error('Unable to convert EPIC cell value "%s" of type "%s"', jiraCell.value, jiraCell.type);
    return;
  }

  if(TRIGGER_BUCKET_EPIC[jiraCell.value]) {
    cell.setValue( TRIGGER_BUCKET_EPIC[jiraCell.value] );
    return; // done
  }
  
  var onSuccess = function(resData, httpResp, status) {
    if(resData && resData.fields) {
      var link = '=HYPERLINK("' + getCfg('jira_url') + '/browse/' + resData.key + '";"' + resData.fields[epicField.label_key] + '")';
      cell.setValue(link);
      TRIGGER_BUCKET_EPIC[resData.key] = link;
    }
  };

  var reqData = {
    issueIdOrKey: jiraCell.ticketId, 
    fields: [
      'summary',
      epicField.label_key
    ]
  };

  request.call('issueStatus', reqData)
    .withSuccessHandler(onSuccess);
}


/*
function test() {
  setTriggerState('trigger_epicCell', false);
  clearTimeTriggers('trigger_epicCell');

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  SpreadsheetApp.setActiveSheet(ss.getSheets()[3]);

  addTriggerEpicCell('DYH-1433', 3, 9);
  addTriggerEpicCell('DYH-1433', 4, 9);

  // set time based trigger
  ScriptApp.newTrigger("trigger_epicCell")
    .timeBased()
    .after(1000)
    .create();
}
*/
