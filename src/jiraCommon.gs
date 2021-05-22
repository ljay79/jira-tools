//@TODO: rename this filename, its not appropiate as it has not only jira related utilities - JRo

// Node required code block
const Request = require('./jiraApi.gs');
const debug = require('./debug.gs').debug;
const EpicField = require("src/models/jira/EpicField.gs");
const IssueFields = require("src/models/jira/IssueFields.gs");
const UserStorage = require("src/models/gas/UserStorage.gs");
const getCfg_ = require("./settings.gs").getCfg_;
// End of Node required code block

// const not available, but better solution needed
var CELLTYPE_EMPTY = -1;
var CELLTYPE_JIRAID = 10; // entire cell includes Jira ticket id only ("JIRA-123" or "JIRA-123 [Status]")
var CELLTYPE_TEXT = 20;  // Jira ticket id is within text ("lorem ipsum JIRA-123 [Status] dolores")

//@see storage.gs for jiraColumnDefault


/**
 * @desc Get current active sheet
 * @return {Sheet}
 */
function getTicketSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

/**
 * Takes a google spreadsheet sheet id and converts it into a save string 
 * which can be used as a objects property key.
 * 
 * @param {object|int|string} sheetId    Optional; The original google sheetId
 * @param {boolean} revert    If TRUE, an previous generated sheetId is converted back
 * @return {string}
 */
function sheetIdPropertySafe(sheetId, revert) {
  if (true === revert) {
    sheetId = sheetId.replace(/sid\_/g, '');
  } else {
    sheetId = sheetId || getTicketSheet().getSheetId();
    sheetId = 'sid_' + ((typeof sheetId === 'string') ? sheetId : JSON.stringify(sheetId));
  }

  return sheetId;
}

/**
 * @desc Find valid Jira Ticket ID from cell value.
 *     Valid ticket id format: KEY-123
 * @param cellValue {string}
 * @return {string}    Returns Jira ticket ID if found or NULL
 */
function grepJiraTicketId(cellValue) {
  var ticketId = cellValue.match(/[A-Z]+\-\d+/);
  return (ticketId == null ? null : ticketId[0]);
}

/**
 * @desc More sufficiticated cell value analyzation. For multiple ways of ticket Ids within text.
 *       Checks the cell value and returns a object with information for type,value,ticketId and match parts.
 * @param cellValue {string}
 * @return {object}
 */
function grepJiraCell(cellValue) {
  var cellProps = {
    type: CELLTYPE_EMPTY,
    value: cellValue,
    ticketId: null,
    parts: []
  };

  if (cellValue.trim() == '') {
    return cellProps;
  }

  //@TODO: regexp requires lots of tweaking

  // match: "JIRA-123"
  match = cellValue.match(/^([A-Z0-9]+\-\d+)$/);
  if (match && match.length == 2) {
    cellProps = {
      type: CELLTYPE_JIRAID,
      value: cellValue,
      ticketId: match[1],
      parts: match
    }
    return cellProps;
  }

  // match: "JIRA-123 [Status]"
  match = cellValue.match(/^([A-Z0-9]+\-\d+)\s?(\[.+\])$/);
  if (match && match.length == 3) {
    cellProps = {
      type: CELLTYPE_JIRAID,
      value: cellValue,
      ticketId: match[1],
      parts: match
    }
    return cellProps;
  }

  // match: "lorem ipsum JIRA-123 [Status] dolores"
  match = reverse(cellValue).match(/(.*)((\].+\[)\s?(\d+-[A-Z0-9]+(?!-?[a-zA-Z]{1,10})))(.*)/);
  if (match && match.length == 6) {
    // remove status part
    cellValue = cellValue.replace(' ' + reverse(match[3]), '').trim();
    cellProps = {
      type: CELLTYPE_TEXT,
      value: cellValue,
      ticketId: reverse(match[4]),
      parts: match
    }
    return cellProps;
  }

  // match: "lorem ipsum JIRA-123 dolores"
  match = reverse(cellValue).match(/(\d+-[A-Z0-9]+(?!-?[a-zA-Z]{1,10}))(.*)/);
  if (match && match.length == 3) {
    cellProps = {
      type: CELLTYPE_TEXT,
      value: cellValue,
      ticketId: reverse(match[1]),
      parts: match
    }
    return cellProps;
  }

  return cellProps;

  /* Debug Info
  IN: IT-123
  OUT: {"type":10,"value":"IT-123","ticketId":"IT-123","parts":["IT-123","IT-123"]}
  ----------------------------------
  IN: IT-123 [Status]
  OUT: {"type":10,"value":"IT-123 [Status]","ticketId":"IT-123","parts":["IT-123 [Status]","IT-123","[Status]"]}
  ----------------------------------
  IN: Lorem ispum IT-123
  OUT: {"type":20,"value":"Lorem ispum IT-123","ticketId":"IT-123","parts":["321-TI mupsi meroL","321-TI"," mupsi meroL"]}
  ----------------------------------
  IN: Lorem ispum IT-123 dolores
  OUT: {"type":20,"value":"Lorem ispum IT-123 dolores","ticketId":"IT-123","parts":["321-TI mupsi meroL","321-TI"," mupsi meroL"]}
  ----------------------------------
  IN: Lorem ispum IT-123 [Status]
  OUT: {"type":20,"value":"Lorem ispum IT-123","ticketId":"IT-123","parts":["]sutatS[ 321-TI mupsi meroL","","]sutatS[ 321-TI","]sutatS[","321-TI"," mupsi meroL"]}
  ----------------------------------
  IN: Lorem ispum IT-123 [Status] dolores
  OUT: {"type":20,"value":"Lorem ispum IT-123 dolores","ticketId":"IT-123","parts":["serolod ]sutatS[ 321-TI mupsi meroL","serolod ","]sutatS[ 321-TI","]sutatS[","321-TI"," mupsi meroL"]}
  ----------------------------------
  */
}


