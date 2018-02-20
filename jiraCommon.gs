// const not available, but better solution needed
var CELLTYPE_EMPTY = -1;
var CELLTYPE_JIRAID = 10; // entire cell includes Jira ticket id only ("JIRA-123" or "JIRA-123 [Status]")
var CELLTYPE_TEXT = 20;  // Jira ticket id is within text ("lorem ipsum JIRA-123 [Status] dolores")

// Jira issue fields/columns
var ISSUE_COLUMNS = {
  // defaults
  summary: 'Summary',
  issuetype: 'Issue Type',
  priority: 'Priority',
  status: 'Status',
  updated: 'Updated',
  created: 'Created',
  assignee: 'Assignee',
  creator: 'Creator',
  reporter: 'Reporter',
  duedate: 'Due',
  /* --- */
  labels: 'Labels',
  project: 'Project',
  fixVersions: 'Fix Version',
  components: 'Components',
  description: 'Description',
  resolution: 'Resolution',
  timespent: 'Time spent',
  timeestimate: 'Estimate', // remaining
  timeoriginalestimate: 'Original estimate',
  aggregatetimespent: 'Aggregate Time Spent',
  aggregatetimeestimate: 'Aggregate Time Estimate',
  aggregateprogress: 'Aggregate Progress',
  progress: 'Progress'
};
//@see storage.gs for jiraColumnDefault


/**
 * @desc Get current active sheet
 * @return {Sheet}
 */
function getTicketSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

/**
 * @desc Find valid Jira Ticket ID from cell value.
 *     Valid ticket id format: KEY-123
 * @param cellValue {string}
 * @return {string}    Returns Jira ticket ID if found or NULL
 */
