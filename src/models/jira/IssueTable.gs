// Node required code block
const extend = require('../../jsLib.gs').extend;
const sheetIdPropertySafe = require('../../jiraCommon.gs').sheetIdPropertySafe;
var SpreadsheetTriggers_ = require('../SpreadsheetTriggers.gs').SpreadsheetTriggers_;
// End of Node required code block

/*
 * @TODO: remove testing
 * @TODO. remove all unnccessary console.log from class
 */

/* ######## DEV- WIP - Testing #################### */
function saveTest() {
  var table1 = new IssueTable_();
  table1.setData('tableId', 'aaa');

  var table2 = new IssueTable_();
  table2.setData('tableId', 'bbb');

  var tblIndex = new IssueTableIndex_();
  tblIndex.addTable(table1).addTable(table2).addTable(table1);
}

function loadTest() {
  console.log('current sheet id: %s', sheetIdPropertySafe());
  var tblIndex = new IssueTableIndex_();
  var tableOld = tblIndex.getTable('bbb');
  console.log('tableOld B: %s', tableOld.toJson());

  var tblIndex = new IssueTableIndex_();
  var tableOld = tblIndex.getTable('aaa');
  console.log('tableOld A: %s', tableOld.toJson());
}

var TestTable = {
  sheetId : '6.02713257E8',
  /*
   * Range names: - Can contain only letters, numbers, and underscores. - Can't start with a number, or the words "true" or "false." - Can't
   * contain any spaces or punctuation. - Must be 1–250 characters. - Can't be in either A1 or R1C1 syntax. For example, you might get an
   * error if you give your range a name like "A1:B2" or "R1C1:R2C2."
   */
  rangeName : 'table1_6_02713257E8',
  rangeA1 : 'B3:D6',
  headerRowOffset : 1,
  headerValues : ['colA', 'colB', 'colC']
};

function testDefineRange() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var range = getTicketSheet().getRange(TestTable.rangeA1);
  ss.setNamedRange(TestTable.rangeName, range);

  // check
  var rangeCheck = ss.getRangeByName(TestTable.rangeName);
  var rangeCheckName = rangeCheck.getA1Notation();
  console.log('rangeCheckName: %s === TestTable.rangeA1', rangeCheckName, TestTable.rangeA1);
}

function testTable1() {
  console.log('testTable1()');

  SpreadsheetTriggers_.register('onEdit', 'onEditTableMeta', true);
  SpreadsheetTriggers_.register('onChange', 'onEditTableMeta', true);
}