/**
 * @desc Request users own (and favourite) filters and return an object of main props.
 * @return {object} Object({[id]:{name:{string}, self:{string}, favourite:{boolean}, owner:{string}, viewUrl:{string}}})
 */
function getMyFilters() {
  var filters = { list: [], error: '' };
  var only_my_filters = UserStorage.getValue('only_my_filters') || 0;

  var ok = function (responseData, httpResponse, statusCode) {
    // Check the data is valid and the Jira fields exist
    debug.log("getMyFilters()->ok(): %s", responseData);

    if (responseData) {
      /*
       * responseData = array (server: api v2 /filter/favourite)
       * responseData.values = array (cloud: api v2 /filter/search)
       */
      var values = responseData.values ? responseData.values : responseData;
      // add data to export
      filters.list.push.apply(filters.list, values.map(function (filter) {
        return {
          id: parseInt(filter.id),
          name: filter.name,
          self: filter.self,
          favourite: filter.favourite,
          owner: filter.owner.displayName,
          viewUrl: filter.viewUrl,
          jql: filter.jql
        };
      }))
        // sorting the list of filters by favourite, name
        && filters.list.sort(function (a, b) {
          var keyA = (a.favourite ? '0' : '1') + a.name;
          var keyB = (b.favourite ? '0' : '1') + b.name;

          if (keyA < keyB)
            return -1;
          if (keyA > keyB)
            return 1;
          return 0;
        })
        ;
      debug.log("getMyFilters()->return(): %s", filters);
    } else {
      // Something funky is up with the JSON response.
      filters.error = "Failed to retrieve jira filters!";
      debug.error(filters.error);
    }
  };

  var error = function (responseData, httpResponse, statusCode) {
    filters.error = "Failed to retrieve jira filters with status [" + statusCode + "]!\\n" + responseData.errorMessages.join("\\n");
    debug.error(filters.error);
  };

  var request = new Request();
  var data = {};

  if (only_my_filters == 1 && getCfg_('server_type') == 'onDemand') {
    var myself = new MySelf();
    data = {
      accountId: myself.getAccountId()
    };
  }

  request.call("myFilters", data)
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return filters;
}

/**
 * @desc Returns a filter given an id
 * @param filterId {int}  FilterId to get filter info for
 * @return {object}
 */
