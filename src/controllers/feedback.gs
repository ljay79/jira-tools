/**
 * @file Contains controller class and dialog/callback method for Feedback feature.
 */

/**
 * @desc Wrapper: Callback handler for opening the Feedback dialog
 * @return {object} Object({status: [boolean], message: [string|null]})
 */
function callbackFeedback_getDialog() {
  return Feedback_Controller_.callbackOpenDialog();
}

/**
 * @desc Wrapper: Callback handler for sending feedback message.
 * @param {object} Json formatted form data
 * @return {object} Object({status: [boolean]})
 */
function callbackFeedback_sendFeedback(jsonFormData) {
  return Feedback_Controller_.sendFeedback(jsonFormData);
}

/**
 * Creates a new IssueTableIndex_ object, which is used to persist IssueTables and related information.
 */
Feedback_Controller_ = {
  name : 'Feedback_Controller_',

  /**
   * @desc Callback handler to open Feedback dialog from within other HTMLServices like sidebar
   * @return void
   */
  callbackOpenDialog : function () {
    debug.log(this.name + '.callbackOpenDialog()');

    var dialog = getDialog('views/dialogs/dialogFeedback');

    dialog
      .setWidth(400)
      .setHeight(340)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    
    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, 'Provide Feedback');
  },

  /**
   * @desc Sending feedback message as email from user.
   * @param {object} Json formatted form data
   * @return {object} Object({status: [boolean]})
   */
  sendFeedback : function (jsonFormData) {
    debug.log(this.name + '.sendFeedback() <= %s', jsonFormData);

    var emailAddress = 'paj-feedback@jens79.de';
    var subject = 'PA4J Feedback from user';
    var messageHtml = 'User submitted feedback from within Add-On.<br/>'
      + 'Privacy Agreed: ' + (jsonFormData.data_privacy == 1 ? 'Yes' : 'No') + '<br>'
      + 'Contact allowed: ' + (jsonFormData.contact_me == 1 ? 'Yes' : 'No') + '<br>'
      + 'Message: ' + jsonFormData.feedback_msg + '<br>'
      + '<br/>-------<br/>'
      + 'Add-On Info<br/>'
      + 'Temp. User Key: ' + Session.getTemporaryActiveUserKey() + '<br>'
      + 'Build Number: ' + BUILD + '<br>'
      + 'Debug Enabled: ' + (debug.isEnabled() ? 'Yes' : 'No')
    ;

    MailApp.sendEmail({
      to : emailAddress,
      subject : subject,
      htmlBody : messageHtml,
    });

    return {
      status : true
    };
  }

}
