/**
 * @file Contains controller class and dialog/callback method for "What's New" feature.
 */

/**
 * @desc Wrapper: Dialog for "Whats New"
 */
function menuWhatsNew() {
  WhatsNew_Controller_.dialogOpen();
}

/**
 * Creates a new WhatsNew_Controller_ object
 */
WhatsNew_Controller_ = {
  name : 'WhatsNew_Controller_',

  /**
   * @desc Dialog
   */
  dialogOpen : function () {
    debug.log(this.name + '.dialog()');

    if (!hasSettings(true))
      return;

    var dialog = getDialog('views/dialogs/whatsNew', {
      buildNumber: BUILD
    });

    dialog
      .setWidth(420)
      .setHeight(420)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);

    debug.log('Processed: %s', dialog);

    SpreadsheetApp.getUi().showModalDialog(dialog, "What's New?");
  }

}
