
/**
 * @file Contains controller class and dialog/callback method for Feedback feature.
 */

/**
 * @desc Wrapper: Callback handler for opening the Feedback dialog
 * @return {object} Object({status: [boolean], message: [string|null]})
 */
function cbFeedback_getDialog() {
  return Feedback_Controller_.callbackOpenDialog();
}


/**
 * Creates a new IssueTableIndex_ object, which is used to persist IssueTables and related information.
 */
Feedback_Controller_ = {
  name : 'Feedback_Controller_',

  callbackOpenDialog : function () {
    debug.log(this.name + '.callbackOpenDialog()');

    var tempActiveUserKey = Session.getTemporaryActiveUserKey();
    var userProps = PropertiesService.getUserProperties();
    var dialog = getDialog('views/dialogs/dialogFeedback', {
      buildNumber: BUILD,
      debugging: userProps.getProperty('debugging'),
      tempUserKey: tempActiveUserKey,
      environmentConfiguration: environmentConfiguration,
      debugEnabled: debug.isEnabled()
    });
    
    dialog
      .setWidth(480)
      .setHeight(420)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'Provide Feedback');
  }

}
