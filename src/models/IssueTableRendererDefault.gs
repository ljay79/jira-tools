// Node required code block

// End of Node required code block

//@TOOD: probably move to own file
function RendererFactory_(RendererClassName) {
  var name = 'RendererFactory_';
  
  switch(RendererClassName) {
    case 'IssueTableRendererDefault_':
      return new IssueTableRendererDefault_(this);
      break;
    default:
      throw new Error("{RendererClassName} is a unknown IssueTable Renderer.");
      break;
  }
}
function test(){
  var sheetId = sheetIdPropertySafe('sid_498497364', true);
  var sheet = getSheetById(sheetId);
  console.log(typeof sheet);
  console.log(sheet.getSheetId());
}

function IssueTableRendererDefault_(IssueTable) {
  var that = this,
      sheet, initRange,
      issues = [], headers = [], 
      rowIndex = 0, numColumns = 0,
      epicField = UserStorage.getValue('jst_epic');

  /**
   * @desc Initialization, validation
   */
  init = function() {
    console.warn('IssueTableRendererDefault_.init() - IssueTable %s', IssueTable); // instance of passed IssueTable_
    console.info('IssueTable.metaData: %s', IssueTable.getMeta()); // instance of passed IssueTable_

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
    console.log('IssueTableRendererDefault_.render()');
    console.log('getSheetId: %s; rangeA1: %s', IssueTable.getSheetId(), IssueTable.getMeta('rangeA1'));
    prepareHeaderValues();
    console.log('headers: %s', headers);
    console.log('numColumns: %s', numColumns);
    
    initRange = sheet.setActiveSelection(IssueTable.getMeta('rangeA1'));

    if (filterName = IssueTable.getMeta('filter').name) {
      that.addSummary("Filter: " + filterName);
    }
    
    that.addHeader().fillTable();
    
    return true;
  };
  
  /**
   * @desc Adding a summary line
   * (not yet used)
   * @return this  For chaining
   */
  that.addSummary = function(summary) {
    range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), 1, headers.length);
    //range.mergeAcross().setValue(summary);
    range.clearContent()
      .clearNote()
      .clearFormat()
      .getCell(1,1)
      .setValue(summary);

    SpreadsheetApp.flush();

    return that;
  };
  
  /**
   * @desc Add headers into 1st row
   * @return this  For chaining
   */
  that.addHeader = function() {
    var values = [], formats = [];
    for(var i=0; i<headers.length; i++) {
      values.push( headerNames(headers[i]) );
      formats.push('bold');
    }

    range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), 1, headers.length);
    range.clearContent()
      .clearNote()
      .clearFormat()
      .setValues([ values ])
      .setFontWeights([ formats ]);
    
    SpreadsheetApp.flush();

    return that;
  };
  
  /**
   * @desc Fill in all data into a sheet table with values and format
   * @return this  For chaining
   */
  that.fillTable = function() {
    var range = sheet.getRange(initRange.getRow(), initRange.getColumn(), 1, headers.length); //obsolete?

    // loop over each resulted issue
    for(var i=0; i<issues.length; i++) {
      var issue = issues[i];
      var values = [];
      var formats = []; //http://www.blackcj.com/blog/2015/05/18/cell-number-formatting-with-google-apps-script/
      range = sheet.getRange(initRange.getRow() + rowIndex++, initRange.getColumn(), 1, headers.length);

      // loop over each header (field/key to output in cell)
      for(var j=0; j<headers.length; j++) {
        var key = unifyIssueAttrib(headers[j], issue);

        // for some custom formatting
        switch(true) {
          case key.hasOwnProperty('date'):
            key.value = (key.value != null) ? key.date : '';
            break;
          case (key.hasOwnProperty('epic') && key.epic === true):
            if (key.value != 'n/a') {
              if(undefined == epicField || epicField.usable === false || epicField.label_key == null) {
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

        values.push( key.value );
        formats.push( key.format || '@' );
      }

      // just check if values (column) length is as we expect?!
      if( values.length != numColumns ) {
        for (var l = 0; l < values.length; l++) {
          values.push('');
          formats.push('@');
        }
      }

      // set values and format to cells
      range.clearContent()
        .clearNote()
        .clearFormat()
        .setValues([ values ])
        .setNumberFormats([ formats ])
        .activate();

      // flush sheet
      if(i % 25 === 0) {
        SpreadsheetApp.flush();
      }

      issue = null;

    }// END: for(data.issues.length)

    return that;
  };
  
  prepareHeaderValues = function() {
    // prep headers
    for(var k in issues[0].fields) {
      headers.push(k);
    }

    // sort fields based on defined order in ISSUE_COLUMNS
    // improves consistent column listing/sorting and defined fields first before alpha sorting rest
    headers = _sortKeysByRef(headers, ISSUE_COLUMNS);
    headers.unshift('key');

    numColumns = headers.length;

    return that;
  };
}

//@TODO: Move to appropiate file (not jiraCommand.gs, jsLib.gs, but where?)
/**
 * Get a sheet of current active Spreadsheet by ID passed.
 * @param {int|string} id    The sheet id to get a Sheet for
 * @return {undefined|Sheet}
 */
function getSheetById(id) {
  id = (typeof id === 'string') ? parseInt(id) : id;
  return SpreadsheetApp.getActive().getSheets().filter(
    function(s) { return s.getSheetId() === id; }
  )[0];
}

// Node required code block
module.exports = IssueTableRendererDefault_;
// End of Node required code block
