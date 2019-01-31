/**
 * Creates a new Storage object, a helper to easily access Storage_ instance.
 */

var Storage = {
  
  // in memory cache to avoid repeated hits to User Preferences
  memory_ : {},

  /**
   * Wrapper: Gets a stored value.
   * @param {string} key The key.
   * @return {*} The stored value.
   */
  getValue: function(key) {
    // Check memory.
    if (Storage.memory_[key]) {
      return this.memory_[key];
    }
    var prefixedKey = Storage.getPrefixedKey_(key);
    var jsonValue;
    var value;

    // Check properties.
    if (jsonValue = PropertiesService.getUserProperties().getProperty(prefixedKey)) {
      value = JSON.parse(jsonValue);
      this.memory_[key] = value;
      return value;
    }

    // Not found.
    return null;
  },

  /**
   * Wrapper: Stores a value.
   * @param {string} key The key.
   * @param {*} value The value.
   */
  setValue: function(key, value) {
    Storage.memory_[key] = value;
    var prefixedKey = this.getPrefixedKey_(key);
    var jsonValue = JSON.stringify(value);
    PropertiesService.getUserProperties().setProperty(prefixedKey, jsonValue);
    return value;
  },

  /**
   * Wrapper: Removes a stored value.
   * @param {string} key The key.
   */
  removeValue: function(key) {
    var prefixKey = Storage.getPrefixedKey_(key);
    PropertiesService.getUserProperties().deleteProperty(prefixedKey);
    delete this.memory_[prefixKey];
  },
  
  /**
  * private method to prefix a key
  */
  getPrefixedKey_ : function(key) {
    if (key) {
     return "jst" + '.' + key;
    } else {
     return "jst";
    }
  }

};


// Node required code block
module.exports = {
  Storage : Storage
};
// End of Node required code block
