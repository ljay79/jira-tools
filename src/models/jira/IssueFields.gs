/**
 * Model class for interactions with JIRA fields
 * @todo Currently this just contains all of the functions used across the code base - needs to be factored into a class
 */

// Node required code block
const Request = require('src/jiraApi.gs');
const EpicField = require("src/models/jira/EpicField.gs");
const UserStorage = require("src/models/gas/UserStorage.gs");
const extend = require("src/jsLib.gs").extend;
const camelize = require('src/jsLib.gs').camelize;
// End of Node required code block

IssueFields = (function () {

  var SupportedTypes = [EpicField.EPIC_KEY, 'string', 'number', 'datetime', 'date', 'option', 'array|option', 'array|string', 'user', 'array|user', 'group', 'array|group', 'version', 'array|version'];

  /**
   * Creates a field record
   * @param key the JIRA key for the field
   * @param name the name for the field
   * @param isCustom is the field a custom field
   * @param schemaType the string representation of the type
   * @param isVirtual the field is a virtual field used by the application only
   * 
   * @returns {object}
   */
  function field(key, name, isCustom, schemaType, isVirtual) {
    // isVirtualField defaults to false
    return {
      key: key,
      name: name,
      custom: isCustom,
      schemaType: schemaType,
      supported: (SupportedTypes.indexOf(schemaType) > -1),
      isVirtual: (isVirtual==null)?false:isVirtual
    };
  }
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
            supported:  (SupportedTypes.indexOf(_type) > -1),
            isVirtual: true/false
          };
   */
  function convertJiraResponse(jiraFieldResponse) {
    // EPIC customization
    if (jiraFieldResponse.schema && jiraFieldResponse.schema.custom) {
      if (jiraFieldResponse.schema.custom.indexOf(':gh-epic-link') > -1) {
        EpicField.setLinkKey(jiraFieldResponse.key || jiraFieldResponse.id);
      }
      if (jiraFieldResponse.schema.custom.indexOf(':gh-epic-label') > -1) {
        EpicField.setLabelKey(jiraFieldResponse.key || jiraFieldResponse.id);
      }
    }
    var _type = (jiraFieldResponse.schema ? jiraFieldResponse.schema.type : null) || null;
    if (jiraFieldResponse.schema && jiraFieldResponse.schema.items) {
      _type += '|' + jiraFieldResponse.schema.items;
    }
    return field(
      jiraFieldResponse.key || jiraFieldResponse.id, // Server API returns ".id" only while Cloud returns both with same value
      jiraFieldResponse.name,
      jiraFieldResponse.custom,
      _type
    );
  }

  /**
   * Default field sort
   * @param fieldA {IssueField} field to sort
   * @param fieldB {IssueField} field to sort
   * @returns -1,0,1 as per requirments of javascript sort function
   */
  function defaultFieldSort_(fieldA, fieldB) {
    var nameA = fieldA.name.toLowerCase();
    var nameB = fieldB.name.toLowerCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }


  /**
   * Cached in memory copy of all fields in Jira
   */
  var allJiraFields_ = null;
  /**
  * Returns all of the fields in the configured JIRA rest server
  * @param successCallBack - function to call back if this call to the JIRA rest server is succesful
  * @param errorCallBack - funcion callback if there is an issue with the server call or response
  */
  function getAllFields(successCallBack, errorCallBack) {
    if (allJiraFields_ != null) {
      if (successCallBack != null) {
        successCallBack(allJiraFields_);
      }
      return allJiraFields_;
    } else {
      var request = new Request();
      allJiraFields_ = [];

      var ok = function (respData, httpResp, status) {

        if (!respData) {
          error(respData, httpResp, status);
        } else {
          // reset custom epic field 
          EpicField.resetValue();

          allJiraFields_.push.apply(allJiraFields_, respData.map(IssueFields.convertJiraResponse))
          // sorting by supported type and name
          allJiraFields_.sort(defaultFieldSort_);
          // EPIC usable?
          if (EpicField.isUsable()) {
            // add custom field 'Epic' to beginning of array
            allJiraFields_.unshift(
              field(
                EpicField.getKey(),
                EpicField.getName(),
                EpicField.EPIC_KEY,
                true,
                true
              ));
          }
          if (successCallBack != null) {
            successCallBack(allJiraFields_);
          }
        }
      };


      var error = function (respData, httpResp, status) {
        allJiraFields_ = null;
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
      if (allJiraFields_ == null) {
        return [];
      } else {
        return allJiraFields_;
      }
    }
  }

  /**
   * Clears the in memory cached Jira fields
   */
  function clearCache() {
    allJiraFields_ = null;
  }


  /**
   * Returns all custom fields from the Jira Instance including the EpicField
   * @param successCallBack  - call back function if the list is retrieved succesfully
   * @param errorCallBack - call back if there is an error
   */
  function getAllCustomFields(successCallBack, errorCallBack) {
    var customFields = [];

    var error = function (message) {
      if (errorCallBack != null) {
        errorCallBack(message);
      }
    };

    var ok = function (allFields) {
      // remove non custom fields
      customFields = allFields.filter(function (el) {
        return el.custom;
      });
      if (successCallBack != null) {
        successCallBack(customFields);
      }
    }
    getAllFields(ok, error);
    return customFields;
  };

  return {
    convertJiraResponse: convertJiraResponse,
    SupportedTypes: SupportedTypes,
    getAllFields: getAllFields,
    getAllCustomFields: getAllCustomFields,
    clearCache: clearCache
  }
})();

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


var CUSTOMFIELD_FORMAT_RAW = 1;
var CUSTOMFIELD_FORMAT_SEARCH = 2;
var CUSTOMFIELD_FORMAT_UNIFY = 3;

