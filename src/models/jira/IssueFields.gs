/**
 * Model class for interactions with JIRA fields
 */

// Node required code block
const Request = require('src/jiraApi.gs');
const EpicField = require("src/models/jira/EpicField.gs");
// End of Node required code block


/**
 * Takes the native JSON response from JIRA for a field definition and returns an object
 * with the fields used in the Application 
 * @param jiraFieldResponse - the response from JIRA
 * @return array Array of objects for each field 
return {
          key:        cField.key || cField.id, // Server API returns ".id" only while Cloud returns both with same value
          name:       cField.name,
          custom:     cField.custom,
          schemaType: _type,
          supported:  (arrSupportedTypes.indexOf(_type) > -1)
        };
 */
function convertJiraFieldResponseToFieldRecord(jiraFieldResponse) {
  // EPIC customization
  if (jiraFieldResponse.schema && jiraFieldResponse.schema.custom) {
   if (jiraFieldResponse.schema.custom.indexOf(':gh-epic-link') > -1) {
     EpicField.setLinkKey(jiraFieldResponse.key || jiraFieldResponse.id);
   }
   if (jiraFieldResponse.schema.custom.indexOf(':gh-epic-label') > -1) {
     EpicField.setLabelKey(jiraFieldResponse.key || jiraFieldResponse.id);
   }
 }
 
 
 var arrSupportedTypes = ['string', 'number', 'datetime', 'date', 'option', 'array|option', 'array|string', 'user', 'array|user', 'group', 'array|group', 'version', 'array|version'];
 var _type = (jiraFieldResponse.schema ? jiraFieldResponse.schema.type : null) || null;
 if (jiraFieldResponse.schema && jiraFieldResponse.schema.items) {
   _type += '|' + jiraFieldResponse.schema.items;
 }
 return {
   key: jiraFieldResponse.key || jiraFieldResponse.id, // Server API returns ".id" only while Cloud returns both with same value
   name: jiraFieldResponse.name,
   custom: jiraFieldResponse.custom,
   schemaType: _type,
   supported: (arrSupportedTypes.indexOf(_type) > -1)
 };
}

/**
* Returns all of the fields in the configured JIRA rest server
* @param successCallBack - function to call back if this call to the JIRA rest server is succesful
* @param errorCallBack - funcion callback if there is an issue with the server call or response
*/
function getAllJiraFields(successCallBack, errorCallBack) {
 var request = new Request();
 var fieldMap = [];

 var ok = function (respData, httpResp, status) {

   if (!respData) {
     error(respData, httpResp, status);
   }
   // reset custom epic field
   EpicField.resetValue();

   fieldMap.push.apply(fieldMap, respData.map(convertJiraFieldResponseToFieldRecord))
     // sorting by supported type and name
     && fieldMap.sort(function (a, b) {
       var keyA = a.name.toLowerCase();
       var keyB = b.name.toLowerCase();

       if (keyA < keyB)
         return -1;
       if (keyA > keyB)
         return 1;
       return 0;
     });
   if (successCallBack != null) {
     successCallBack(fieldMap);
   }
 };

 var error = function (respData, httpResp, status) {
   var jiraErrorMessage = "";
   if (respData != null && respData.errorMessages != null) {
     jiraErrorMessage = respData.errorMessages.join(",") || respData.errorMessages;
   }
   var msg = "Failed to retrieve Jira Fields info with status [" + status + "]!\\n"
     + jiraErrorMessage;
   if (errorCallBack != null) {
     errorCallBack(msg);
   }
 };
 request.call("field")
   .withSuccessHandler(ok)
   .withFailureHandler(error)
   ;

 return fieldMap;
}

/**
* Looks through an array of valid JIRA fields and finds the best matching one
* Will compare on both the name of the field (the text displayed in the jira GUI)
* amd on the key of the the field (the id used in JSON interactions with the REST API)
* @param listOfValidJiraFields - an array of fields, each item is a object with name and key defined 
* @param fieldName - the name used for matching
*/
function getMatchingJiraField(listOfValidJiraFields, fieldName) {
 var matchingFunction = function (stringA, stringB) {
   return stringA.toLowerCase().trim() == stringB.toLowerCase().trim();
 }
 var results = listOfValidJiraFields.filter(function (fieldSpec) {
   return matchingFunction(fieldSpec.name, fieldName) || matchingFunction(fieldSpec.key, fieldName)
 });
 if (results.length > 0) {
   return results[0];
 } else {
   return null;
 }
}


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

// Node required code block
module.exports = {
  getMatchingJiraField:getMatchingJiraField, 
  getAllJiraFields:getAllJiraFields, 
  convertJiraFieldResponseToFieldRecord:convertJiraFieldResponseToFieldRecord
};
// End of Node required code block