// Node required code block
const getSheetById = require('../../jsLib.gs').getSheetById;
const _sortKeysByRef = require('../../jsLib.gs')._sortKeysByRef;
const sheetIdPropertySafe = require('../../jiraCommon.gs').sheetIdPropertySafe;
const unifyIssueAttrib = require('../../jiraCommon.gs').unifyIssueAttrib;
const UserStorage = require('../gas/UserStorage.gs');
const IssueTable_ = require('../jira/IssueTable.gs');
const IssueFields = require('../jira/IssueFields.gs');
// End of Node required code block

/**
 * @file Contains class for rendering jira issue tables
 */

/**
 * @desc Creates a new IssueTableRenderer instance (Default), which is used to insert an table of issues into a sheet.
 * @param {IssueTable_} IssueTable The instance of IssueTable_ to render table
 * @constructor
 */
function IssueTableRendererDefault_(IssueTable) {
  var that = this, // clear encapsulation of scope's
    sheet, initRange,
    epicField = UserStorage.getValue('jst_epic'),
    issues = [], selectedFields = [], headers = [],
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
    if (typeof IssueTable !== 'object') {
      throw new Error("{IssueTable} is not a valid instance of class IssueTable_.");
    }
    if (!IssueTable.hasOwnProperty('getMeta')) {
      throw new ReferenceError("{IssueTable} is not a valid instance of class IssueTable_. Implementation of method 'getMeta' missing.");
    }
    if (!IssueTable.hasOwnProperty('getIssues')) {
      throw new ReferenceError("{IssueTable} is not a valid instance of class IssueTable_. Implementation of method 'getIssues' missing.");
    }

    issues = IssueTable.getIssues();
    if (typeof issues !== 'object') {
      throw new Error("{IssueTable.getIssues()} must return an array but returned " + (typeof issues) + ".");
    }

    selectedFields = IssueTable.getMeta('headerFields');

    if (!issues[0].hasOwnProperty('fields')) {
      throw new ReferenceError("{IssueTable.getIssues()} did not return a valid Jira issues response object. [" + issues + "]");
    }

    var sheetId = sheetIdPropertySafe(IssueTable.getSheetId(), true);
    sheet = getSheetById(sheetId);
    if (typeof sheet !== 'object') {
      throw new ReferenceError("Could not find Sheet by given sheetId [" + sheetId + "].");
    }
  };

  init();

  /* -------- */

  /**
   * @desc Rendering the issues into a table in defined sheet.
   * @return {IssueTableRendererDefault_}
   */
  that.render = function () {
    debug.time('IssueTableRendererDefault_.render()');

    prepareHeaderValues();

    if (null === IssueTable.getMeta('rangeA1')) {
      initRange = sheet.getActiveRange();
    } else {
      initRange = sheet.setActiveSelection(IssueTable.getMeta('rangeA1'));
    }

    // save the range coords for info object
    info.oRangeA1.from = initRange.getCell(1, 1).getA1Notation();
    info.oRangeA1.to = initRange.getCell(initRange.getNumRows(), initRange.getNumColumns()).getA1Notation();

    if (filterName = IssueTable.getMeta('filter').name) {
      that.addSummary("Filter: " + filterName);
    }

    that.addHeader().fillTable();

    debug.timeEnd('IssueTableRendererDefault_.render()');
    debug.log('IssueTableRendererDefault_.render() <- finished rendering %s issues with %s columns.', info.totalInserted, numColumns);

    info.finishRendering = true;

    return that;
  };

  /**
   * @desc Adding a summary line
   * @param {string} summary Text to be inserted as a table summary line
   * @return this For chaining
   */
  that.addSummary = function (summary) {
    range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), 1, headers.length);

    range.clearContent()
      .clearNote()
      .clearFormat()
      .getCell(1, 1)
      .setValue(summary);

    info.oRangeA1.to = range.getCell(range.getNumRows(), range.getNumColumns()).getA1Notation();
    info.headerRowOffset = 1;

    SpreadsheetApp.flush();

    return that;
  };

  /**
   * @desc Add column headers into 1st/2nd row
   * @return this For chaining
   */
  that.addHeader = function () {
    var values = [], formats = [];

    for (var i = 0; i < headers.length; i++) {
      values.push(IssueFields.getHeaderName(headers[i]));
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
    info.totalInserted = issues.length;
    var range = sheet.getRange(initRange.getRow(), initRange.getColumn(), 1, headers.length); // obsolete?

    // loop over each resulted issue (row)
    for (var i = 0; i < issues.length; i++) {
      var issue = issues[i];
      var values = [];
      var formats = []; // http://www.blackcj.com/blog/2015/05/18/cell-number-formatting-with-google-apps-script/
      range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), 1, headers.length);

      // loop over each header (column)
      for (var j = 0; j < headers.length; j++) {
        var key = unifyIssueAttrib(headers[j], issue);

        // for some custom formatting
        switch (true) {
          case key.hasOwnProperty('date'):
            key.value = (key.value != null) ? key.date : '';
            break;
          case (key.hasOwnProperty('epic') && key.epic === true):
            if (key.value != 'n/a') {
              if (EpicField.isUsable()) {
                key.value = '=HYPERLINK("' + key.link + '"; JST_EPICLABEL("' + key.value + '"))';
              } else {
                key.value = '=HYPERLINK("' + key.link + '"; "' + key.value + '")';
              }
            }
            break;
          case key.hasOwnProperty('link'):
            key.value = '=HYPERLINK("' + key.link + '"; "' + key.value + '")';
            break;
        }

        values.push(key.value);
        formats.push(key.format || '@');
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
   * @desc Sorting the header/columns based on definition/order in global var ISSUE_COLUMNS. Improves a consistent column listing/sorting
   *       and defined fields first before alpha sorting the rest.
   * @returns {IssueTableRendererDefault_}
   */
  prepareHeaderValues = function () {
    // prep headers
    if (null !== selectedFields) {
      // selected fields are set from fitlers selected columns
      for ( var k in selectedFields) {
        if (selectedFields.hasOwnProperty(k) && EpicField.EPIC_KEY != selectedFields[k]) { 
          headers.push(selectedFields[k]);
        }
      }
    } else {
      // from first issue in result
      for ( var k in issues[0].fields) {
        headers.push(k);
      }
    }

    // sort fields based on defined order in IssueFields.getBuiltInJiraFields()
    headers = _sortKeysByRef(headers, IssueFields.getBuiltInJiraFields());
    headers.unshift('key');

    numColumns = headers.length;

    return that;
  };
}

// Node required code block
module.exports = {
  IssueTableRendererDefault_ : IssueTableRendererDefault_
}
// End of Node required code block
