// Node required code block

// End of Node required code block

/**
 * @file Contains class for rendering jira timesheet tables
 */

/**
 * @desc Creates a new TimesheetTableRenderer_ instance (Default), which is used
 *       to insert an timesheet table.
 * @param options
 *          {object} { sheet: <active sheet to use for inserting table>,
 *          periodFrom: Date object of period starting date periodTo: Date
 *          object of period end date periodInterval: Interval to list period in
 *          columns ('day', 'week') periodFormat: Date format to use for period
 *          column headers }
 * @return {TimesheetTableRendererLayout02_}
 * @constructor
 */
function TimesheetTableRendererLayout02_(options) {
  this.name = 'TimesheetTableRendererLayout02_';
  this.timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  var that = this, // clear encapsulation of scope's
    sheet, initRange, currentRowIdx = 0, numIssueRows = 0,
    dataRowFields = ['issuetype', 'key', 'summary', 'priority', 'author'],
    numColumns = 0,
    periodCfg = {
      'from'    : null,
      'to'      : null,
      'interval': 'day',
      'format'  : "yyyy-MM-dd"
    },
    periodTotals = {}, rowTimesTpl = {},
    worklogFormatFn = formatTimeDiff,
    author = 'n/a';

  /**
   * @desc Initialization, validation
   * @throws Error,ReferenceError
   * @throws ReferenceError
   */
  init = function() {
    debug.log(this.name + '.init()');
    sheet = options.sheet ? options.sheet : getTicketSheet();
    initRange = sheet.getActiveCell();
    currentRowIdx = initRange.getRow(), currentColIdx = initRange.getColumn();
    numColumns = 7; // number of columns our table with consist of

    if (!options.periodFrom || !isDate(options.periodFrom)) {
      throw new Error(
          '{periodFrom} in options has to be defined of type Date().');
    }
    if (!options.periodTo || !isDate(options.periodTo)) {
      throw new Error('{periodTo} in options has to be defined of type Date().');
    }

    periodCfg.from = options.periodFrom;
    periodCfg.to = options.periodTo;

    if (options.periodInterval
        && (options.periodInterval === 'day' || options.periodInterval === 'week')) {
      periodCfg.interval = options.periodInterval;
    }
    periodCfg.format = (options.periodFormat === 'week') ? "'w'w ''yy"
        : periodCfg.format;

    // periods and their sub totals
    var _dateIdx = periodCfg.from, _period;
    while (_dateIdx <= periodCfg.to) {
      periodTotals[Utilities.formatDate(_dateIdx, 'UTC', 'yyyy-MM-dd')] = 0; // init total seconds of work
      // add 1 day or 1 week to date
      _dateIdx = new Date(_dateIdx.setTime(_dateIdx.getTime()
          + (periodCfg.interval == 'week' ? 7 : 1) * 86400000));
    }
    // set row times tpl
    rowTimesTpl = JSON.parse(JSON.stringify(periodTotals));
  };

  init();

  /* -------- */

  /**
   * @desc Set function to be passed on every worklog time spent. For formatting
   *       of time.
   * @param fn
   *          {Function}
   * @return {this} Allow chaining
   */
  this.setWorktimeFormat = function(fn) {
    debug.log(this.name + '.setWorktimeFormat()');
    worklogFormatFn = fn || formatTimeDiff;

    return this;
  };

  /**
   * @desc Header of table (2 lines)
   * @param authorName
   *          {String} Name of author we searched worklogs for
   * @param title
   *          {String} Table title; default:'Time Sheet'
   * @return {this} Allow chaining
   */
  this.addHeader = function(authorName, title) {
    debug.log(this.name + '.addHeader()');
    var formats     = Array(numColumns).fill('bold'),
        fontColors  = Array(numColumns).fill('#000'),
        bgColors    = Array(numColumns).fill('#3399ff')
    ;

    author = authorName; // store for later use

    // header row
    values = Array('Date', 'Type', 'Key', 'Summary', 'P', 'Author', 'Effort');
    bgColors = Array(values.length).fill('#fff');

    range = sheet.getRange(currentRowIdx++, currentColIdx, 1, values.length);
    range.clearContent()
      .clearNote()
      .clearFormat()
      .setBackgrounds([ bgColors ])
      .setValues([ values ])
      .setFontWeights([ formats ]);

    // "Type"+"Priority" column to be centered
    sheet.getRange(currentRowIdx - 1, currentColIdx + 1, 1, 1)
        .setHorizontalAlignment('center');
    sheet.getRange(currentRowIdx - 1, currentColIdx + 4, 1, 1)
        .setHorizontalAlignment('center');

    // "Date"+"Effort" col align right
    sheet.getRange(currentRowIdx - 1, currentColIdx, 1, 1)
        .setHorizontalAlignment('right');
    sheet.getRange(currentRowIdx - 1, currentColIdx + values.length - 1, 1, 1)
        .setHorizontalAlignment('right');

    // set cell widths
    sheet.setColumnWidth(currentColIdx, 100);
    sheet.setColumnWidth(currentColIdx + 1, 35);
    sheet.setColumnWidth(currentColIdx + 2, 80);
    sheet.setColumnWidth(currentColIdx + 3, 240);
    sheet.setColumnWidth(currentColIdx + 4, 20);
    sheet.setColumnWidth(currentColIdx + 5, 120);
    sheet.setColumnWidth(currentColIdx + 6, 100);

    SpreadsheetApp.flush();

    return this;
  };

  /**
   * @desc Add Table footer
   * @return {this} Allow chaining
   */
  this.addFooter = function() {
    debug.log(this.name + '.addFooter()');
    // no footer for this layout
    return this;
  }

  /**
   * @desc Add individual timesheet/worklog row to table. Called for each single
   *       issue. Does add multiple rows per issue depending on worklogs.
   * @param issue
   *          {Object} JSON response object of an jira issue
   * @param worklogs
   *          {ArrayOfObjects} Array of JSON objects from Jira worklog search
   *          response
   * @return {this} Allow chaining
   */
  this.addRow = function(issue, worklogs) {
    debug.log(this.name + '.addRow()');
    var rowTimes    = JSON.parse(JSON.stringify(rowTimesTpl)), // we want a clone and not a reference
        dataRows    = {},
        values      = [],
        formats     = Array(numColumns).fill('@'),
        fontColors  = Array(numColumns).fill('#000'),
        bgColors    = Array(numColumns).fill('#fff')
    ;

    // add timespent to issues period totals
    worklogs.filter(function(worklog) {
      var _period = Utilities.formatDate(new Date(worklog.started), 'UTC',
          'yyyy-MM-dd');
      if (rowTimes[_period] === undefined) {
        // not interested in this period
        return false;
      }

      if (dataRows[_period] == undefined) {
        dataRows[_period] = 0;
      }

      dataRows[_period] += parseInt(worklog.timeSpentSeconds);

      return true;
    });

    // for each period we calculated we generate a row with issue details
    for ( var sumPeriod in dataRows) {
      values = []; // row cell calues
      // date/period in first cell
      var _humanPeriodStr = Utilities.formatDate(new Date(sumPeriod
          + 'T00:00:00.000+0000'), this.timezone, periodCfg.format)
      values.push(_humanPeriodStr);

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
        case 'author':
          _val = author;
          break;
        default:
          _val = _val.value;
          break;
        }

        values.push(_val);
      });

      // time spent / effort in last cell
      values.push(worklogFormatFn(dataRows[sumPeriod]));

      range = sheet.getRange(currentRowIdx++, currentColIdx, 1, values.length);
      range.clearContent()
        .clearNote()
        .clearFormat()
        .setBackgrounds([ bgColors ])
        .setValues([ values ])
        .setFontWeights([ formats ])
        .activate();
      
      if (issue.cellNote) {
        // cell of summary text; add note and change color
        range.getCell(1, 4).setNote(issue.cellNote.message || '').setFontColor(
            issue.cellNote.color);
      }

      ++numIssueRows;
    }

    SpreadsheetApp.flush();

    return this;
  };

  /**
   * @desc onComplete - post creation activity like content sorting.
   * @return {this} Allow chaining
   */
  this.onComplete = function() {
    debug.log(this.name + '.onComplete()');

    var _dataRowStart = initRange.getRow() + 1,
      _dataColStart = initRange.getColumn(),
      _dataRowEnd = currentRowIdx - 1,
      _dataColEnd = _dataColStart + values.length - 1,
      _numRows    = _dataRowEnd - _dataRowStart + 1,
      _numCols    = _dataColEnd - _dataColStart + 1;

    // sort ASC by 1st columns ("Date")
    sheet.getRange(_dataRowStart, _dataColStart, _numRows, _numCols).sort(_dataColStart);

    // "Type"+"Priority" column to be centered
    sheet.getRange(_dataRowStart, _dataColStart + 1, _numRows, 1).setHorizontalAlignment('center');
    sheet.getRange(_dataRowStart, _dataColStart + 4, _numRows, 1).setHorizontalAlignment('center');

    // "Date"+"Effort" col align right
    sheet.getRange(_dataRowStart, _dataColStart, _numRows, 1).setHorizontalAlignment('right');
    sheet.getRange(_dataRowStart, _dataColEnd, _numRows, 1).setHorizontalAlignment('right');

    return this;
  };

}

// Node required code block
module.exports = {
  TimesheetTableRendererLayout02_ : TimesheetTableRendererLayout02_
}
// End of Node required code block
