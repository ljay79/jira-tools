// Node required code block

// End of Node required code block

// @TOOD: probably move to own file
function RendererFactory_(RendererClassName) {
  var name = 'RendererFactory_';

  switch (RendererClassName) {
    case 'IssueTableRendererDefault_':
      return new IssueTableRendererDefault_(this);
      break;
    default:
      throw new Error("{RendererClassName} is a unknown IssueTable Renderer.");
      break;
  }
}

function IssueTableRendererDefault_(IssueTable) {
  var that = this,
    sheet, initRange,
    epicField = UserStorage.getValue('jst_epic'),
    issues = [], headers = [],
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
      throw new Error("{IssueTable.getIissues()} must return an array but returned " + (typeof issues) + ".");
    }
    if (!issues[0].hasOwnProperty('fields')) {
      throw new ReferenceError("{IssueTable.getIissues()} did not return a valid Jira issues response object. [" + issues + "]");
    }

    var sheetId = sheetIdPropertySafe(IssueTable.getSheetId(), true);
    sheet = getSheetById(sheetId);
    if (typeof sheet !== 'object') {
      throw new ReferenceError("Could not find Sheet by given sheetId [" + sheetId + "].");
    }
  };

  init();

  /* -------- */

  that.render = function () {
    debug.time('IssueTableRendererDefault_.render()');

    prepareHeaderValues();

    if (null === IssueTable.getMeta('rangeA1')) {
      initRange = sheet.getActiveRange();
    } else {
      initRange = sheet.setActiveSelection(IssueTable.getMeta('rangeA1'));
    }

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
   * @desc Adding a summary line (not yet used)
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
              if (undefined == epicField || epicField.usable === false || epicField.label_key == null) {
                key.value = '=HYPERLINK("' + key.link + '"; "' + key.value + '")';
              } else {
                key.value = '=HYPERLINK("' + key.link + '"; JST_EPICLABEL("' + key.value + '"))';
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
   * Return Info object.
   * 
   * @return {object} {totalInserted:<{number}>}
   */
  that.getInfo = function () {
    return info;
  };

  /**
   * Return array of header values
   * 
   * @return {Array}
   */
  that.getHeaders = function () {
    return headers;
  };

  /**
   * Sorting the header/columns based on definition/order in global var ISSUE_COLUMNS. Improves a consistent column listing/sorting and
   * defined fields first before alpha sorting the rest.
   * 
   * @returns {IssueTableRendererDefault_}
   */
  prepareHeaderValues = function () {
    // prep headers
    for ( var k in issues[0].fields) {
      headers.push(k);
    }

    // sort fields based on defined order in IssueFields.getBuiltInJiraFields()
    headers = _sortKeysByRef(headers, IssueFields.getBuiltInJiraFields());
    headers.unshift('key');

    numColumns = headers.length;

    return that;
  };
}

/**
 * @TODO: Move to appropiate file (not jiraCommand.gs, jsLib.gs, but where?) Get a sheet from current active Spreadsheet by ID passed.
 * @param {int|string} id The sheet id to get a Sheet for.
 * @return {undefined|Sheet}
 */
function getSheetById(id) {
  id = (typeof id === 'string') ? parseInt(id) : id;
  return SpreadsheetApp.getActive().getSheets().filter(function (s) {
    return s.getSheetId() === id;
  })[0];
}

// Node required code block
module.exports = {
  IssueTableRendererDefault_ : IssueTableRendererDefault_,
  getSheetById : getSheetById
}
// End of Node required code block