function getFilter(filterId) {
  var method = "filter",
      filter = {
        // obj template
        id : null,
        name : null,
        description : null,
        owner: {
          name : null,
          displayName : null,
          active : null
        },
        jql : null,
        searchUrl : null,
        favourite : null
      },
      request = new Request();

  var ok = function (responseData, httpResponse, statusCode) {
    // Check the data is valid and the Jira fields exist
    if (responseData) {
      filter = responseData;
    } else {
      // Something funky is up with the JSON response.
      debug.info("Failed to retrieve jira filter info!");
    }
  };

  var error = function (responseData, httpResponse, statusCode) {
    debug.error("Failed to retrieve jira filter with status [" + statusCode + "]!\\n" + responseData.errorMessages.join("\\n"));
  };

  request.call(method, { filterId: filterId })
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return filter;
}

/**
 * @desc Helper to convert indiv. jira field/property objects 
 *       into simple objects for using as cell data.
 * @param attrib {string}
 * @param data {object}
 * @return {object}
 */
function unifyIssueAttrib(attrib, data) {
  var resp = { value: '' };
  // TODO: We should remove this try catch - needs alot of testing though to get to that.
  try { // no error handling, always return a valid object
    
//    var _dataEmailAdressPriv = data.emailAddress || ''; 
//    _dataEmailAdressPriv = _dataEmailAdressPriv.replace(/(.*@)([a-z]{0,3}).*/, "$1$2***");

    // custom fields first
    if (attrib.substring(0, 12) == 'customfield_') {
      var customFields = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_UNIFY);
      // custom epic
      if (EpicField.isUsable()) {
        customFields[EpicField.getLinkKey()] = EpicField.EPIC_KEY;
      }

      if (customFields.hasOwnProperty(attrib)) {
        var format = customFields[attrib];
        switch (format) {
          case EpicField.EPIC_KEY:
            resp = {
              epic: true,
              value: data.fields[attrib] || 'n/a',
              link: getCfg_('jira_url') + "/browse/" + data.fields[attrib]
            };
            break;
          case 'datetime':
            var _date = data.fields[attrib] || null;
            resp = {
              value: _date,
              date: getDateFromIso(_date),
              format: "dd.mm.yyyy hh:mm"
            };
            break;
          case 'date':
            var _date = data.fields[attrib] || null;
            _date = (null !== _date && _date.length == 10) ? _date + 'T12:00:00' : _date;
            var date = getDateFromIso(_date);
            date.setHours(0, 0, 0);
            resp = {
              value: _date,
              date: date,
              format: "dd.mm.yyyy"
            };
            break;
          case 'number':
            resp = {
              value: parseFloat(data.fields[attrib]) || null,
              format: "0"
            };
            break;
          case 'string':
            resp.value = data.fields[attrib] || '';
            break;
          case 'option':
            resp.value = data.fields[attrib] ? data.fields[attrib].value : 'n/a';
            break;
          case 'array|option':
            resp.value = '';
            var _values = [];
            // Try casting array to values
            if (data.fields[attrib].length > 0 && data.fields[attrib][0].hasOwnProperty('value'))
              for (var i = 0; i < data.fields[attrib].length; i++)
                _values.push(data.fields[attrib][i].value);

            resp.value = _values.join(',');
            break;
          case 'array|string':
            resp.value = '';
            var _values = data.fields[attrib];

            if (Array.isArray(_values) && _values.length > 0) {
              // field "Sprint" is type string with custom value
              if (_values[0].indexOf('service.sprint.Sprint') > -1) {
                _values = [];
                var _regEx = /name=([^,]+),/gi;
                for (var i = 0; i < data.fields[attrib].length; i++) {
                  var _sprintNameArr = null;
                  _sprintNameArr = _regEx.exec(data.fields[attrib][i]);
                  _regEx.lastIndex = 0; // Reset
                  if (Array.isArray(_sprintNameArr) && _sprintNameArr.length == 2) _values.push(_sprintNameArr[1]);
                }
              }
              resp.value = _values.join(', ');
            }
            break;
          case 'user':
            // @TODO: type 'user', 'array|user', 'group',... require some refractoring - to much duplicated logic and code

            // regular user object or custom fields userobject like "Profields"
            // {"value": {"directoryId": <number>,"emailAddress": "<string>", "active": <bool>, "accountId": "<string>", "key": "<string>","avatarUrls": {},"displayName": "<string>"}}
            var _value = data.fields[attrib] ? (data.fields[attrib].hasOwnProperty('value') ? data.fields[attrib].value : data.fields[attrib]) : {};
            var _user = extend({
              displayName: '',
              avatarUrls: [],
              emailAddress: null,
              name: null,
              accountId: null
            }, _value);

            resp = {
              value: _user.displayName || 'Unknown',
              avatarUrls: _user.avatarUrls['24x24'] || '',
              accountId: _user.accountId,
              name: (_user.name || _user.username) || null
            };
            break;
          case 'array|user':
            resp.value = data.fields[attrib].map(function (el) {
              return (el.displayName || 'Unknown');
            }).join(', ');
            break;
          case 'group':
            resp.value = data.fields[attrib].name || '';
            break;
          case 'array|group':
          case 'array|versions':
            resp.value = data.fields[attrib].map(function (el) {
              return (el.name || 'n/a');
            }).join(', ');
            break;
          case 'versions':
            resp = {
              value: data.fields[attrib].name,
              format: (data.fields[attrib].released == true) ? '@[green]' : ''
            };
            break;

          default:
            debug.log('unifyIssueAttrib(%s) no format defined yet for custom field.(02)', attrib);
            resp.value = data[attrib] || data.fields[attrib];
            break;
        }

      } else {
        debug.info('unifyIssueAttrib(%s) is custom field, but no format defined in customFields:%s.', attrib, customFields);
        resp.value = data.fields[attrib] || data[attrib];
      }

      return resp;
    }

    // regular fields
    switch (attrib) {
      case 'status':
        resp = {
          value: data.fields.status.name || 'n/a',
          // #206
          //color: data.fields.status.statusCategory.colorName || 'black',
          //format: '@[' + (data.fields.status.statusCategory.colorName || 'black') + ']'
        };
        break;
      case 'resolution':
        resp = {
          value: data.fields.resolution ? (data.fields.resolution.name || '') : '',
          // #206
          //format: '@[green]'
        };
        break;
      case 'key':
        resp = {
          value: data.key || 'n/a',
          link: getCfg_('jira_url') + "/browse/" + data.key
        };
        break;
      // simple string value
      case 'summary':
      case 'description':
      case 'environment':
      case 'fromString': // changelog fields.fromString
      case 'toString':   // changelog fields.toString
      case 'field':      // changelog fields.field
        resp.value = data.fields[attrib] || '';
        break;
      case 'issuetype':
        resp = {
          value: data.fields.issuetype.name || '',
          subtask: data.fields.issuetype.subtask || false,
          iconUrl: data.fields.issuetype.iconUrl || ''
        };
        break;
      case 'assignee':
      case 'creator':
      case 'reporter':
        resp = {
          value: '',
          avatarUrls: ''
        };
        if (data.fields[attrib] != null && data.fields[attrib] != undefined) {
          resp = {
            value: data.fields[attrib].displayName || 'Unknown',
            avatarUrls: data.fields[attrib].avatarUrls['24x24'] || ''
          };
        }
        break;
      case 'priority':
        resp = {
          value: data.fields.priority.name || 'n/a',
          iconUrl: data.fields.priority.iconUrl || ''
        };
        break;
      case 'updated':
      case 'created':
      case 'resolutiondate':
      case 'lastViewed':
        resp = {
          value: data.fields[attrib] || null,
          date: getDateFromIso(data.fields[attrib]),
          format: "dd.mm.yyyy hh:mm"
        };
        break;
      case 'duedate':
        // very dirty - just cant get arround timezone issue when date is in format 'YYYY-MM-DD'
        // @TODO: require proper generic solution for this
        var _duedate = data.fields.duedate || null;
        if (_duedate != null) {
          _duedate = (_duedate.length == 10) ? _duedate + 'T12:00:00' : _duedate;
          resp = {
            value: _duedate,
            date: getDateFromIso(_duedate),
            format: "dd.mm.yyyy"
          };
        } else {
          resp = {
            value: ""
          };
        }
        break;
      case 'timespent':
      case 'timeestimate':
      case 'timeoriginalestimate':
      case 'aggregatetimespent':
      case 'aggregatetimeestimate':
      case 'aggregatetimeoriginalestimate':
      case 'remainingEstimate':
        resp = {
          value: (UserStorage.getValue('dspdurationas') == "w") ? formatTimeDiff(parseInt(data.fields[attrib]) || 0) : parseInt(data.fields[attrib]) || 0
        };
        break;
      case 'project':
        resp = {
          value: data.fields.project.name
        };
        break;
      case 'labels':
        resp = {
          value: data.fields.labels.join(',')
        };
        break;
      case 'components':
      case 'fixVersions':
      case 'versions':
        // array of objects with element name in property 'name'
        resp = {
          value: data.fields[attrib].map(function (value) {
            return value.name;
          }).join(', ')
        };
        break;
      case 'aggregateprogress':
      case 'progress':
        var percent = data.fields[attrib].percent || 0;
        percent = Utilities.formatString("%.Xf%".replace('X', 0), percent);
        resp = {
          value: percent,
          format: "0%"
        };
        break;
      case 'workratio':
        resp = {
          value: parseInt(data.fields[attrib]) / 100 || 0,
          format: "0%"
        };
        break;
      case 'user':
      case 'author':
        resp = {
          displayName: data.displayName + (data.active == true ? '' : ' (X)'),
          name: data.name || null,
          emailAddress: data.emailAddress,
          accountId: data.accountId || null,
          active: data.active,
          value: data.displayName,
          format: "@"
        };
        break;
      case 'group':
        var _dName = (data.labels.length > 0) ? data.labels[0].text : data.name;
        resp = {
          displayName: _dName,
          name: data.name,
          value: _dName,
          format: "@"
        };
        break;
      case 'userMin':
        resp = {
          displayName: data.displayName + (data.active == true ? '' : ' (X)'),
          name: data.name || '',
          accountId: data.accountId || '',
          active: data.active,
        };
        break;
      case 'groupMin':
        var _dName = (data.labels.length > 0) ? data.labels[0].text : data.name;
        resp = {
          displayName: _dName,
          name: data.name,
        };
        break;
      case 'votes':
        resp = {
          value: data.fields[attrib].votes,
          format: '0',
        };
        break;
      case 'watches':
        resp = {
          value: data.fields[attrib].watchCount || 0,
          format: '0',
        };
        break;

      default:
        debug.info('unifyIssueAttrib(' + attrib + ') no format defined yet.(01)');
        resp.value = data[attrib] || data.fields[attrib];
        break;
    }
  } catch (e) {
    debug.error("Error in unifyIssueAttrib field '" + attrib + "' exception " + e);
    debug.log(JSON.stringify(e));
    debug.log(JSON.stringify(data));
  }

  return resp;
}