function onEditTableMeta(e) {
  console.log('onEditTableMeta(): %s', e);

  // check against if current sheet has any monitored IssueTable (loop)
  if (getTicketSheet().getSheetId() != TestTable.sheetId) {
    console.log('not monitored sheet, leave...');
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rangeCheck = ss.getRangeByName(TestTable.rangeName);
  // get range left/top corner
  var rangeCoord = {
    'c' : rangeCheck.getColumn(),
    'r' : rangeCheck.getRow()
  };

  // EDIT, INSERT_ROW, INSERT_COLUMN, REMOVE_ROW, REMOVE_COLUMN, INSERT_GRID,
  // REMOVE_GRID, FORMAT, or OTHER
  switch (e.changeType) {
    case 'EDIT': // cell values changed; currently same validation rules as rest

    case 'REMOVE_GRID':
    case 'INSERT_GRID':
    case 'REMOVE_COLUMN':
    case 'REMOVE_ROW':
    case 'INSERT_COLUMN':
    case 'INSERT_ROW':
      // get issue table header (always in 2nd row)
      var tableHeader = getTicketSheet().getRange(rangeCoord.r + TestTable.headerRowOffset, rangeCoord.c, 1,
          (rangeCheck.getLastColumn() - rangeCoord.c + 1));
      // header changed?
      if (tableHeader.getValues()[0].join('|') !== TestTable.headerValues.join('|')) {
        console.log('Compare header: %s !== %s', tableHeader.getValues()[0].join('|'), TestTable.headerValues.join('|'));
        console.log('New header values: %s', tableHeader.getValues());

        /*
         * @TODO: logic needed to check new header values - parse and check if new value is a supported Jira field - yes: update meta - no:
         * flag column to be skipped - header moved inside table range (relative offset update?) / not 2nd row anymore? allowed at all?
         */

        // update meta - changed header
        TestTable.headerValues = tableHeader.getValues();

      } else {
        console.log('table header didnt change, skip...');
      }

      // check for structural changes and update table meta OR throw warning
      // (refresh wont be possible after such change)
      if (rangeCheck.getA1Notation() === TestTable.rangeA1) {
        console.log('Range dimension didnt change, skip...');
        // return; // nothing to do
      } else {
        console.log('! Range changed !');

        /*
         * !! check if new change is affecting IssueTable functionality If YES: prompt user with warning and undo or accept with IssueTable
         * beeing converted to static sheet table (remove trigger) If NO: simply update TableMeta if necessary
         */
        // update meta - changed dimension/range
        TestTable.rangeA1 = rangeCheck.getA1Notation();

        console.log('New Tables Range: %s', TestTable.rangeA1);
      }

      break;

    default:
      return;
      break;
  }

}


function tblAccessTest() {
  var table1 = new IssueTable_();
  table1.setData('tableId', 'aaaTid');
  table1.setData('sheetId', 'aaaSid');
  table1.setData('foo', 'bar');

  console.log('tId: %s', table1.getTableId());
  console.log('sId: %s', table1.getSheetId());
  console.log('default 1: %s', table1.getData('unknown'));
  console.log('default 2: %s', table1.getData('unknown', 'defValue2'));
  console.log('dataAll: %s', table1.getData());

  table1.setData('foo', 'bar2');
  console.log('dataAll: %s', table1.getData());
  table1.setData('foo', 'bar2');
  console.log('dataAll: %s', table1.getData());
}




/* ######## ################## #################### */

function newTable() {
  var jsonIssues = '[{"expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields","id": "33184","self": "https://dyhltd.atlassian.net/rest/api/2/issue/33184","key": "TP-15","fields": {"summary": "Test Story 1 - appended2","status": {"self": "https://dyhltd.atlassian.net/rest/api/2/status/10004","description": "The issue is open and awaiting review and further refining to process into Sprints Backlog.","iconUrl": "https://dyhltd.atlassian.net/images/icons/status_generic.gif","name": "To Do","id": "10004","statusCategory": {"self": "https://dyhltd.atlassian.net/rest/api/2/statuscategory/2","id": 2,"key": "new","colorName": "blue-gray","name": "To Do"}}}}, {"expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields","id": "33178","self": "https://dyhltd.atlassian.net/rest/api/2/issue/33178","key": "TP-9","fields": {"summary": "CLONE - Test task of Epic 4 - appended","status": {"self": "https://dyhltd.atlassian.net/rest/api/2/status/3","description": "This issue is being actively worked on at the moment by the assignee.","iconUrl": "https://dyhltd.atlassian.net/images/icons/statuses/inprogress.png","name": "In Progress","id": "3","statusCategory": {"self": "https://dyhltd.atlassian.net/rest/api/2/statuscategory/4","id": 4,"key": "indeterminate","colorName": "yellow","name": "In Progress"}}}}]';
  jsonIssues = JSON.parse(jsonIssues);

  var attributes = {
    filter   : getFilter(14406),
    issues   : jsonIssues,
    sheet    : getTicketSheet(),
    renderer : new IssueTableRendererDefault_()
  };

  console.log('passing attribs: %s', attributes);
  var table = new IssueTable_(attributes);
  table.render();
}

function IssueTableRendererDefault_() {
  console.log('IssueTableRendererDefault_()');

  this.render = function () {
    console.log('IssueTableRendererDefault_.render()');
    console.log('getSheetId: %s; rangeA1: %s', this.getSheetId(), this.getMeta('rangeA1'));
  };
}



/**
 * @file Contains class used reflect a Jira IssueTable's meta data for google sheet tables.
 */

/**
 * Creates new IssueTable_ instance to reflect the meta data of a IssueTable in google sheets.
 * 
 * @param {object} data Optional JSON representation of previously stored IssueTable data object.
 * @Constructor
 */
function IssueTable_(attributes) {
  var issues = {},
      metaData = {
        sheetId : sheetIdPropertySafe(), // sample: '6.02713257E8'
        tableId : null,                  // sample: 'table1_1550871398921'
        name : null,                     // sample: 'My pending Issues'
        /*
         * Range names: - Can contain only letters, numbers, and underscores. - Can't start with a number, or the words "true" or "false." -
         * Can't contain any spaces or punctuation. - Must be 1–250 characters. - Can't be in either A1 or R1C1 syntax. For example, you might
         * get an error if you give your range a name like "A1:B2" or "R1C1:R2C2."
         */
        rangeName : null,                // sample: 'table1_6_02713257E8'
        rangeA1 : null,                  // sample: 'A1:F4'
        headerRowOffset : 1,             // sample: 1
        headerValues : [],               // sample: [Summary,Key,Status,Epic]
        filter: {id: 0, jql: null},      // sample: {id: 1234, jql: 'status = Done and project in ("JST")'}
        renderer: null,                  // sample: IssueTableRendererDefault_
        time_lastupdated : (new Date()).getTime() // sample: 1550871398921
      };

  /**
   * Initialize anything necessary for the class object
   * 
   * @param {object} initData    Optional JSON representation of an IssueTable_ data set to load into instance
   * @return void
   */
  this.init = function (attributes) {
    // metaData passed (ie: this.fromJson()
    if (attributes.hasOwnProperty('metaData')) {
      // initialize with existing data
      metaData = extend(metaData, attributes.metaData);
    } else {
      // new init to generate new table; validate required options
      if (!attributes.hasOwnProperty('filter') 
          || typeof attributes.filter !== 'object'
          || !attributes.filter.hasOwnProperty('id')
          || !attributes.filter.hasOwnProperty('jql') ) {
            throw new Error("{attributes.filter} must be an object of type 'Filter'. {id:{int}, jql: {strong}, ..}");
      }

      if (!attributes.hasOwnProperty('issues') || typeof attributes.issues !== 'object' ) {
        throw new Error("{attributes.issues} must be an object. Jira api response object of type issues.");
      }

      if (!attributes.hasOwnProperty('sheet') || typeof attributes.sheet !== 'object' ) {
        throw new Error("{attributes.sheet} must be an object of type 'Sheet'.");
      }

      if (!attributes.hasOwnProperty('renderer') || typeof attributes.renderer !== 'object' ) {
        throw new Error("{attributes.renderer} must be an object. Ie: of type 'IssueTableRendererDefault_'.");
      }

      this.setMeta('filter', attributes.filter)
        .setIssues(attributes.issues)
        .setRenderer(attributes.renderer)
      ;
      this.setMeta('sheetId', sheetIdPropertySafe(attributes.sheet.getSheetId()))
        .setMeta('rangeA1', attributes.sheet.getActiveCell().getA1Notation())
      ;
    }
  };

  /**
   * Setting the table renderer
   *
   * @param {IssueTableRenderer_} IssueTableRenderer    Renderer class to be used
   * @return {IssueTable_}
   */
  this.setRenderer = function (IssueTableRenderer) {
    metaData.renderer = IssueTableRenderer;

    return this;
  };

  /**
   * Set the Jira api response object "issues"
   * 
   * @param {object} issuesJson
   * @return {IssueTable_}
   */
  this.setIssues = function (issuesJson) {
    issues = issuesJson || {};

    return this;
  };

  /**
   * Setting a key/value pair to internal data object
   * @param {string} key    Name/Key of value to store
   * @param {mixed} value    The value for key
   * @return {IssueTable_}
   */
  this.setMeta = function (key, value) {
    console.log('IssueTable_.setMeta(%s) <= %s', key, value);

    if (metaData.hasOwnProperty(key) && metaData[key] === value) {
      console.log('new metaData unchanged; %s = new(%s) vs old(%s)', key, value, metaData[key]);
      // old and new value are same, just skip and return
      return this;
    }

    metaData[key] = value;
    metaData.time_lastupdated = (new Date()).getTime();

    return this;
  };

  /**
   * Getting data from object storage by specific key or everything.
   * 
   * @param {string} key    The data key name to retrieve. If left undefined, function returns entire data object.
   * @param {mixed} defaultValue    Optional default value to return in case data could not be found
   * @return {mixed}
   */
  this.getMeta = function (key, defaultValue) {
    var value = defaultValue || null;

    // no key specified, return entire data object
    if (key === undefined) {
      return metaData;
    }

    if (metaData.hasOwnProperty(key)) {
      value = metaData[key];
    }

    return value;
  }

  /**
   * Wrapper/Helper to get tables sheet id
   * @return {string}
   */
  this.getSheetId = function () {
    return metaData.sheetId;
  };

  /**
   * Wrapper/Helper to get tables table id
   * @return {string}
   */
  this.getTableId = function () {
    return metaData.tableId;
  };

  /**
   * Converts tables data to JSON object string representation
   * 
   * @return {string}    Entire data object stringified with JSON.stringify
   */
  this.toJson = function () {
    return JSON.stringify(metaData);
  };

  /**
   * Takes stringified JSON to parse into JSON object and use for initialize a IssueTable object.
   * 
   * @param {string} json The JSON string to parse and load into a new IssueTable instance
   * @return {IssueTable_} A new instance of IssueTable_ with all data from [json] load into.
   */
  this.fromJson = function (json) {
    var metaData = JSON.parse(json); // Parsing the json string.
    return new IssueTable_({metaData: metaData});
  };

  /**
   * @return {IssueTableRenderer_}
   */
  this.render = function () {
    console.log('->render()');
    if (typeof metaData.renderer !== 'object' || !metaData.renderer.hasOwnProperty('render')) {
      throw new Error("{renderer} must be an object. Ie: of type 'IssueTableRendererDefault_'.");
    }
    
    console.log('  -> rendering ..');

    return metaData.renderer.render.call(this);
  };

  // Initialize this object/class
  this.init(attributes);
}

// Node required code block
module.exports = IssueTable_;
// End of Node required code block
