// Node required code block
const Storage_ = require('../Storage.gs').Storage_;
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
  this.storage_ = new Storage_('jst_tables', PropertiesService.getScriptProperties() || {});
  this.index_ = {};  // only index of all table ids
  this.tables_ = {}; // actual array/object of IssueTables
}

/**
 * Adding a IssueTable to storage.
 * @param {IssueTable_} IssueTable    The IssueTable object to store in script storage
 * @return {IssueTableIndex_}    Allow chaining
 */
IssueTableIndex_.prototype.addTable = function(IssueTable) {
  debug.log('addTable() <= %s', IssueTable.toJson());

  if (typeof this.index_[IssueTable.data.sheetId] !== 'object') {
    // init new array for each sheetId index => array[sheetId's] => array[tableId's]
    this.index_[IssueTable.data.sheetId] = [];
  }

  this.index_[IssueTable.data.sheetId].push(IssueTable.data.tableId);

  // sanitize and concat a new id string which is safe to use as an property key name
  var tableIndexId = this.tableIndexName(IssueTable.data.sheetId, IssueTable.data.tableId);
  this.tables_[tableIndexId] = IssueTable.toJson(); // add IssueTables data to index
  debug.log('table with id %s added to index of tables', tableIndexId);

  this.save();

  return this;
};

/**
 * Return a perviously stored IssueTable if available.
 * 
 * @param {string} tableId    Table Id to fetch
 * @param {sheetId} sheetId    Optional: Sheet Id to fetch table for. Default: current active sheets id
 * @return {IssueTable_}    Returns instance of IssueTable with loaded data if found, or empty instance if not
 */
IssueTableIndex_.prototype.getTable = function(tableId, sheetId) {
  sheetId = sheetIdPropertySave(sheetId);
  debug.log('getTable(%s, %s)', tableId, sheetId);

  // load everything from storage
  this.load_();

  //sanitize and concat a new id string which is safe to use as an property key name
  var tableIndexId = this.tableIndexName(sheetId, tableId);
  // fetch table from storage by tableIndexId
  this.tables_[tableIndexId] = this.storage_.getValue(tableIndexId);

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
 * @return {IssueTableIndex_}    Allow chaining
 */
IssueTableIndex_.prototype.load_ = function() {
  debug.log('IssueTableIndex_.load_()');
  var index = this.storage_.getValue('index');

  if (null !== index) {
    this.index_ = index;
  }

  for ( var sheetId in this.index_) {
    for ( var tableId in this.index_[sheetId]) {
      var tableIndexId = this.tableIndexName(sheetId, tableId);
      this.tables_[tableIndexId] = this.storage_.getValue(tableIndexId);
    }
  }

  return this;
};

/**
 * Save all data to storage
 * @return {IssueTableIndex_}    Allow chaining
 */
IssueTableIndex_.prototype.save = function() {
  debug.log('IssueTableIndex_.save()');
  // store the index of all tables
  this.storage_.setValue('index', this.index_);

  // store each table individually into the property storage
  for ( var element in this.tables_) {
    this.storage_.setValue(element, this.tables_[element]);
  }

  return this;
};

/**
 * Format a usable string from sheetId and tableId
 * @param {string} sheetId    The sheet's sanitized id
 * @param {string} tableId    The table id
 * @return {string}
 */
IssueTableIndex_.prototype.tableIndexName = function(sheetId, tableId) {
  return sheetId + '__' + tableId;
};

// Node required code block
module.exports = {
  IssueTableStorage_ : IssueTableStorage_
};
// End of Node required code block
