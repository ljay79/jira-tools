// Node required code block

// End of Node required code block

/**
 * @file Contains class for rendering jira timesheet tables
 */

/**
 * @desc Creates a new ChangelogTableRenderer_ instance (Default), which is used
 *       to insert an timesheet table.
 * @param options
 *          {object} { sheet: <active sheet to use for inserting table>,
 *          periodFrom: Date object of period starting date periodTo: Date
 *          object of period end date periodInterval: Interval to list period in
 *          columns ('day', 'week') periodFormat: Date format to use for period
 *          column headers }
 * @return {ChangelogTableRendererLayout01_}
 * @constructor
 */
function ChangelogTableRendererDefault_(options) {
  this.name = 'ChangelogTableRendererDefault_';
  this.timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  var that = this, // clear encapsulation of scope's
    sheet, initRange, currentRowIdx = 0, numIssueRows = 0,
    dataRowFields = ['key', 'issuetype', 'field', 'created', 'from', 'to'],
    numColumns = 0;

  /**
   * @desc Initialization, validation
   * @throws Error,ReferenceError
   * @throws ReferenceError
   */
  init = function() {
    debug.log(this.name + '.Init()');
    sheet = options.sheet ? options.sheet : getTicketSheet();
    initRange = sheet.getActiveCell();
    currentRowIdx = initRange.getRow(), currentColIdx = initRange.getColumn();

    // number of columns our table with consist of
    numColumns = dataRowFields.length + 1;
  };

  init();

  /**
   * @desc Header of table (2 lines)
   * @param author
   *          {String} Name of author we searched worklogs for
   * @param title
   *          {String} Table title; default:'Time Sheet'
   * @return {this} Allow chaining
   */
  this.addHeader = function(author, title) {
    debug.log(this.name + '.addHeader()');
    title = title || 'Changelog Sheet';

    var values = Array(numColumns - 1).fill(''); // empty row of values
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
    values = Array(dataRowFields.length - 1).fill('');
    values.unshift('Summary for "' + author + '"');

    // attach period head lines
    // for ( var key in periodTotals) {
    //   values.push(Utilities.formatDate(new Date(key + 'T00:00:00.000+0000'), this.timezone, periodCfg.format));
    // }
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
    sheet.getRange(currentRowIdx - 1, currentColIdx + dataRowFields.length - 1,
      1, values.length - dataRowFields.length + 1).setHorizontalAlignment(
      "center");

    // set cell widths
    sheet.setColumnWidth(currentColIdx, 30);
    sheet.setColumnWidth(currentColIdx + 1, 80);
    sheet.setColumnWidth(currentColIdx + 2, 240);
    sheet.setColumnWidth(currentColIdx + 3, 30);

    SpreadsheetApp.flush();

    return this;
  };

  /**
   * @desc Add Table footer
   * @return {this} Allow chaining
   */
  this.addFooter = function() {
    debug.log(this.name + '.addFooter()');
    var values = Array(dataRowFields.length - 1).fill('');
    values.unshift('Total (' + numIssueRows + ' issues):');
    var formats     = Array(numColumns).fill('bold'),
      fontColors  = Array(numColumns).fill('#000'),
      bgColors    = Array(numColumns).fill('#3399ff')
    ;
    debug.log('periodTotals: [%s]', periodTotals);

    // set totals on each period column + overall total column
    var _totalTimeSpent = 0;
    for ( var key in periodTotals) {
      _totalTimeSpent += periodTotals[key];
      values.push(worklogFormatFn(periodTotals[key]));
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
    sheet.getRange(currentRowIdx - 1, currentColIdx + dataRowFields.length - 1,
      1, values.length - dataRowFields.length + 1).setHorizontalAlignment(
      "center");
    sheet.getRange(currentRowIdx - 1, values.length).setHorizontalAlignment(
      "right");

    SpreadsheetApp.flush();

    // set width of period columns
    for (var c = (dataRowFields.length + 1); c <= values.length; c++) {
      sheet.setColumnWidth(c, 70);
    }

    return this;
  }

  /**
   * @desc Add individual timesheet/worklog row to table
   * @param issue
   *          {Object} JSON response object of an jira issue
   * @param changelogs
   *          {ArrayOfObjects} Array of JSON objects from Jira worklog search
   *          response
   * @return {this} Allow chaining
   */
  this.addRow = function(issue, changelogs) {
    debug.log(this.name + '.addRow()');
    var rowTotal    = 0,
      values      = [],
      formats     = Array(numColumns).fill('@'),
      fontColors  = Array(numColumns).fill('#000'),
      bgColors    = Array(numColumns).fill( (currentRowIdx % 2) ? '#fff' : '#e6ffe6')
    ;

    // add timespent to issues period totals
    changelogs.forEach(function(changelog) {
      var _period = Utilities.formatDate(new Date(changelog.started), 'UTC',
        'yyyy-MM-dd');
    });

    // add jira issue data to first columns with some custom cell formatters
    dataRowFields.forEach(function(field) {
      var _val = unifyIssueAttrib(field, issue);
      switch (field) {
        case 'issuetype':
        case 'key':
          _val = '=HYPERLINK("' + _val.link + '";"' + _val.value + '")';
          break;
        default:
          _val = _val.value;
          break;
      }

      values.push(_val);
    });


    values.push("foobar"); // row total
    formats[formats.length - 1] = 'bold';

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
      range.getCell(1, 3).setNote(issue.cellNote.message || '').setFontColor(
        issue.cellNote.color);
    }

    // 1st col IssueTypeIcon align center
    sheet.getRange(currentRowIdx - 1, 1, 1, 1).setHorizontalAlignment("center");
    // all period and total columns to be centered
    sheet.getRange(currentRowIdx - 1, currentColIdx + dataRowFields.length - 1,
      1, values.length - dataRowFields.length).setHorizontalAlignment(
      "center");
    sheet.getRange(currentRowIdx - 1, values.length, 1, values.length)
      .setHorizontalAlignment("right");

    ++numIssueRows;

    SpreadsheetApp.flush();

    return this;
  };

  /**
   * @desc onComplete - post creation activity like content sorting.
   * @return {this} Allow chaining
   */
  this.onComplete = function() {
    debug.log(this.name + '.onComplete()');
    return this;
  };

}

// Node required code block
module.exports = {
  ChangelogTableRendererDefault_ : ChangelogTableRendererDefault_
}
// End of Node required code block