/**
 * Fetches a JIRA issue from the REST API
 * @desc Get single jira issue data from api, calling method 'issueStatus'
 * @return {object}    Returns json object of issue
 */
function getIssue(issueKey, fields) {
  var response = {
    'data': [],
    'status': -1,
    'errorMessage': ''
  };

  var ok = function (resp, httpResp, status) {
    if (resp && resp.fields) {
      response = {
        'data': resp.issues || resp,
        'status': status,
        'errorMessage': resp.hasOwnProperty('warningMessages') ? resp.warningMessages : 'No results found.'
      };
    } else {
      // Something funky is up with the JSON response.
      debug.error("Failed to retrieve issue data for ID [" + issueKey + "]! resp:%s; httpResp:%s; status:%s", resp, httpResp, status);
    }
  };

  var error = function (resp, httpResp, status) {
    debug.error('[%s] %s - %s', status, resp, httpResp);

    var msgs = resp.hasOwnProperty('errorMessages') ? resp.errorMessages : [];
    msgs = msgs.concat((resp.hasOwnProperty('warningMessages') ? resp.warningMessages : []));

    response.status = status;
    response.errorMessage = msgs.join("\n");
  };

  var request = new Request();
  var requestParams = { issueIdOrKey: issueKey };
  if (fields != null) {
    requestParams["fields"] = fields;
  }
  request.call('issueStatus', requestParams)
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return response;
}

// Node required code block
module.exports = {
  getIssue: getIssue,
  unifyIssueAttrib: unifyIssueAttrib,
  getTicketSheet: getTicketSheet,
  sheetIdPropertySafe: sheetIdPropertySafe
};

// End of Node required code block
