// Node required code block
const copyObject = require('../../jsLib.gs').copyObject;
const UserStorage = require("../../UserStorage.gs").UserStorage;
// End of Node required code block

/**
 * Model class for accessing and storing the custom defined fields for Epic in a JIRA instance
 */
EpicField = (function () {

  // default fields for epic storage
  function _getDefault() {
    return {
      usable: false,  // true|false
      key: 'jst_epic',
      name: 'Epic',
      link_key: null, // customfield_10003
      label_key: null  // customfield_10005
    };
  }
  
  // function called lazily to initialise the epic settings
  function _init() {
    if (_epicField == null) {
      _epicField = UserStorage.getValue('jst_epic');
    }
    if (_epicField == null) {
      _epicField = _getDefault();
    }
  };

  // sets the value on usable when link and label values are set
  function _setUsable() {
    _epicField.usable = false;
    if (_epicField.link_key != null && _epicField.label_key != null) {
      _epicField.usable = true;
      UserStorage.setValue('jst_epic', _epicField);
    }
  };

  var _epicField = null;

  return {
    // get the epicField JSON
    getJson: function () {
      _init();
      return copyObject(_epicField);
    },
    resetValue: function() {
      _epicField = _getDefault();
      UserStorage.setValue('jst_epic', _epicField);
    },
    isUsable: function() {
      _init();
      return _epicField.usable;
    },
    getLabelKey: function() {
      _init();
      return _epicField.label_key;
    },
    setLabelKey: function(value) {
      _init();
      _epicField.label_key = value;
      _setUsable();
    },
    getLinkKey: function() {
      _init();
      return _epicField.link_key;
    },
    setLinkKey: function(value) {
      _init();
      _epicField.link_key =value;
      _setUsable();
    },
    getKey: function() {
      _init();
      return _epicField.key;
    },
    getName: function() {
      _init();
      return _epicField.name;
    }, 
    reset: function() {
      UserStorage.removeValue('jst_epic');
      _epicField = null
    }
  }
})();

// Node required code block
module.exports = EpicField;
// End of Node required code block