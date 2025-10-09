/**
 * @file Contains controller class and dialog/callback method for inserting issue tables from jira filter.
 */

/**
 * @desc Wrapper: Dialog to choose issues filter
 */
function menuInsertIssueFromFilter() {
  InsertIssueTable_Controller_.dialogOpen();
}

/**
 * @desc Wrapper: Dialog callback handler
 * @return {object} Object({status: [boolean], response: [string]})
 */
function callbackInsertIssueFromFilter(jsonFormData) {
  return InsertIssueTable_Controller_.callbackInsertFromFilter(jsonFormData);
}

/**
 * @desc Dialog callback handler
 * @param {integer} enabled
 * @return void
 */
function callbackUpdateCfgMyFilter(enabled) {
  debug.log('callbackUpdateCfgMyFilter(%s)', (0+enabled));
  UserStorage.setValue('only_my_filters', 0 + enabled);
}

/**
 * @TODO: requires refactoring for new api pagination scheme "nextPageToken"
 * Creates a new IssueTableIndex_ object, which is used to persist IssueTables and related information.
 */
InsertIssueTable_Controller_ = {
  name : 'InsertIssueTable_Controller_',

  /**
   * @desc Dialog to configure Jira custom fields
   */
  dialogOpen : function () {
    debug.log(this.name + '.dialog()');

    if (!hasSettings(true))
      return;

    // prune table and check if user tries to overwrite/overlap with an existing IssueTable
    IssueTableIndex_.prune();
    if (true === this.hasOverlappingTable(true) ) {
      // will show warning/alter and skip opening the dialog
      return;
    }

    var customFields = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_SEARCH);
    var userColumns = UserStorage.getValue('userColumns') || [];
    var only_my_filters = UserStorage.getValue('only_my_filters');
    var dialog = getDialog('views/dialogs/insertIssueFromFilter', {
      columns : IssueFields.getBuiltInJiraFields(),
      customFields : customFields,
      userColumns : userColumns.length > 0 ? userColumns : jiraColumnDefault,
      only_my_filters: only_my_filters,
      server_type: getCfg_('server_type')
    });

    // try to adjust height depending on amount of jira fields to show
    var rowH = 32;
    var height = 424;
    height += (Math.ceil(Object.keys(IssueFields.getBuiltInJiraFields()).length % 4) * rowH);
    height += (Math.ceil(Object.keys(customFields).length % 4) * rowH);

    dialog
      .setWidth(600)
      .setHeight(height)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);

    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'List Jira issues from filter');
  },

  /**
   * @desc Form handler for dialogIssuesFromFilter. Retrieve issues for given filter with specified columns from Jira and insert into
   *       current active sheet.
   * @param jsonFormData {object} JSON Form object of all form values
   * @return {object} Object({status: [boolean], response: [string]})
   */
  callbackInsertFromFilter : function (jsonFormData) {
    debug.log(this.name + '.callbackInsertFromFilter() <= %s', JSON.stringify(jsonFormData));

    jsonFormData = jsonFormData || {filter_id: 0};
    var that = this,
        startAt = parseInt(jsonFormData['startAt']) || 0,
        columns = jsonFormData['columns'] || jiraColumnDefault,
        response = {status: false, message: ''};

    var attributes = {
      filter : jsonFormData['filter_id'] ? getFilter(parseInt(jsonFormData['filter_id'])) : {},
      maxResults : parseInt(jsonFormData['maxResults']) || 10000,
      issues : {},
      columns : columns,
      sheet : getTicketSheet(),
      renderer : IssueTableRendererDefault_
    };

    UserStorage.setValue('userColumns', attributes.columns); // store for re-use by user

    var ok = function (resp, status, errorMessage) {
      debug.log(that.name + '.ok() resp(len): %s; s: %s; msg: %s', resp.data.length, status, errorMessage);

      if (status !== 200) {
        // Something funky is up with the JSON response.
        response.message = "Failed to retrieve jira issues!";
        Browser.msgBox(response.message, Browser.Buttons.OK);
      } else if (resp.data.length === 0) {
        // any issues in result?
        response.message = "No issues were found to match your search.";
        Browser.msgBox(response.message, Browser.Buttons.OK);

        return;
      } else {
        attributes.issues = resp.data;

        var renderer, Table = new IssueTable_(attributes);
        if (renderer = Table.render()) {
          // toast with status message
          var msg = "Finished inserting " + renderer.getInfo().totalInserted + " Jira issues out of " + resp.totalFoundRecords
              + " total found records.";
          SpreadsheetApp.getActiveSpreadsheet().toast(msg, "Status", 10);
          debug.log(msg);

          // add table to index
          IssueTableIndex_.addTable(Table);

          response.status = true;

          // set trigger for index cleanup and modification detection
          that.setTriggerPruneIndex();
          that.setTriggerIssueTableModification();
          
          // force sidebar update (refreshTableSchedule)
          UserStorage.setValue('refreshIssueTableforceSidebarReset', true);
          RefreshIssueTable_Controller_.sidebar();
        }
      }
    };

    var error = function (resp, status, errorMessage) {
      response.message = "Failed to retrieve jira issues from filter with status [" + status + "]!\\n" + errorMessage;
      Browser.msgBox(response.message, Browser.Buttons.OK);
    };

    var Search = new IssueSearch(attributes.filter.jql);
    Search
      // .setOrderBy()
      .setFields(attributes.columns)
      .setMaxResults(attributes.maxResults)
      .setStartAt(startAt)
      .setPaginationTokenBased(true)
      .search()      
      .withSuccessHandler(ok)
      .withFailureHandler(error);

    return response;
  },

  hasOverlappingTable: function (withShowAlert) {
    withShowAlert = withShowAlert || false;

    try {
      var activeRange = getTicketSheet().getActiveRange();
      if (null === activeRange) activeRange = getTicketSheet().getCurrentCell();
      
      var table = IssueTableIndex_.getTableByCoord(getTicketSheet().getSheetId(), activeRange);
      if (table) {
        if (withShowAlert) {
          SpreadsheetApp.getUi().alert('Warning!',
                   'You are trying to insert a new IssueTable within an existing IssueTable. '
                   + 'Please delete existing IssueTable or choose an empty cell/range in your sheet.',
                   SpreadsheetApp.getUi().ButtonSet.OK);
        }
        return true;
      }
    } catch(e) {
      // some exception orccured which should not interfer with UX in this case
      debug.warn(this.name + '.hasOverlappingTable() - %s', e);
      return false;
    }
    
    return false;
  },

  /**
   * @desc Setting a trigger for the current spreadsheet.
   * @return void
   */
  setTriggerPruneIndex : function () {
    debug.log(this.name + '.setTriggerPruneIndex()');
    SpreadsheetTriggers_.register('onChange', 'TriggerPruneIssueTableIndex_', true);
  },

  /**
   * @desc Setting a trigger for current sheet monitoring any IssueTable modification.
   * @return void
   */
  setTriggerIssueTableModification : function () {
    debug.log(this.name + '.setTriggerIssueTableModification()');
    SpreadsheetTriggers_.register('onEdit', 'TriggerIssueTableModification_', true);
  }
}

