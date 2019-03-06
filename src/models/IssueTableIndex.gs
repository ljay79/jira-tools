// Node required code block
const sheetIdPropertySafe = require('../jiraCommon.gs').sheetIdPropertySafe;
var Storage_ = require('../Storage.gs').Storage_;
var IssueTable_ = require('./jira/IssueTable.gs');
// End of Node required code block

/* ######## DEV- WIP - Testing #################### */

function findByTableId() {
  var table = IssueTableIndex_.getTable('tbl_rB2D5');
  if (!table) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Table Meta: %s', table.getMeta());
  }
}

function findAllBySheet() {
  // sheetId1: 602713257
  // sheetId2: 230234225
  var tables = IssueTableIndex_.getAllTablesBySheet(602713257);
  if (tables.length == 0) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', tables.length);
  }

  var tables = IssueTableIndex_.getAllTablesBySheet(230234225);
  if (tables.length == 0) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', tables.length);
  }
}

function findTableByCoord() {
  // OK Case
  console.log('===========> case 2');
  var table = IssueTableIndex_.getTableByCoord(undefined, 3, 4);
  if (!table) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', table);
  }

  // OK Case
  console.log('===========> case 1');
  var table = IssueTableIndex_.getTableByCoord(230234225, 3, 4);
  if (!table) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', table);
  }

  // Not OK Case
  console.log('===========> case 3');
  var table = IssueTableIndex_.getTableByCoord(230234225, 50, 400);
  if (!table) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', table);
  }

  // Not OK Case
  console.log('===========> case 4');
  var table = IssueTableIndex_.getTableByCoord(9999, 50, 400);
  if (!table) {
    console.log('Table NOT found!');
  } else {
    console.log('Found Tables: %s', table);
  }
}

/* ######## ------------------ #################### */

/**
 * @file Contains class used to persist IssueTable data and access it.
 */

/**
 * Creates a new IssueTableIndex_ object, which is used to persist IssueTables and related information.
 */
