/* Worklog Sheet Table(s) */
/*function test() {
  createWorklog({
    'wlAuthorName': 'Jens Rosemeier',
    'wlAuthorU'  : 'jrosemeier',
    'wlStartDate': '2017-07-30',
    'wlEndDate'  : '2017-08-05'
  });
}*/


/**
 * @desc Form handler for dialogWorklog. Fetch worklog data and create table.
 * @param jsonFormData {object}  JSON Form object of all form values
 * @return void
 */
function createWorklog(jsonFormData) {
  jsonFormData = jsonFormData || {
    wlAuthorName: undefined,
    wlAuthorU  : undefined,
    wlAuthorG  : undefined,
    wlStartDate: undefined,
    wlEndDate  : undefined,
    wlTimeFormat: 1
  };
  var response = {status: false, response: ''},
      wlQuery = '', 
      wlDateTo = new Date(),
      wlDateFrom = new Date();

  // filter dates - defaults
  wlDateFrom.setDate(wlDateTo.getDate() - 7); // from = now() - 7 days

  // from dialog
  if( jsonFormData.wlStartDate ) {
    wlDateFrom = new Date(jsonFormData.wlStartDate);
  }
  if( jsonFormData.wlEndDate ) {
    wlDateTo = new Date(jsonFormData.wlEndDate);
  }
    
  var _d = wlDateFrom;
  if( Date.parse(_d) > Date.parse(wlDateTo) ) {
    wlDateFrom = wlDateTo;
    wlDateTo   = _d;
  }
  wlQuery += 'worklogDate>="' + wlDateFrom.toISOString().substring(0, 10) +'" ' + 
    'AND worklogDate<="' + wlDateTo.toISOString().substring(0, 10) + '"';

  if(jsonFormData.wlAuthorG) {
    wlQuery += ' AND worklogAuthor in membersOf("' + jsonFormData.wlAuthorG + '")';
  } else {
    wlQuery += ' AND worklogAuthor="' + jsonFormData.wlAuthorU + '"';
  }
  
  var authorName = jsonFormData.wlAuthorName ? jsonFormData.wlAuthorName : (
    jsonFormData.wlAuthorG ? jsonFormData.wlAuthorG : jsonFormData.wlAuthorU
  );
  
  /* Get all affected jira issues */

  /* OnSucess, start prepping Timesheet Table and perform subsequent api searches for all worklogs per individual jira issue */
  var onSuccess = function(resp, status, errorMessage) {
    debug.log('Issue with worklogs founds: %s !', resp.data.length);
    debug.log('%s %s %s', JSON.stringify(resp), status, errorMessage);

    if(resp.data.length == 0) {
      Browser.msgBox("Jira Worklog",
                     "Apparently there are no issues with worklogs available for \"" + authorName + "\" in the requested time period.", 
                     Browser.Buttons.OK);
      return;
    }

    // prep new TimesheetTable then request actual worklogs
    var timeSheetTable = new TimesheetTable1({
      periodFrom: wlDateFrom,
      periodTo:   wlDateTo
    });
    timeSheetTable.setWorktimeFormat( (parseInt(jsonFormData.wlTimeFormat)==1 ? formatTimeDiff : formatWorkhours) );
    timeSheetTable.addHeader(authorName, 'Time Sheet');

    // foreach jira issue, fetch worklogs and fill sheet row
    (resp.data || []).forEach(function(issue, index) {
      debug.log('============= (data || []).forEach() ================='); 
      debug.log('issue= icon:%s; key:%s; summary:%s; priority:%s ', 
        unifyIssueAttrib('issuetype', issue),
        unifyIssueAttrib('key', issue),
        unifyIssueAttrib('summary', issue),
        unifyIssueAttrib('priority', issue)
      );

      // perform worklog request
      var request = new Request();
      request.call('worklogOfIssue',{issueIdOrKey: issue.id})
        .withFailureHandler(function(resp, httpResp, status) {
          debug.error("Failed to retrieve worklogs for issue with status [%s]!\\n" + resp.errorMessages.join("\\n"), status);
        })
        .withSuccessHandler(function(resp, httpResp, status) {
          // we have all logs here for 1 jira issue
          if(!resp) { return; }

          // get only the data we need and safe sme bytes
          var worklogs = resp.worklogs.filter(function(wlog) { // get only logs for user we searched for
            // remove some unused props
            if(wlog.updateAuthor) wlog.updateAuthor = undefined;
            if(wlog.author.avatarUrls) wlog.author.avatarUrls = undefined;

            //@TODO: make compatible with worklogs of groups ( memberOf("") )
            return wlog.author.name === jsonFormData.wlAuthorU;
          })/*.forEach(function(wlog){ // pass to table, add row
            timeSheetTable.addRow(issue, {
              "started": wlog.started,
              "authorName": wlog.author.name,
              "timeSpentSeconds": wlog.timeSpentSeconds
            });
          })*/
          ;

          timeSheetTable.addRow(issue, worklogs);

        }); // END: withSuccessHandler()
      //END: request.call('worklogOfIssue') 
    });//END: (resp.data || []).forEach()

    // add table footer
    timeSheetTable.addFooter();
  }; //END: onSuccess()

  var onFailure = function(resp, status , errorMessage) {
    debug.error('worklog::onFailure: resp:%s status:%s msg:%s', resp, status, errorMessage);
    Browser.msgBox("Jira Worklog",
                   "Failure during request to Jira server.\\nStatus:" + (status||-1) + " \\nMessage:'" + errorMessage + "'", 
                   Browser.Buttons.OK);
  };

  // Search API returns max 20 worklogs per issue - we have to get worklog 
  // indiv. per issue later in iterated requests - see onSuccess handler
  var search = new Search(wlQuery);
  search.setOrderBy('created', 'DESC')
        .setFields(['id','key','issuetype','priority','status','summary']);

  search.search()
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
  ;
}


