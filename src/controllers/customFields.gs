// Node required code block
const debug = require("src/debug.gs").debug;
const EpicField = require("src/models/jira/EpicField.gs");
const UserStorage = require("src/models/gas/UserStorage.gs");
const IssueFields = require("src/models/jira/IssueFields.gs");
// End of Node required code block


/** 
 * Controller file for setting and reading the users selects custom fields 
 */


/**
 * @desc Dialog to configure Jira custom fields
 */
function menuCustomFields() {
  if (!hasSettings(true)) return;

  var dialog = getDialog('views/dialogs/customFields', { favoriteCustomFields: (UserStorage.getValue('favoriteCustomFields') || []) });

  dialog
    .setWidth(480)
    .setHeight(460)
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);

  debug.log('Processed: %s', dialog);

  SpreadsheetApp.getUi().showModalDialog(dialog, 'Configure Custom Fields');
}

/**
 * @desc Dialog Helper to retrieve list of all available Jira Custom Fields from api.
 * @return {Array}    Array of custom Jira Fields
 */
function callbackFetchCustomFields() {
  var customFields = [];
  IssueFields.getAllCustomFields(
    // ok callback
    function (customFieldsUnsorted) {
      customFields = customFieldsUnsorted;
      // sorting by supported type and name
      customFields.sort(sortCustomFields_);
    }, 
    // error callback
    function (message) {
      debug.error(message);
    }
  );
  return customFields;
}

/**
 * Sorts the fields into the presentation order
 * Epic field first
 * Supported fields in alphabetical order
 * Non- supported fields in alphabetical order
 * @param a field to compare
 * @param b field to compare
 */
function sortCustomFields_(a, b) {
  // epic field at the top
  if (a.key == EpicField.EPIC_KEY) {
    return -1;
  }
  if (b.key == EpicField.EPIC_KEY) {
    return 1;
  }
  // supported fields first then use alphabetical order.
  var keyA = (a.supported ? '0' : '1') + a.name.toLowerCase();
  var keyB = (b.supported ? '0' : '1') + b.name.toLowerCase();
  if (keyA < keyB)
    return -1;
  if (keyA > keyB)
    return 1;
  return 0;
}

/**
 * @desc Form handler for dialogCustomFields.
 *       Storing selected custom fields into users storage.
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return {object} Object({status: [boolean], response: [string]})
 */
function callbackSaveCustomFields(jsonFormData) {
  UserStorage.setValue('favoriteCustomFields', jsonFormData.favoriteCustomFields);
  debug.log("Saved favoriteCustomFields: %s", JSON.stringify(jsonFormData.favoriteCustomFields));
  StorageCounter.log();
  return { status: true, message: 'Ok' };
}

// Node required code block
module.exports = { callbackFetchCustomFields: callbackFetchCustomFields }
// End of Node required code block

