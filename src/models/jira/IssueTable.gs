// Node required code block
const extend = require('../../jsLib.gs').extend;
const sheetIdPropertySafe = require('../../jiraCommon.gs').sheetIdPropertySafe;
var SpreadsheetTriggers_ = require('../SpreadsheetTriggers.gs').SpreadsheetTriggers_;
// End of Node required code block

/*
 * @TODO: remove testing
 * @TODO. remove all unnccessary console.log from class
 */


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
  var that = this,
      issues = {},
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
  init = function (attributes) {
    attributes = attributes || {metaData: {}};

    if (attributes.hasOwnProperty('metaData')) {
      // initialize with existing data (ie: that.fromJson()
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

      if (!attributes.hasOwnProperty('renderer')) {
        throw new Error("{attributes.renderer} must be defined. Ie: of type 'IssueTableRendererDefault_' or string of class name.");
      }

      that.setMeta('filter', attributes.filter)
        .setIssues(attributes.issues)
        .setRenderer(attributes.renderer)
      ;
      that.setMeta('sheetId', sheetIdPropertySafe(attributes.sheet.getSheetId()))
        .setMeta('rangeA1', attributes.sheet.getActiveCell().getA1Notation())
      ;
    }
  };

  /**
   * Setting the table renderer
   *
   * @param {string|function} Classname or class of IssueTableRenderer
   * @return {IssueTable_}
   */
  that.setRenderer = function (rendererClass) {
    if (typeof rendererClass === 'string') {
      metaData.renderer = rendererClass;
    } else {
      metaData.renderer = rendererClass.name;
    }

    return that;
  };

  /**
   * Set the Jira api response object "issues"
   * 
   * @param {object} issuesJson
   * @return {IssueTable_}
   */
  that.setIssues = function (issuesJson) {
    issues = issuesJson || {};

    return that;
  };

  /**
   * Get the Jira issues object
   * 
   * @return {array} issues
   */
  that.getIssues = function () {
    return issues;
  };

  /**
   * Setting a key/value pair to internal data object
   * @param {string} key    Name/Key of value to store
   * @param {mixed} value    The value for key
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
   * Getting data from object storage by specific key or everything.
   * 
   * @param {string} key    The data key name to retrieve. If left undefined, function returns entire data object.
   * @param {mixed} defaultValue    Optional default value to return in case data could not be found
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
   * Wrapper/Helper to get tables sheet id
   * @return {string}
   */
  that.getSheetId = function () {
    return metaData.sheetId;
  };

  /**
   * Wrapper/Helper to get tables table id
   * @return {string}
   */
  that.getTableId = function () {
    return metaData.tableId;
  };

  /**
   * Converts tables data to JSON object string representation
   * 
   * @return {string}    Entire data object stringified with JSON.stringify
   */
  that.toJson = function () {
    return JSON.stringify(metaData);
  };

  /**
   * Takes stringified JSON to parse into JSON object and use for initialize a IssueTable object.
   * 
   * @param {string} json The JSON string to parse and load into a new IssueTable instance
   * @return {IssueTable_} A new instance of IssueTable_ with all data from [json] load into.
   */
  that.fromJson = function (json) {
    var metaData = JSON.parse(json); // Parsing the json string.
    return new IssueTable_({metaData: metaData});
  };

  /**
   * @return {IssueTableRenderer_}
   */
  that.render = function () {
    var renderer = RendererFactory_.call(that, metaData.renderer);
    if (typeof renderer !== 'object' || !renderer.hasOwnProperty('render')) {
      throw new Error("{renderer} must be an object/class but is '" + typeof renderer + "'. Ie: of type 'IssueTableRendererDefault_'.");
    }
    
    return renderer.render();
  };

  // Initialize this object/class
  init(attributes);
}

// Node required code block
module.exports = IssueTable_;
// End of Node required code block
