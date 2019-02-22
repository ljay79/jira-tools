// Node required code block
const sheetIdPropertySafe = require('../../jsLib.gs').sheetIdPropertySafe;
const Storage_ = require('../Storage.gs').Storage_;
const IssueTable_ = require('./jira/IssueTable_').IssueTable_;
// End of Node required code block

/**
 * @file Contains class used to persist IssueTable data and access it.
 */

/**
 * Creates a new IssueTableIndex_ instance, which is used to persist IssueTables and related information.
 * 
 * @constructor
 */
function IssueTableIndex_() {
  var storage_;
  this.index_ = {}; // only index of all table ids
  this.tables_ = {}; // actual array/object of IssueTables

  /**
   * @desc Initialize anything necessary for the class object
   * @return void
   */
  this.init = function () {
    storage_ = new Storage_('jst_tables', PropertiesService.getDocumentProperties() || {});
  };

  /**
   * Adding a IssueTable to storage.
   * 
   * @param {IssueTable_} IssueTable The IssueTable object to store in script storage
   * @return {IssueTableIndex_} Allow chaining
   */
  this.addTable = function (IssueTable) {
    debug.log('addTable() <= %s', IssueTable.toJson());
    var tblSheetId = IssueTable.getSheetId();
    var tblTableId = IssueTable.getTableId();

    if (typeof this.index_[tblSheetId] !== 'object') {
      // init new array for each sheetId index => array[sheetId's] => array[tableId's]
      this.index_[tblSheetId] = [];
    }

    if (this.index_[tblSheetId].indexOf(tblTableId) === -1) {
      // not yet in index, add it
      this.index_[tblSheetId].push(tblTableId);
    }

    // sanitize new id string which is safe to use as an property key name
    var tableIndexId = this.tableIndexName(tblSheetId, tblTableId);
    // add IssueTables data to index
    this.tables_[tableIndexId] = IssueTable.toJson();
    debug.log('table with id %s added to index of tables', tableIndexId);

    return this.save_();
  };

  /**
   * Return a perviously stored IssueTable if available.
   * 
   * @param {string} tableId Table Id to fetch
   * @param {sheetId} sheetId Optional: Sheet Id to fetch table for. Default: current active sheets id
   * @return {IssueTable_} Returns instance of IssueTable with loaded data if found, or empty instance if not
   */
  this.getTable = function (tableId, sheetId) {
    sheetId = sheetIdPropertySafe(sheetId);
    debug.log('getTable(%s, %s)', tableId, sheetId);

    // load everything from storage
    this.load_();

    // sanitize and concat a new id string which is safe to use as an property key
    // name
    var tableIndexId = this.tableIndexName(sheetId, tableId);
    // fetch table from storage by tableIndexId
    this.tables_[tableIndexId] = storage_.getValue(tableIndexId);

    if (!this.tables_.hasOwnProperty(tableIndexId)) {
      debug.log('No table with indexId %s found.', tableIndexId);
      return false;
    }

    // Initialize new IssueTable object and load data from storage into it
    var IssueTable = new IssueTable_();
    return IssueTable.fromJson(this.tables_[tableIndexId]);
  };

  /**
   * Loading all available relevant data from storage
   * 
   * @return {IssueTableIndex_} Allow chaining
   */
  this.load_ = function () {
    debug.log('IssueTableIndex_.load()');
    var index = storage_.getValue('index');

    if (null !== index) {
      this.index_ = index;
    }

    for ( var sheetId in this.index_) {
      for ( var tableId in this.index_[sheetId]) {
        var tableIndexId = this.tableIndexName(sheetId, tableId);
        this.tables_[tableIndexId] = storage_.getValue(tableIndexId);
      }
    }

    return this;
  };

  /**
   * Save all data to storage
   * 
   * @return {IssueTableIndex_} Allow chaining
   */
  this.save_ = function () {
    debug.log('IssueTableIndex_.save_()');
    // store the index of all tables
    storage_.setValue('index', this.index_);

    // store each table individually into the property storage
    for ( var element in this.tables_) {
      storage_.setValue(element, this.tables_[element]);
    }

    return this;
  };

  /**
   * Format a usable string from sheetId and tableId
   * 
   * @param {string} sheetId The sheet's sanitized id
   * @param {string} tableId The table id
   * @return {string}
   */
  this.tableIndexName = function (sheetId, tableId) {
    return sheetId + '__' + tableId;
  };

  // Initialize this object/class
  this.init();
}

// Node required code block
module.exports = {
  IssueTableIndex_ : IssueTableIndex_
};
// End of Node required code block
