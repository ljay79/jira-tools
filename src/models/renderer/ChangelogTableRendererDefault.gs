// Node required code block
const getSheetById = require('../../jsLib.gs').getSheetById;
const _sortKeysByRef = require('../../jsLib.gs')._sortKeysByRef;
const sheetIdPropertySafe = require('../../jiraCommon.gs').sheetIdPropertySafe;
const unifyIssueAttrib = require('../../jiraCommon.gs').unifyIssueAttrib;
const UserStorage = require('../gas/UserStorage.gs');
const ChangelogTable_ = require('../jira/ChangelogTable.gs');
// End of Node required code block

/**
 * @file Contains class for rendering jira changelog tables
 */

/**
 * @desc Creates a new ChangelogTableRenderer instance (Default), which is used to insert an table of data into a sheet.
 * @param {ChangelogTable_} ChangelogTable The instance of ChangelogTable_ to render table
 * @constructor
 */
function ChangelogTableRendererDefault_(ChangelogTable) {
  var that = this, // clear encapsulation of scope's
    sheet, initRange,
    data = [], headers = [],
    rowIndex = 0, numColumns = 0,
    info = {
      totalInserted : 0,
      finishRendering : false,
      oRangeA1 : {
        from : null,
        to : null
      },
      headerRowOffset : 0
    };

  /**
   * @desc Initialization, validation
   * @throws Error,ReferenceError
   * @throws ReferenceError
   */
  init = function () {
    // check data to rendering
    if (typeof ChangelogTable !== 'object') {
      throw new Error("{ChangelogTable} is not a valid instance of class ChangelogTable_.");
    }
    if (!ChangelogTable.hasOwnProperty('getMeta')) {
      throw new ReferenceError("{ChangelogTable} is not a valid instance of class ChangelogTable_. Implementation of method 'getMeta' missing.");
    }
    if (!ChangelogTable.hasOwnProperty('getData')) {
      throw new ReferenceError("{ChangelogTable} is not a valid instance of class ChangelogTable_. Implementation of method 'getData' missing.");
    }

    data = ChangelogTable.getData();
    if (typeof data !== 'object') {
      throw new Error("{ChangelogTable.getData()} must return an array but returned " + (typeof data) + ".");
    }

    var sheetId = sheetIdPropertySafe(ChangelogTable.getSheetId(), true);
    sheet = getSheetById(sheetId);
    if (typeof sheet !== 'object') {
      throw new ReferenceError("Could not find Sheet by given sheetId [" + sheetId + "].");
    }
  };

  init();

  /* -------- */

  /**
   * @desc Rendering the data into a table in defined sheet.
   * @return {ChangelogTableRendererDefault_}
   */
  that.render = function () {
    debug.time('ChangelogTableRendererDefault_.render()');

    prepareHeaderValues();

    if (null === ChangelogTable.getMeta('rangeA1')) {
      initRange = sheet.getActiveRange();
    } else {
      initRange = sheet.setActiveSelection(ChangelogTable.getMeta('rangeA1'));
    }

    // save the range coords for info object
    info.oRangeA1.from = initRange.getCell(1, 1).getA1Notation();
    info.oRangeA1.to = initRange.getCell(initRange.getNumRows(), initRange.getNumColumns()).getA1Notation();

    that.addHeader().fillTable();

    debug.timeEnd('ChangelogTableRendererDefault_.render()');
    debug.log('ChangelogTableRendererDefault_.render() <- finished rendering %s data with %s columns.', info.totalInserted, numColumns);

    info.finishRendering = true;

    return that;
  };

  /**
   * @desc Add column headers into 1st/2nd row
   * @return this For chaining
   */
  that.addHeader = function () {
    var values = [], formats = [];

    // header first row
    var filterName = ChangelogTable.getMeta('filter').name;
    values.push("Filter: " + filterName);
    formats.push('bold');
    var range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), 1, values.length);
    range.clearContent()
        .clearNote()
        .clearFormat()
        .setValues([ values ])
        .setFontWeights([ formats ]);

    //header 2.row
    values = [], formats = [];
    for (var i = 0; i < headers.length; i++) {
      values.push(headers[i]);
      formats.push('bold');
    }
    range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), 1, headers.length);

    range.clearContent()
      .clearNote()
      .clearFormat()
      .setValues([values])
      .setFontWeights([formats]);

    info.oRangeA1.to = range.getCell(range.getNumRows(), range.getNumColumns()).getA1Notation();
    info.headers = values;

    SpreadsheetApp.flush();

    return that;
  };

  /**
   * @desc Fill in all data into a sheet table with values and format
   * @return this For chaining
   */
  that.fillTable = function () {
    info.totalInserted = data.length;
    var values = [];
    var formats = []

    var range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), data.length, headers.length);

    // loop over each resulted data (row)
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var valuesRow = [];
      values.push(valuesRow);
      var formatsRow = [];
      formats.push(formatsRow);
      // loop over each header (column)
      for (var j = 0; j < headers.length; j++) {
        var headerEntry = headers[j];
        var rowEntry = row[headerEntry];
        if (rowEntry instanceof Date) {
          valuesRow.push(rowEntry);
          formatsRow.push('yyyy-MM-dd HH:mm');
        } else if (headerEntry === 'key') {
          valuesRow.push('=HYPERLINK("' + getCfg_('jira_url') + '/browse/' + rowEntry + '";"' + rowEntry +'")');
          formatsRow.push('@');
        } else {
          valuesRow.push(rowEntry);
          formatsRow.push('@');
        }
      }

      // // just check if values (column) length is as we expect?!
      // if (valuesRow.length != numColumns) {
      //   for (var l = 0; l < valuesRow.length; l++) {
      //     valuesRow.push('');
      //     formatsRow.push('@');
      //   }
      // }

      // flush sheet every 25 rows (to often is bad for performance, to less bad for UX)
      // if (i % 25 === 0) {
      //   SpreadsheetApp.flush();
      // }
      // // if there are no more rows, it will be very slow to insert a single one => so we do it for the next 1000
      // if (i === sheet.getLastRow()) {
      //   sheet.insertRowsAfter(i, 1000);
      // }

    } // END: issue loop

    // set values and format to cells
    range.clearContent()
      .clearNote()
      .clearFormat()
      .setValues(values)
      .setNumberFormats(formats)
      .activate();

    info.oRangeA1.to = range.getCell(range.getNumRows(), range.getNumColumns()).getA1Notation();

    return that;
  };

  /**
   * @desc Return Info object.
   * @return {object} {totalInserted:<{number}>, ..}
   */
  that.getInfo = function () {
    return info;
  };

  /**
   * @returns {ChangelogTableRendererDefault_}
   */
  prepareHeaderValues = function () {
    headers = ChangelogTable.getMeta('headerFields');
    numColumns = headers.length;

    return that;
  };
}

// Node required code block
module.exports = {
  ChangelogTableRendererDefault_ : ChangelogTableRendererDefault_
}
// End of Node required code block
