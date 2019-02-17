// Node required code block
const Storage_ = require('src/Storage.gs').Storage_;
// End of Node required code block

/**
 * Creates a new UserStorage object, a helper to easily access Storage_ instance.
 */
var UserStorage = {
  _appStorage: false,

  /**
   * Wrapper: Gets a stored value.
   * @param {string} key The key.
   * @return {*} The stored value.
   */
  getValue: function(key) {
    return this._getAppStorage().getValue(key);
  },

  /**
   * Wrapper: Stores a value.
   * @param {string} key The key.
   * @param {*} value The value.
   */
  setValue: function(key, value) {
    return this._getAppStorage().setValue(key, value);
  },

  /**
   * Wrapper: Removes a stored value.
   * @param {string} key The key.
   */
  removeValue: function(key) {
    return this._getAppStorage().removeValue(key);
  },

  /**
   * (private) Storage initialization
   * @return {Storage_} The JST storage
   */
  _getAppStorage: function() {
    if (!this._appStorage) {
      // https://developers.google.com/apps-script/guides/services/quotas
      this._appStorage = new Storage_('jst', PropertiesService.getUserProperties()||{});
    }
    return this._appStorage;
  }
};


// Node required code block
module.exports = UserStorage
// End of Node required code block
