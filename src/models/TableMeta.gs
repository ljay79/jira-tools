// Node required code block
const Storage_ = require('./Storage.gs').Storage_;
// End of Node required code block

var TableMeta = {
  _appStorage: false,

  getValue: function(key) {
    return this._getAppStorage().getValue(key);
  },

  setValue: function(key, value) {
    return this._getAppStorage().setValue(key, value);
  },

  _getAppStorage: function() {
    if (!this._appStorage) {
      // https://developers.google.com/apps-script/guides/services/quotas
      this._appStorage = new Storage_('jst_tbl', PropertiesService.getUserProperties()||{});
    }
    return this._appStorage;
  }
};


// Node required code block
module.exports = {
  TableMeta: TableMeta
};
// End of Node required code block
