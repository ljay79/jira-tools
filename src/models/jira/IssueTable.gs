// Node required code block
const extend = require('../../jsLib.gs').extend;
const getSheetById = require('../../jsLib.gs').getSheetById;
const sheetIdPropertySafe = require('../../jiraCommon.gs').sheetIdPropertySafe;
var SpreadsheetTriggers_ = require('../SpreadsheetTriggers.gs').SpreadsheetTriggers_;
var IssueTableRendererDefault_ = require('../renderer/IssueTableRendererDefault.gs').IssueTableRendererDefault_;
// End of Node required code block

/**
 * @file Contains class which is used to reflect a Jira IssueTable's meta data for google sheet tables.
 */

/**
 * @desc Creates new IssueTable_ instance to reflect the meta data of a IssueTable in google sheets.
 * @param {object} data Optional JSON representation of previously stored IssueTable data object.
 * @Constructor
 */
function IssueTable_(attributes) {
  var that = this,
      Sheet,
      issues = {},
      metaData = {
        sheetId : sheetIdPropertySafe(), // sample: '6.02713257E8'
        tableId : null,                  // sample: 'table1_1550871398921'
        name : null,                     // sample: 'My pending Issues'
        rangeA1 : null,                  // sample: 'A1:F4'
        rangeCoord : null,               // sample: {row: {from: 1, to: 10}, col: {from: 1, to: 5}}
        rangeName : null,                // sample: 's2_tbl_rA1F4'
        headerRowOffset : 0,             // sample: 1
        headerFields : [],               // sample: [summary,key,status,epic,priotiry]
        headerValues : [],               // sample: [Summary,Key,Status,Epic,P]
        filter: {id: 0, jql: null},      // sample: {id: 1234, jql: 'status = Done and project in ("JST")'}
        maxResults : null,               // sample: 10
        renderer: null,                  // sample: IssueTableRendererDefault_
        time_lastupdated : (new Date()).getTime() // sample: 1550871398921
      };

  /**
   * @desc Initialize anything necessary for the class object
   * @param {object} initData Optional JSON representation of an IssueTable_ data set to load into instance
   * @throws ReferenceError
   * @return void
   */
  init = function (attributes) {
    debug.log('IssueTable_.init() <= %s', attributes);
    attributes = attributes || {
      metaData : {}
    };

    if (attributes.hasOwnProperty('metaData')) {
      // initialize with existing data (ie: that.fromJson()
      metaData = extend(metaData, attributes.metaData);

      var _sheetId = sheetIdPropertySafe(metaData.sheetId, true);
      Sheet = getSheetById(_sheetId);
    } else {
      // new init to generate new table; validate required options
      if (!attributes.hasOwnProperty('filter')
          || typeof attributes.filter !== 'object'
          || !attributes.filter.hasOwnProperty('id')
          || !attributes.filter.hasOwnProperty('jql')) {
        throw new ReferenceError("{attributes.filter} must be an object of type 'Filter'. {id:{int}, jql: {strong}, ..}");
      }

      if (!attributes.hasOwnProperty('issues') || typeof attributes.issues !== 'object') {
        throw new ReferenceError("{attributes.issues} must be an object. Jira api response object of type issues.");
      }

      if (!attributes.hasOwnProperty('columns') || typeof attributes.columns !== 'object') {
        throw new ReferenceError("{attributes.columns} must be an array. Jira field names used as table header.");
      }

      if (!attributes.hasOwnProperty('sheet') || typeof attributes.sheet !== 'object') {
        throw new ReferenceError("{attributes.sheet} must be an object of type 'Sheet'.");
      }

      if (!attributes.hasOwnProperty('renderer')) {
        throw new ReferenceError("{attributes.renderer} must be defined. Ie: of type 'IssueTableRendererDefault_' or string of class name.");
      }

      /* ---- */

      that.setMeta('filter', {
        id : attributes.filter.id || 0,
        name : attributes.filter.name || '',
        jql : attributes.filter.jql
      });
      that.setIssues(attributes.issues).setRenderer(attributes.renderer);
      that.setMeta('headerFields', attributes.columns);

      if (attributes.filter.hasOwnProperty('name')) {
        that.setMeta('name', attributes.filter.name);
      }

      if (attributes.hasOwnProperty('maxResults')) {
        that.setMeta('maxResults', attributes.maxResults);
      }

      Sheet = attributes.sheet;
      that.setMeta('sheetId', sheetIdPropertySafe(Sheet.getSheetId()))
        .setMeta('rangeA1', Sheet.getActiveCell().getA1Notation());
    }
  };

  /**
   * @desc Setting the table renderer
   * @param {string|function} Classname or class of IssueTableRenderer
   * @return {IssueTable_}
   */
  that.setRenderer = function (rendererClass) {
    debug.log('IssueTable_.setRenderer() <= %s', rendererClass);
    if (typeof rendererClass === 'string') {
      metaData.renderer = rendererClass;
    } else {
      metaData.renderer = rendererClass.name;
    }
    metaData.time_lastupdated = (new Date()).getTime();

    return that;
  };

  /**
   * @desc Set the Jira api response object "issues"
   * @param {object} issuesJson
   * @return {IssueTable_}
   */
  that.setIssues = function (issuesJson) {
    issues = issuesJson || {};
    metaData.time_lastupdated = (new Date()).getTime();

    return that;
  };

  /**
   * @desc Get the Jira issues object
   * @return {array} issues
   */
  that.getIssues = function () {
    return issues;
  };

  /**
   * @desc Setting a key/value pair to internal data object
   * @param {string} key Name/Key of value to store
   * @param {mixed} value The value for key
   * @return {IssueTable_}
   */
  that.setMeta = function (key, value) {
    if (metaData.hasOwnProperty(key) && metaData[key] === value) {
      // old and new value are same, just skip and return
      return that;
    }

    metaData[key] = value;
    metaData.time_lastupdated = (new Date()).getTime();

    return that;
  };

  /**
   * @desc Getting data from object storage by specific key or everything.
   * @param {string} key The data key name to retrieve. If left undefined, function returns entire data object.
   * @param {mixed} defaultValue Optional default value to return in case data could not be found
   * @return {mixed}
   */
  that.getMeta = function (key, defaultValue) {
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
   * @desc Wrapper/Helper to get tables sheet id
   * @return {string}
   */
  that.getSheetId = function () {
    return metaData.sheetId;
  };

  /**
   * @desc Setting/Generating a table id string and stores it to metaData.
   * @param {string|null} tableId Optional tableId to use or null to generate a new one.
   * @return {string}
   */
  that.setTableId = function (tableId) {
    tableId = tableId || null;
    if (tableId === null) {
      tableId = 'r' + metaData.rangeA1.replace(':', '');
      tableId = 'tbl_' + tableId;
    }

    metaData.tableId = tableId;
    metaData.time_lastupdated = (new Date()).getTime();

    return metaData.tableId;
  };

  /**
   * @desc Wrapper/Helper to get tables table id
   * @return {string}
   */
  that.getTableId = function () {
    if (null === metaData.tableId) {
      that.setTableId();
    }

    return metaData.tableId;
  };

  /**
   * @desc Converts tables data to JSON object string representation
   * @return {string} Entire data object stringified with JSON.stringify
   */
  that.toJson = function () {
    return JSON.stringify(metaData);
  };

  /**
   * @desc Takes stringified JSON to parse into JSON object and use for initialize a IssueTable object.
   * @param {string} json The JSON string to parse and load into a new IssueTable instance
   * @return {IssueTable_} A new instance of IssueTable_ with all data from [json] load into.
   */
  that.fromJson = function (json) {
    var metaData = JSON.parse(json); // Parsing the json string.
    return new IssueTable_({
      metaData : metaData
    });
  };

  /**
   * @desc Calling the set renderer and render table
   * @throws ReferenceError
   * @return {IssueTableRenderer_}
   */
  that.render = function () {
    debug.log('IssueTable_.render()');
    var renderer = RendererFactory_.call(that, metaData.renderer);
    if (typeof renderer !== 'object' || !renderer.hasOwnProperty('render')) {
      throw new ReferenceError("{renderer} must be an object/class but is '" + typeof renderer
          + "'. Ie: of type 'IssueTableRendererDefault_'.");
    }

    renderer.render();

    // store render info to IssueTable meta data
    var renderInfo = renderer.getInfo();
    metaData.headerRowOffset = renderInfo.headerRowOffset;
    metaData.headerValues = renderInfo.headers;

    // setting range info
    setRange(renderInfo.oRangeA1.from + ':' + renderInfo.oRangeA1.to);

    return renderer;
  };

  /**
   * @desc Setting relevant range information and store them in metaData.
   * @param {string} rangeA1 A1 notation of a range
   * @return {IssueTable_}
   */
  setRange = function (rangeA1) {
    debug.log('IssueTable_.setRange() <= %s', rangeA1);
    metaData.rangeA1 = rangeA1;
    // setting named range
    var _rangeName = 'pa4j_s' + Sheet.getSheetId() + '_';
    var _range = Sheet.getRange(rangeA1);
    _rangeName += that.getTableId().replace(/[^a-zA-Z0-9\_]/g, '');

    // named ranges must be unique per Spreadsheet
    Sheet.getParent().setNamedRange(_rangeName, _range);
    metaData.rangeName = _rangeName;

    return that;
  };

  // Initialize this object/class
  init(attributes);
}

// Node required code block
module.exports = IssueTable_;
// End of Node required code block