function grepJiraTicketId(cellValue) {
  var ticketId = cellValue.match(/[A-Z]+\-\d+/);
  return (ticketId==null ? null : ticketId[0]);
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

  if(cellValue.trim() == '') {
    return cellProps;
  }

  //@TODO: regexp requires lots of tweaking

  // match: "JIRA-123"
  match = cellValue.match(/^([A-Z0-9]+\-\d+)$/);
  if(match && match.length == 2) {
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
  if(match && match.length == 3) {
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
  if(match && match.length == 6) {
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
  if(match && match.length == 3) {
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
 * @param {boolean} includeFavourites  Include users favourite filters or not
 * @return {object} Object({[id]:{name:{string}, self:{string}, favourite:{boolean}, owner:{string}, viewUrl:{string}}})
 */
function getMyFilters(includeFavourites) {
  var filters = [];

  var ok = function(responseData, httpResponse, statusCode) {
    // Check the data is valid and the Jira fields exist
    //debug.log("getMyFilters()->ok(): %s", responseData);
    if(responseData) {
      // add data to export
      filters.push.apply(filters, responseData.map(function(filter){ return {
          id: parseInt(filter.id),
          name: filter.name,
          self: filter.self,
          favourite: filter.favourite,
          owner: filter.owner.displayName,
          viewUrl: filter.viewUrl,
          jql: filter.jql
        }; }) )
      // sorting the list of filters by favourite, name
      && filters.sort(function(a, b){
          var keyA = (a.favourite ? '0' : '1') + a.name;
          var keyB = (b.favourite ? '0' : '1') + b.name;

          if (keyA < keyB)
            return -1;
          if (keyA > keyB)
            return 1;
          return 0;
        })
      ;
    } else {
      // Something funky is up with the JSON response.
      debug.error("Failed to retrieve jira filters!");
    }
  };

  var error = function(responseData, httpResponse, statusCode) {
    debug.error("Failed to retrieve jira filters with status [" + statusCode + "]!\\n" + responseData.errorMessages.join("\\n"));
  };

  var request = new Request();

  request.call("myFilters", {includeFavourites:(includeFavourites?'true':'false')})
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
      filter = {},
      request = new Request();

  var ok = function(responseData, httpResponse, statusCode){
    // Check the data is valid and the Jira fields exist
    if(responseData) {
      filter = responseData;
    } else {
      // Something funky is up with the JSON response.
      debug.info("Failed to retrieve jira filter info!");
    }
  };

  var error = function(responseData, httpResponse, statusCode) {
    debug.error("Failed to retrieve jira filter with status [" + statusCode + "]!\\n" + responseData.errorMessages.join("\\n"));
  };

  request.call(method, {filterId:filterId})
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return filter;
}

/**
 * @desc Fetch all active users and groups for dialog selection.
 * @param {boolean} minimal  Returning data only includes minimal info (displayName,name[,active])
 * @return {object} Object({"users":[{<arrayOfObjects}], "groups":[{arrayOfObjects}]})
 */
function fetchUsersAndGroups(minimal) {
  var minimal = minimal || true, 
      result = {
        "users" : [],
        "groups": findGroup('%', minimal)
      };

  result.users = findUser('%', minimal).filter(function( user ) {
    return user.active !== false;
  });
  
  result.users.sort(function(a,b) {return (a.displayName > b.displayName) ? 1 : ((b.displayName > a.displayName) ? -1 : 0);} ); 
  
  return result;
}

/**
 * @desc Helper to convert indiv. jira field/property objects 
 *       into simple objects for using as cell data.
 * @param attrib {string}
 * @param data {object}
 * @return {object}
 */
function unifyIssueAttrib(attrib, data) {
  var resp = {value: ''};

  try { // no error handling, always return a valid object

  // custom fields first
  if ( attrib.substring(0, 12) == 'customfield_' ) {
    var customFields = getCustomFields(CUSTOMFIELD_FORMAT_UNIFY);
    // custom epic
    var epicField = getVar('jst_epic');
    if (epicField.usable === true) {
      customFields[epicField.link_key] = 'jst_epic';
    }

    if (customFields.hasOwnProperty(attrib)) {
      var format = customFields[attrib];

      switch(format) {
        case 'jst_epic':
          resp = {
            epic  : true,
            value : data.fields[attrib] || 'n/a',
            link  : getCfg('jira_url') + "/browse/" + data.fields[attrib]
          };
          break;
        case 'datetime':
          var _date = data.fields[attrib] || null;
          resp = {
            value : _date,
            date  : new Date(getDateFromIso(_date)) || new Date(),
            format: "dd.mm.yyyy hh:mm"
          };
          break;
        case 'date':
          var _date = data.fields[attrib] || null;
          _date     = (_date.length == 10) ? _date + 'T12:00:00' : _date;
          var date  = new Date(getDateFromIso(_date)) || new Date();
          date.setHours(0,0,0);
          resp      = {
            value : _date,
            date  : date,
            format: "dd.mm.yyyy"
          };
          break;
        case 'number':
          resp = {
            value : parseFloat(data.fields[attrib]) || null,
            format: "0"
          };
          break;
        case 'string':
          resp.value = data.fields[attrib] || '';
          break;
        case 'option':
          resp.value = data.fields[attrib].value || 'n/a';
          break;
        case 'array|option':
          resp.value = '';
          var _values = [];
          // Try casting array to values
          if (data.fields[attrib].length > 0 && data.fields[attrib][0].hasOwnProperty('value'))
            for (var i = 0; i < data.fields[attrib].length; i++) 
              _values.push(data.fields[attrib][i].value);
          
          break;
        case 'array|string':
          resp.value = '';
          var _values = data.fields[attrib];

          // field "Sprint" is type string with custom value
          if (data.fields[attrib][0].indexOf('service.sprint.Sprint') > -1) {
            _values = [];
            var _regEx = /name=([^,]+),/gi;
            var _sprintNameArr = [];
            for (var i = 0; i < data.fields[attrib].length; i++) {
              _sprintNameArr = _regEx.exec(data.fields[attrib][i]);
              if(_sprintNameArr.length==2) _values.push(_sprintNameArr[1]);
            }
          }
          //

          resp.value = _values.join(',');

          break;
        case 'user':
          resp = {
            value: (getVar('dspuseras_name') == 1 ? data.fields[attrib].displayName : data.fields[attrib].name) || 'Unknown',
            avatarUrls: data.fields[attrib].avatarUrls['24x24'] || ''
          };
          break;
        case 'array|user':
          resp.value = data.fields[attrib].map(function(el){
            return ((getVar('dspuseras_name') == 1 ? el.displayName : el.name) || 'Unknown');
          }).join(', ');
          break;
        case 'group':
          resp.value = data.fields[attrib].name || '';
          break;
        case 'array|group':
        case 'array|version':
          resp.value = data.fields[attrib].map(function(el){
            return (el.name || 'n/a');
          }).join(', ');
          break;
        case 'version':
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
      debug.log('unifyIssueAttrib(%s) is custom field, but no format defined in customFields:%s.', attrib, customFields);
      resp.value = data.fields[attrib] || data[attrib];
    }

    return resp;
  }
  
  // regular fields
  switch(attrib) {
    case 'status':
      resp = {
        value: data.fields.status.name || 'n/a',
        color: data.fields.status.statusCategory.colorName || 'black',
        format: '@[' + (data.fields.status.statusCategory.colorName || 'black') + ']'
      };
      break;
    case 'resolution':
      resp = {
        value: data.fields.resolution.name,
        format: '@[green]'
      };
      break;
    case 'key':
      resp = {
        value: data.key || 'n/a',
        link: getCfg('jira_url') + "/browse/" + data.key
      };
      break;
    case 'summary':
    case 'description':
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
        value: (getVar('dspuseras_name') == 1 ? data.fields[attrib].displayName : data.fields[attrib].name) || 'Unknown',
        avatarUrls: data.fields[attrib].avatarUrls['24x24'] || ''
      };
      break;
    case 'priority':
      resp = {
        value: data.fields.priority.name || 'n/a',
        iconUrl: data.fields.priority.iconUrl || ''
      };
      break;
    case 'updated':
    case 'created':
      resp = {
        value: data.fields[attrib] || null,
        date: new Date(getDateFromIso(data.fields[attrib])) || new Date(),
        format: "dd.mm.yyyy hh:mm"
      };
      break;
    case 'duedate':
      // very dirty - just cant get arround timezone issue when date is in format 'YYYY-MM-DD'
      // @TODO: require proper generic solution for this
      var _duedate = data.fields.duedate || null;
      _duedate = (_duedate.length == 10) ? _duedate + 'T12:00:00' : _duedate;
      resp = {
        value: _duedate,
        date: new Date(getDateFromIso(_duedate)) || new Date(),
        format: "dd.mm.yyyy"
      };
      break;
    case 'timespent':
    case 'timeestimate':
    case 'timeoriginalestimate':
    case 'aggregatetimespent':
    case 'aggregatetimeestimate':
      resp = {
        value: parseInt(data.fields[attrib]) || 0,
        format: "0"
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
      // array of objects with element name in property 'name'
      resp = {
        value: data.fields[attrib].map(function(value) {
          return value.name;
        }).join(',')
      };
      break;
    case 'aggregateprogress':
    case 'progress':
      var percent = data.fields[attrib].percent || 0;
      percent = Utilities.formatString("%.Xf%".replace('X',0), percent);
      resp = {
        value: percent,
        format: "0%"
      };
      break;

    case 'user':
      resp = {
        displayName: data.displayName + (data.active==true?'':' (X)'),
        name: data.name,
        emailAddress: data.emailAddress,
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
        displayName: data.displayName + (data.active==true?'':' (X)'),
        name: data.name,
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

    default:
      debug.log('unifyIssueAttrib(' + attrib + ') no format defined yet.(01)');
      resp.value = data[attrib] || data.fields[attrib];
      break;
  }
  } catch (e) {}
  
  return resp;
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
  var epicField = getVar('jst_epic');
  if (epicField.usable === true) {
    labels[epicField.link_key] = 'Epic';
  }
  
  if( !labels.hasOwnProperty(header) ) {
    label = camelize(header);
  } else {
    label = labels[header];
  }

  return label;
}

/**
 * @TODO: not used yet / to be used in convertEpicCell() and further places
 * @desc Get single jira issue data from api, calling method 'issueStatus'
 * @return {object}    Returns json object of issue
 */
function getIssue(issueKey, fields) {
  var response = {
    'data': [],
    'status': -1,
    'errorMessage': ''
  };

  var ok = function(resp, httpResp, status) {
    if(resp && resp.fields) {
      response = {
        'data'             : resp.issues || resp,
        'status'           : status,
        'errorMessage'     : resp.hasOwnProperty('warningMessages') ? resp.warningMessages : 'No results found.'
      };
    } else {
      // Something funky is up with the JSON response.
      debug.error("Failed to retrieve issue data for ID [" + issueKey + "]! resp:%s; httpResp:%s; status:%s", resp, httpResp, status);
    }
  };

  var error = function(resp, httpResp, status) {
    debug.error('[%s] %s - %s', status, resp, httpResp);

    var msgs = resp.hasOwnProperty('errorMessages') ? resp.errorMessages : [];
    msgs = msgs.concat((resp.hasOwnProperty('warningMessages') ? resp.warningMessages : []));

    response.status = status;
    response.errorMessage = msgs.join("\n");
  };

  var request = new Request();
  request.call('issueStatus', {issueIdOrKey: issueKey, fields: fields})
    .withSuccessHandler(ok)
    .withFailureHandler(error);
  
  return response;
}