/**
 * @desc Trigger to react on structural changes in a sheet. Will prune obsolete IssueTable references in index.
 * @param {EventObject} e
 * @return void
 */
function TriggerPruneIssueTableIndex_(e) {
  debug.time('[TriggerPruneIssueTableIndex_]');

  if (e.changeType !== 'REMOVE_GRID' && e.changeType !== 'REMOVE_ROW' && e.changeType !== 'REMOVE_COLUMN') {
    debug.log('[TriggerPruneIssueTableIndex_] changeType [%s] not monitored. Skip.', e.changeType);
    debug.timeEnd('[TriggerPruneIssueTableIndex_]');
    return;
  }

  IssueTableIndex_.prune();
  debug.timeEnd('[TriggerPruneIssueTableIndex_]');
}

/**
 * @desc Trigger to react on structural changes in a defined range of an IssueTable. Alerting to user, that changes on the grid will disable
 *       any IssueTable refresh options (Indexer).
 * @param {EventObject} e
 *          {"authMode":{},"range":{"columnStart":5,"rowStart":14,"rowEnd":14,"columnEnd":5},"source":{},"oldValue":"TP-15","user":{"nickname":"user","email":"user@sample.com"},"triggerUid":"6799221736938207327"}
 * @return void
 */
function TriggerIssueTableModification_(e) {
  debug.time('[TriggerIssueTableModification_]');
  debug.log('[TriggerIssueTableModification_] - e:  %s', JSON.stringify(e));

  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    debug.timeEnd('[TriggerIssueTableModification_]');
    return;
  }

  var IssueTable = IssueTableIndex_.getTableByCoord(e.range.getSheet().getSheetId(), e.range);
  if (!IssueTable) {
    debug.timeEnd('[TriggerIssueTableModification_]');
    return;
  }

  // Found IssueTable affected by modified range
  var ui = SpreadsheetApp.getUi();
  var warningSuspendSeconds = 120 * 1000;
  var tmpWarningId = 'warning.' + IssueTable.getSheetId() + '__' + IssueTable.getTableId();
  var lastWarningTime = UserStorage.getValue(tmpWarningId);
  var timeNow = (new Date()).getTime();

  if (lastWarningTime === null || lastWarningTime < (timeNow - warningSuspendSeconds)) {
    UserStorage.setValue(tmpWarningId, timeNow);

    // prompt can handle UnDo in case of single cell value change
    if (e.oldValue) {
      debug.log('[TriggerIssueTableModification_] Show warning with option to revert changes cell value.');
      var result = ui.alert(
        'Warning! Please confirm',
        'Changes in this Issue table may prevent "Refresh IssueTable". '
        + 'Changed cell values may be overwritten by an automated updates.  '
        + 'Press "OK" is you want to ingore this, or click "Cancel" to revert your change.',
        ui.ButtonSet.OK_CANCEL);

      if (result == ui.Button.CANCEL) {
        debug.log('[TriggerIssueTableModification_] reverted cell value.');
        e.range.setValue(e.oldValue).activate();
      }
    } else {
      debug.log('[TriggerIssueTableModification_] Show warning without options.');
      ui.alert(
        'Warning!',
        'Changes in this issue table may prevent "Refresh IssueTable".',
        ui.ButtonSet.OK);
    }
    
    try {
      clearOldWarnings_();
    } catch(e){}

  } else {
    debug.log('[TriggerIssueTableModification_] DONT show warning: %ss elapsed from %s', (timeNow - lastWarningTime)/1000, warningSuspendSeconds/1000);
  }

  debug.timeEnd('[TriggerIssueTableModification_]');
}
