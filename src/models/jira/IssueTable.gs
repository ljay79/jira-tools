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
      console.log(' -> new metaData unchanged; %s = new(%s) vs old(%s)', key, value, metaData[key]);
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
