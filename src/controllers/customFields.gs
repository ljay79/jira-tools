/** 
 * Controller file for setting and reading the users selects custom fields 
 */

 // Node required code block
const debug = require("src/debug.gs").debug;
const EpicField = require("src/models/jira/EpicField.gs");
const UserStorage = require("src/UserStorage.gs").UserStorage;
const getAllJiraFields = require("src/models/jira/IssueFields.gs").getAllJiraFields;
// End of Node required code block


/* Dialog: Custom Fields */

/**
 * @desc Dialog to configure Jira custom fields
 */
function menuCustomFields() {
  if (!hasSettings(true)) return;

  var dialog = getDialog('views/dialogs/customFields', {favoriteCustomFields: (UserStorage.getValue('favoriteCustomFields') || [])});

  dialog
    .setWidth(480)
    .setHeight(460)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Configure Custom Fields');
}

/* Dialog: Custom Fields - END */

/**
 * @desc Dialog Helper to retrieve list of all available Jira Custom Fields from api.
 * @return {Array}    Array of custom Jira Fields
 */
function callbackFetchCustomFields() {
  var customFields = [];

  var ok = function(_customFieldsRaw) {
      // sorting by supported type and name
      _customFieldsRaw.sort(function(a, b) {
        var keyA = (a.supported ? '0' : '1') + a.name.toLowerCase();
        var keyB = (b.supported ? '0' : '1') + b.name.toLowerCase();

        if (keyA < keyB)
          return -1;
        if (keyA > keyB)
          return 1;
        return 0;
      })
      ;

      // remove non custom fields
      customFields = _customFieldsRaw.filter(function(el) { 
        return el.custom
      });

      // EPIC usable?
      if (EpicField.isUsable()) {

        // add custom field 'Epic' to beginning of array
        customFields.unshift({
          key:        EpicField.getKey(),
          name:       EpicField.getName(),
          type:       'jst_epic',
          supported:  true
        });
      }
  };

  var error = function(message) {
    debug.error(message);
  };
  getAllJiraFields(ok, error);
  return customFields;
}

/**
 * @desc Form handler for dialogCustomFields.
 *       Storing selected custom fields into users storage.
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return {object} Object({status: [boolean], response: [string]})
 */
function callbackSaveCustomFields(jsonFormData) {
  UserStorage.setValue('favoriteCustomFields', jsonFormData.favoriteCustomFields);
  debug.log("Saved favoriteCustomFields: %s", jsonFormData.favoriteCustomFields);
  return {status: true, message: 'Ok'};
}


// Node required code block
module.exports = { callbackFetchCustomFields: callbackFetchCustomFields }
// End of Node required code block