/**
 * @desc Convert stored custom fields in different prepared format.
 * @param format {Integer}
 * @return {Object}
 */
function getCustomFields(format) {
  format = format || CUSTOMFIELD_FORMAT_RAW;
  var customFields = UserStorage.getValue('favoriteCustomFields') || [];

  // using attribute schemaType conistently across the code base
  // however a user may have an object stored with attribute "type" in their preferences
  customFields.forEach(function(field) {
    if (field.type != null) {
      field.schemaType = field.type;
      delete(field.type);
    }
  });
   
  var fieldsFormatted = {};
  // TODO: this code branch appears unnessaruy
  // getCustomFields is not called without a parameter or with CUSTOMFIELD_FORMAT_RAW
  if (format === CUSTOMFIELD_FORMAT_RAW) {
    return customFields;
  }

  if (format === CUSTOMFIELD_FORMAT_SEARCH) {
    customFields.forEach(function (el) {
      fieldsFormatted[el.key] = el.name;
    });
  }

  if (format === CUSTOMFIELD_FORMAT_UNIFY) {
    customFields.forEach(function (el) {
        fieldsFormatted[el.key] = el.schemaType;
    });
  }

  return fieldsFormatted;
}



/**
 * @desc Return table header title for issue property
 * @param header {string}  Property key name to get header title for
 * @return {string}
 */
function headerNames(header) {
  var label, labels = ISSUE_COLUMNS;
  extend(labels, {
    key: 'Key',
    issuetype: 'Type',
    duedate: 'Due',
    priority: 'P',
  });

  // append favorite custom fields
  extend(labels, getCustomFields(CUSTOMFIELD_FORMAT_SEARCH));

  // custom epic
  if (EpicField.isUsable()) {
    labels[EpicField.getLinkKey()] = EpicField.getName();
  }

  if (!labels.hasOwnProperty(header)) {
    label = camelize(header);
  } else {
    label = labels[header];
  }

  return label;
}


/**
 * Finds the list of valid JIRA fields which can be edited
 * @returns {array} an array of built in and user selected custom fields
 */
function getValidFieldsToEditJira() {
  var validFields = {};
  var userSelectedcustomFields = getCustomFields(CUSTOMFIELD_FORMAT_SEARCH);
  var systemFields = ISSUE_COLUMNS;
  validFields = extend(validFields, userSelectedcustomFields);
  validFields = extend(validFields, systemFields);
  return validFields;
}

// Jira issue fields/columns
// Sorting of definition below is applied as sorting for IssueTable
var ISSUE_COLUMNS = {
  summary: 'Summary',
  project: 'Project',
  issuetype: 'Issue Type',
  priority: 'Priority',
  status: 'Status',
  labels: 'Labels',
  components: 'Components',
  description: 'Description',
  assignee: 'Assignee',
  creator: 'Creator',
  reporter: 'Reporter',
  environment: 'Environment',
  fixVersions: 'Fix Version',
  duedate: 'Due',
  resolutiondate: 'Resolved',
  created: 'Created',
  updated: 'Updated',
  resolution: 'Resolution',
  timespent: 'Time spent',
  timeestimate: 'Estimate', // remaining
  timeoriginalestimate: 'Original estimate',
  aggregatetimespent: 'Aggregate Time Spent',
  aggregatetimeestimate: 'Aggregate Time Estimate',
  aggregateprogress: 'Aggregate Progress',
  progress: 'Progress',
  lastViewed: 'Last Viewed',
  votes: 'Votes',
  watches: 'Watchers',
  workratio: 'Work Ratio'
  //subtasks:[{"id":"33351","key":"FF24-229","self":"...atlassian.net/rest/api/2/issue/33351","fields":{"summary":"QA - Feedback","status":{"self":"....atlassian.net/rest/api/2/status/6","description":"The issue is considered finished, the resolution is correct. Issues which are closed can be reopened.","iconUrl":"https://dyhltd.atlassian.net/images/icons/statuses/closed.png","name":"Closed","id":"6","statusCategory":{"self":"https://dyhltd.atlassian.net/rest/api/2/statuscategory/3","id":3,"key":"done","colorName":"green","name":"Done"}},"priority":{"self":"https://dyhltd.atlassian.net/rest/api/2/priority/1","iconUrl":"https://dyhltd.atlassian.net/images/icons/priorities/highest.svg","name":"Highest","id":"1"},"issuetype":{"self":"https://dyhltd.atlassian.net/rest/api/2/issuetype/10003","id":"10003","description":"The sub-task of the issue","iconUrl":"https://dyhltd.atlassian.net/secure/viewavatar?size=xsmall&avatarId=10316&avatarType=issuetype","name":"Sub-task","subtask":true,"avatarId":10316}}}]
  //versions: [{"self": "https://dyhltd.atlassian.net/rest/api/2/version/14021","id": "14021","description": "","name": "Loan - Release v2.0.17","archived": false,"released": true,"releaseDate": "2018-03-21"}]
  //aggregatetimeoriginalestimate: 288000
};


// Node required code block
module.exports = {
  IssueFields: IssueFields,
  getCustomFields: getCustomFields,
  getMatchingJiraField: getMatchingJiraField,
  getValidFieldsToEditJira: getValidFieldsToEditJira,
  headerNames: headerNames,
  CUSTOMFIELD_FORMAT_RAW: CUSTOMFIELD_FORMAT_RAW,
  CUSTOMFIELD_FORMAT_SEARCH: CUSTOMFIELD_FORMAT_SEARCH,
  CUSTOMFIELD_FORMAT_UNIFY: CUSTOMFIELD_FORMAT_UNIFY,
};
// End of Node required code block


