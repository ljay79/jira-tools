/* global Request, getVar, setVar, log */
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
  var customFields = getVar('favoriteCustomFields') || [];
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
 * Dialog Helper to retrieve list of all available Jira Custom Fields
 * @return {Array}    Array of custom Jira Fields
 */
function fetchCustomFields() {
  var method = "field", _customFieldsRaw = [], customFields = [];

  var ok = function(respData, httpResp, status) {
    if(respData) {
      debug.log("Response of fetchCustomFields(); respData: %s", respData);

      var arrSupportedTypes = ['string', 'number', 'datetime', 'date', 'array|option', 'option'];

      // add data to export
      _customFieldsRaw.push.apply(_customFieldsRaw, respData.map(function(cField) {
        var _type = (cField.schema ? cField.schema.type : null) || null;
        if(cField.schema && cField.schema.items) {
          _type += '|' + cField.schema.items;
        }

        return {
          key:        cField.key || cField.id, // Server API returns ".id" only while Cloud returns both with same value
          name:       cField.name,
          custom:     cField.custom,
          schemaType: _type,
          supported:  (arrSupportedTypes.indexOf(_type) > -1)
        };
      }) )
      // sorting by supported type and name
      && _customFieldsRaw.sort(function(a, b) {
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
      _customFieldsRaw = _customFieldsRaw.filter(function(el) { 
        return el.custom
      });

      customFields = _customFieldsRaw.map(function(el) { 
        return {
          key:        el.key,
          name:       el.name,
          type:       el.schemaType,
          supported:  el.supported
        };
      });

    } else {
      // Something funky is up with the JSON response.
      debug.warn("Failed to retrieve Jira Custom Fields with status [" + status + "]; httpResp: %s", httpResp);
    }
  };

  var error = function(respData, httpResp, status) {
    debug.error("Failed to retrieve Jira Custom Fields with status [" + status + "]!\\n" + respData.errorMessages.join("\\n") + " httpResp: %s", httpResp);
  };

  var request = new Request();

  request.call(method)
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return customFields;
}

/**
 * @desc Form handler for dialogCustomFields.
 *       Storing selected custom fields into users storage.
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return {object} Object({status: [boolean], response: [string]})
 */
function saveCustomFields(jsonFormData) {
  setVar('favoriteCustomFields', jsonFormData.favoriteCustomFields);
  debug.log("Saved favoriteCustomFields: %s", jsonFormData.favoriteCustomFields);
  return {status: true, message: 'Ok'};
}