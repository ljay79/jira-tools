/**
 * @file Contains controller class and dialog/callback method for creating a time report from Jira worklog
 */

/**
 * @desc Wrapper: Dialog for time report settings
 */
function menuCreateTimeReport() {
  TimeReport_Controller_.dialogOpen();
}

/**
 * @desc Wrapper: Dialog callback handler, fetching all users form time report form
 * @return {object} Object({status: [boolean], response: [Array], message:[string]})
 */
function callbackGetAllUsers() {
  return TimeReport_Controller_.getAllUsers();
}

/**
 * Creates a new IssueTableIndex_ object, which is used to persist IssueTables and related information.
 */
TimeReport_Controller_ = {
  name : 'TimeReport_Controller_',

  /**
   * @desc Dialog to configure Jira custom fields
   */
  dialogOpen : function () {
    debug.log(this.name + '.dialog()');

    if (!hasSettings(true))
      return;

    var dialog = getDialog('views/dialogs/createTimeReport');

    dialog.setWidth(360).setHeight(380).setSandboxMode(HtmlService.SandboxMode.IFRAME);

    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'Create time report');
  },

  /**
   * @desc Fetch all active users and groups for dialog selection.
   * @return {object} Object({status: [boolean], response: [Array], message:[string]})
   */
  getAllUsers : function () {
    debug.log(this.name + '.getAllUsers()');

    var result = [], maxResults = 1000, response = {
      status : false,
      response : result,
      message : null
    };

    result = findUser('', true, maxResults).filter(function (user) {
      return user.active !== false;
    });

    // Jira Server Issue workaround (https://jira.atlassian.com/browse/JRASERVER-29069)
    if (result.length == 0 && getCfg_('server_type') == 'server') {
      // try it again with custom query param apparently working like %,+,*,.
      result = findUser('.', true, maxResults).filter(function (user) {
        return user.active !== false;
      });
    }
    
    // workaround 2 as the param val appears to change
    if (result.length == 0) {
      // try it again with custom query param apparently working like %,+,*,.
      result = findUser('', true, maxResults, 'userSearchV2').filter(function (user) {
        return user.active !== false;
      });
    }

    result.sort(function (a, b) {
      // as we go over each user anyway, we extend it same time with our autocomplete value
      a.value = a.displayName + ' (' + a.name + ')';
      b.value = b.displayName + ' (' + b.name + ')';
      return (a.displayName > b.displayName) ? 1 : ((b.displayName > a.displayName) ? -1 : 0);
    });

    if (result.length == 0) {
      response.message = "No users were found. Check your JIRA permission.";
      SpreadsheetApp.getActiveSpreadsheet().toast(response.message, "Error", 10);
    }

    response = {
      status : true,
      response : result,
      message : null
    };

    return response;
  }

}