/**
 * @desc
 * @param options {object}  
 *        {
 *          sheet: <active sheet to use for inserting table>,
 *          periodFrom: Date object of period starting date
 *          periodTo:   Date object of period end date
 *          periodInterval: Interval to list period in columns ('day', 'week')
 *          periodFormat: Date format to use for period column headers
 *        }
 * @return {TimesheetTable1}
 */
function TimesheetTable1(options) {
  var sheet, initRange, currentRowIdx = 0, numIssueRows = 0,
      dataRowFields = ['issuetype', 'key', 'summary', 'priority'],
      numColumns = 0,
      periodCfg = {
        'from'    : null,
        'to'      : null,
        'interval': 'day',
        'format'  : "EEE\n d/MMM"
      },
      periodTotals = {}, rowTimesTpl = {},
      worklogFormatFn = formatTimeDiff;

  /**
   * @desc Initialization, validation
   */
  this.init = function(options) {
    sheet         = options.sheet ? options.sheet : getTicketSheet();
    initRange     = sheet.getActiveCell();
    currentRowIdx = initRange.getRow(), currentColIdx = initRange.getColumn();

    if ( !options.periodFrom || !isDate(options.periodFrom)) {
      throw '{periodFrom} in options has to be defined of type Date().';
    }
    if ( !options.periodTo || !isDate(options.periodTo)) {
      throw '{periodTo} in options has to be defined of type Date().';
    }

    periodCfg.from = options.periodFrom;
    periodCfg.to = options.periodTo;

    if ( options.periodInterval && (options.periodInterval === 'day' || options.periodInterval === 'week')) {
      periodCfg.interval = options.periodInterval;
    }
    periodCfg.format = (options.periodFormat === 'week') ? "'w'w ''yy" : periodCfg.format;

    // periods and their sub totals
    var _dateIdx = periodCfg.from, _period;
    while(_dateIdx <= periodCfg.to) {
      periodTotals[Utilities.formatDate(_dateIdx, 'UTC', 'yyyy-MM-dd')] = 0; // init total seconds of work
      // add 1 day or 1 week to date
      _dateIdx = new Date(_dateIdx.setTime(_dateIdx.getTime() + (periodCfg.interval == 'week' ? 7 : 1) * 86400000));
    }
    // set row times tpl
    rowTimesTpl = JSON.parse(JSON.stringify(periodTotals));

    // number of columns our table with consist of
    numColumns = dataRowFields.length + Object.keys(periodTotals).length + 1; // count = data cols + periods + 1 row total
  };

  /**
   * @desc Set function to be passed on every worklog time spent. For formatting of time.
   * @param fn {Function}
   * @return {this}    Allow chaining
   */
  this.setWorktimeFormat = function(fn) {
    worklogFormatFn = fn || formatTimeDiff;
  };

  /**
   * @desc Header of table (2 lines)
   * @param author {String}    Name of author we searched worklogs for
   * @param title {String}     Table title; default:'Time Sheet'
   * @return {this}    Allow chaining
   */
  this.addHeader = function(author, title) {
    title = title || 'Time Sheet';

    var values = Array(numColumns-1).fill(''); // empty row of values
        values.unshift(title); // set title to 1st cell
    var formats     = Array(numColumns).fill('bold'),
        fontColors  = Array(numColumns).fill('#000'),
        bgColors    = Array(numColumns).fill('#3399ff')
    ;

    // header
    range = sheet.getRange(currentRowIdx++, currentColIdx, 1, values.length);
    range.clearContent()
      .clearNote()
      .clearFormat()
      .setBackgrounds([ bgColors ])
      .setFontColors([ fontColors ])
      .setValues([ values ])
      .setFontWeights([ formats ]);

    // 2. row - sub title
    values = Array(dataRowFields.length-1).fill('');
    values.unshift('Summary for "' + author + '"');
    // attach period head lines
    var _tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();

    for(var key in periodTotals) {
      values.push( Utilities.formatDate(new Date(key + 'T00:00:00.000+0000'), _tz, periodCfg.format) );
    }
    values.push('Total');

    bgColors = Array(numColumns).fill('#fff');

    range = sheet.getRange(currentRowIdx++, currentColIdx, 1, values.length);
    range.clearContent()
      .clearNote()
      .clearFormat()
      .setBackgrounds([ bgColors ])
      .setValues([ values ])
      .setFontWeights([ formats ]);

    // all period and total columns to be centered
    sheet.getRange(currentRowIdx-1, currentColIdx+dataRowFields.length-1, 1, values.length-dataRowFields.length+1).setHorizontalAlignment("center");

    // set cell widths
    sheet.setColumnWidth(currentColIdx, 30);
    sheet.setColumnWidth(currentColIdx+1, 80);
    sheet.setColumnWidth(currentColIdx+2, 240);
    sheet.setColumnWidth(currentColIdx+3, 30);
    
    SpreadsheetApp.flush();

    return this;
  };

  /**
   * @desc Add Table footer
   * @return {this}    Allow chaining
   */
  this.addFooter = function() {
    var values = Array(dataRowFields.length-1).fill('');
        values.unshift('Total (' + numIssueRows + ' issues):');
    var formats     = Array(numColumns).fill('bold'),
        fontColors  = Array(numColumns).fill('#000'),
        bgColors    = Array(numColumns).fill('#3399ff')
    ;
    debug.log('periodTotals: [%s]', periodTotals);

    // set totals on each period column + overall total column
    var _totalTimeSpent = 0;
    for (var key in periodTotals) {
      _totalTimeSpent += periodTotals[key];
      values.push( worklogFormatFn(periodTotals[key]) );
    }
    values.push(worklogFormatFn(_totalTimeSpent));

    // footer
    range = sheet.getRange(currentRowIdx++, currentColIdx, 1, values.length);
    range.clearContent()
      .clearNote()
      .clearFormat()
      .setBackgrounds([ bgColors ])
      .setFontColors([ fontColors ])
      .setValues([ values ])
      .setFontWeights([ formats ]);

    // all period and total columns to be centered
    sheet.getRange(currentRowIdx-1, currentColIdx+dataRowFields.length-1, 1, values.length-dataRowFields.length+1).setHorizontalAlignment("center");
    sheet.getRange(currentRowIdx-1, values.length).setHorizontalAlignment("right");

    SpreadsheetApp.flush();

    // set width of period columns
    for(var c=(dataRowFields.length+1); c <= values.length; c++) {
      sheet.setColumnWidth(c, 70);
    }

    return this;
  }
  
  /**
   * @desc Add individual timesheet/worklog row to table
   * @param issue {Object}    JSON response object of an jira issue
   * @param worklogs {ArrayOfObjects}    Array of JSON objects from Jira worklog search response
   * @return {this}    Allow chaining
   */
  this.addRow = function(issue, worklogs) {
    var rowTimes    = JSON.parse(JSON.stringify(rowTimesTpl)), // bad, but we want a clone and not a reference
        rowTotal    = 0,
        values      = [],
        formats     = Array(numColumns).fill('@'),
        fontColors  = Array(numColumns).fill('#000'),
        bgColors    = Array(numColumns).fill( (currentRowIdx % 2) ? '#fff' : '#e6ffe6')
    ;

    // add timespent to issues period totals
    worklogs.forEach(function(worklog) {
      var _period = Utilities.formatDate(new Date(worklog.started), 'UTC', 'yyyy-MM-dd');
      if( rowTimes[_period] !== undefined ) {
        rowTimes[_period] += parseInt(worklog.timeSpentSeconds);
      }
    });

    // add jira issue data to first columns with some custom cell formatters
    dataRowFields.forEach(function(field) {
      var _val = unifyIssueAttrib(field, issue);
      switch (field) {
        case 'issuetype':
        case 'priority':
          _val = '=IMAGE("' + _val.iconUrl + '"; 4; 16; 16)';
          break;
        case 'key':
          _val = '=HYPERLINK("' + _val.link + '";"' + _val.value + '")';
          break;
        case 'summary':
        default:
          _val = _val.value;
          break;
      }

      values.push(_val);
    });

    // add timespent to overall period totals
    for(var key in rowTimes) {
      rowTotal += rowTimes[key];
      values.push( worklogFormatFn(rowTimes[key]) );
      if(periodTotals[key] !== undefined) {
        periodTotals[key] += parseInt(rowTimes[key]);
      }
    }

    values.push( worklogFormatFn(rowTotal) ); // row total
    formats[formats.length - 1] = 'bold';

    range = sheet.getRange(currentRowIdx++, currentColIdx, 1, values.length);
    range.clearContent()
      .clearNote()
      .clearFormat()
      .setBackgrounds([ bgColors ])
      .setValues([ values ])
      .setFontWeights([ formats ])
      .activate();

    // 1st col IssueTypeIcon align center
    sheet.getRange(currentRowIdx-1, 1, 1, 1).setHorizontalAlignment("center");
    // all period and total columns to be centered
    sheet.getRange(currentRowIdx-1, currentColIdx+dataRowFields.length-1, 1, values.length-dataRowFields.length).setHorizontalAlignment("center");
    sheet.getRange(currentRowIdx-1, values.length, 1, values.length).setHorizontalAlignment("right");

    ++numIssueRows;

    SpreadsheetApp.flush();

    return this;
  };

    
  this.init(options);
}
