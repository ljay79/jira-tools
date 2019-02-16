// Node required code block
const debug = require("./debug.gs").debug;
const EpicField = require("./models/jira/EpicField.gs");
const UserStorage = require("./UserStorage.gs").UserStorage;
const getAllJiraFields = require("./jiraCommon.gs").getAllJiraFields;
// End of Node required code block

var CUSTOMFIELD_FORMAT_RAW    = 1;
var CUSTOMFIELD_FORMAT_SEARCH = 2;
var CUSTOMFIELD_FORMAT_UNIFY  = 3;

/**
 * @desc Convert stored custom fields in different prepared format.
 * @param format {Integer}
 * @return {Object}
 */
function getCustomFields( format ) {
  format = format || CUSTOMFIELD_FORMAT_RAW;
  var customFields = UserStorage.getValue('favoriteCustomFields') || [];
  var fieldsFormatted = {};

  if ( format === CUSTOMFIELD_FORMAT_RAW ) {
    return customFields;
  }

  if ( format === CUSTOMFIELD_FORMAT_SEARCH ) {
    customFields.forEach(function(el) {
      fieldsFormatted[el.key] = el.name;
    });
  }

  if ( format === CUSTOMFIELD_FORMAT_UNIFY ) {
    customFields.forEach(function(el) {
      fieldsFormatted[el.key] = el.type;
    });
  }

  return fieldsFormatted;
}

/**
 * @desc Dialog Helper to retrieve list of all available Jira Custom Fields from api.
 * @return {Array}    Array of custom Jira Fields
 */
function fetchCustomFields() {
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
function saveCustomFields(jsonFormData) {
  UserStorage.setValue('favoriteCustomFields', jsonFormData.favoriteCustomFields);
  debug.log("Saved favoriteCustomFields: %s", jsonFormData.favoriteCustomFields);
  return {status: true, message: 'Ok'};
}

/**
 * @desc Fetch list of all Jira fields (name and id) and show them in a sidebar.
 */
function sidebarJiraFieldMap() {

  var ok = function(fieldMap) {
    sidebarFieldMap(fieldMap);
  };

  var error = function(msg) {
    Browser.msgBox(msg, Browser.Buttons.OK);
    debug.error(msg + " httpResp: %s", httpResp);
  };

  getAllJiraFields(ok,error);
}

// Node required code block
module.exports = { fetchCustomFields: fetchCustomFields }
// End of Node required code block