IssueTableIndex_ = {
  _storage : null,
  _index : {}, // only index of all table ids
  _tables : {}, // actual array/object of IssueTables

  /**
   * Adding a IssueTable to storage.
   * 
   * @param {IssueTable_} IssueTable The IssueTable object to store in script storage
   * @return {IssueTableIndex_} Allow chaining
   */
  addTable : function (IssueTable) {
    debug.log('addTable() <= %s', IssueTable.toJson());
    var tblSheetId = IssueTable.getSheetId();
    var tblTableId = IssueTable.getTableId();

    // load everything from storage
    this._load();

    if (typeof this._index[tblSheetId] !== 'object') {
      // init new array for each sheetId index => array[sheetId's] => array[tableId's]
      this._index[tblSheetId] = [];
    }

    if (this._index[tblSheetId].indexOf(tblTableId) === -1) {
      // not yet in index, add it
      this._index[tblSheetId].push(tblTableId);
    }

    // sanitize new id string which is safe to use as an property key name
    var tableIndexId = this.tableIndexName(tblSheetId, tblTableId);
    // add IssueTables data to index
    this._tables[tableIndexId] = IssueTable.toJson();
    debug.log('table with id %s added to index of tables', tableIndexId);

    return this._save();
  },

  /**
   * Return a perviously stored IssueTable if available.
   * 
   * @param {string} tableId Table Id to fetch
   * @param {sheetId} sheetId Optional: Sheet Id to fetch table for. Default: current active sheets id
   * @return {IssueTable_} Returns instance of IssueTable with loaded data if found, or empty instance if not
   */
  getTable : function (tableId, sheetId) {
    sheetId = sheetIdPropertySafe(sheetId);
    debug.log('getTable(%s, %s)', tableId, sheetId);

    // load everything from storage
    this._load();

    // sanitize and concat a new id string which is safe to use as an property key name
    var tableIndexId = this.tableIndexName(sheetId, tableId);

    // fetch table from storage by tableIndexId
    var _table = this._getStorage().getValue(tableIndexId);
    if (null === _table) {
      debug.log('No table with indexId %s found.', tableIndexId);
      return false;
    }

    this._tables[tableIndexId] = _table;

    // Initialize new IssueTable object and load data from storage into it
    var IssueTable = new IssueTable_();
    return IssueTable.fromJson(this._tables[tableIndexId]);
  },

  /**
   * Format a usable string from sheetId and tableId
   * 
   * @param {string} sheetId The sheet's sanitized id
   * @param {string} tableId The table id
   * @return {string}
   */
  tableIndexName : function (sheetId, tableId) {
    return sheetId + '__' + tableId;
  },

  /**
   * Get all stored IssueTable's for passed Sheet Id.
   * 
   * @param {string} sheetId Optional SheetId to fetch tables for. Default current active Sheet.
   * @return {array} Returns array of found IssueTable objects. Empty array if nothing found.
   */
  getAllTablesBySheet : function (sheetId) {
    sheetId = sheetIdPropertySafe(sheetId);
    debug.log('getAllTablesBySheet(%s)', sheetId);

    var tables = [], sheetIdx, tableIndexId, IssueTable;

    // load everything from storage
    this._load();

    for (sheetIdx in this._index[sheetId]) {
      if (this._index[sheetId].hasOwnProperty(sheetIdx)) {
        tableIndexId = this.tableIndexName(sheetId, this._index[sheetId][sheetIdx]);
        if (null !== this._tables[tableIndexId]) {
          IssueTable = new IssueTable_();
          tables.push(IssueTable.fromJson(this._tables[tableIndexId]));
        }
      }
    }

    return tables;
  },

  getTableByCoord : function (sheetId, columnOrRange, row) {
    debug.log('getTableByCoord(%s, %s, %s)', sheetId, columnOrRange, row);
    debug.time('IssueTableIndex.getTableByCoord()');

    var sheetId = sheetIdPropertySafe(sheetId);
    var column = (typeof columnOrRange === 'object') ? columnOrRange.getColumn() : parseInt(columnOrRange);
    var row = (typeof columnOrRange === 'object') ? columnOrRange.getRow() : parseInt(row);
    var sheetIdx, tableIndexId, tableJson;
    var respond = function (response) {
      debug.timeEnd('IssueTableIndex.getTableByCoord()');
      return response;
    };

    // load everything from storage
    this._load();

    // 1st - does requested sheet exist in index?
    if (!this._index.hasOwnProperty(sheetId) || this._index[sheetId].length === 0) {
      return respond(false);
    }

    // for each table within sheet
    for (sheetIdx in this._index[sheetId]) {
      if (this._index[sheetId].hasOwnProperty(sheetIdx)) {
        tableIndexId = this.tableIndexName(sheetId, this._index[sheetId][sheetIdx]);
        if (null !== this._tables[tableIndexId]) {
          // we usually would init a new IssueTable to access that meta,
          // but performance vise we access the JSON object directly!?
          tableJson = JSON.parse(this._tables[tableIndexId]);
          if (typeof tableJson !== 'object')
            continue;

          // check passed coordinates are within current table range
          if (column >= tableJson.rangeCoord.col.from && column <= tableJson.rangeCoord.col.to && row >= tableJson.rangeCoord.row.from
              && row <= tableJson.rangeCoord.row.to) {
            // found it ..
            return respond(new IssueTable_({
              metaData : tableJson
            }));
          }
        }
      }
    } // END: loop over sheet's tables

    return respond(false);
  },

  /* -- private methods -- */

  /**
   * @desc Initialize anything necessary for the class object
   * @return void
   */
  _getStorage : function () {
    if (null === this._storage) {
      // storage_ = new Storage_('paj_tables', PropertiesService.getDocumentProperties() || {});
      // @TODO: remove before production - only for better debugging
      this._storage = new Storage_('paj_tables', PropertiesService.getScriptProperties() || {});
    }

    return this._storage;
  },

  /**
   * Loading all available relevant data from storage
   * 
   * @return {IssueTableIndex_} Allow chaining
   */
  _load : function () {
    debug.log('IssueTableIndex_.load()');
    var index = this._getStorage().getValue('index');

    if (null !== index) {
      this._index = index;
    }

    for ( var idxI in this._index) {
      if (!this._index.hasOwnProperty(idxI)) {
        continue;
      }

      for ( var idxT in this._index[idxI]) {
        if (!this._index[idxI].hasOwnProperty(idxT)) {
          continue;
        }

        var tableIndexId = this.tableIndexName(idxI, this._index[idxI][idxT]);
        this._tables[tableIndexId] = this._getStorage().getValue(tableIndexId);
      }
    }

    return this;
  },

  /**
   * Save all data to storage
   * 
   * @return {IssueTableIndex_} Allow chaining
   */
  _save : function () {
    debug.log('IssueTableIndex_.save_()');
    // store the index of all tables
    this._getStorage().setValue('index', this._index);

    // store each table individually into the property storage
    for ( var element in this._tables) {
      if (!this._tables.hasOwnProperty(element)) {
        continue;
      }
      this._getStorage().setValue(element, this._tables[element]);
    }

    return this;
  }

};

// Node required code block
module.exports = IssueTableIndex_;
// End of Node required code block
