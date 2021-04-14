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
    var range = sheet.getRange(initRange.getRow(), initRange.getColumn(), 1, headers.length); // obsolete?

    // loop over each resulted data (row)
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      var values = [];
      var formats = []; // http://www.blackcj.com/blog/2015/05/18/cell-number-formatting-with-google-apps-script/
      range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), 1, headers.length);

      // loop over each header (column)
      for (var j = 0; j < headers.length; j++) {
        var headerEntry = headers[j];
        values.push(row[headerEntry]);
        formats.push('@');
      } // END: header/columns loop

      // just check if values (column) length is as we expect?!
      if (values.length != numColumns) {
        for (var l = 0; l < values.length; l++) {
          values.push('');
          formats.push('@');
        }
      }

      // set values and format to cells
      range.clearContent()
        .clearNote()
        .clearFormat()
        .setValues([values])
        .setNumberFormats([formats])
        .activate();

      info.oRangeA1.to = range.getCell(range.getNumRows(), range.getNumColumns()).getA1Notation();

      // flush sheet every 25 rows (to often is bad for performance, to less bad for UX)
      if (i % 25 === 0) {
        SpreadsheetApp.flush();
      }

      issue = null;

    } // END: issue loop

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
