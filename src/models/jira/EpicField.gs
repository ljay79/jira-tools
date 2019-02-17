// Node required code block
const copyObject = require('../../jsLib.gs').copyObject;
const UserStorage = require("src/models/gas/UserStorage.gs");
// End of Node required code block

/**
 * Model class for accessing and storing the custom defined fields for Epic in a JIRA instance
 */
EpicField = (function () {

  var EPIC_KEY = 'jst_epic';
  // default fields for epic storage
  function _getDefault() {
    return {
      usable: false,  // true|false
      key: EPIC_KEY,
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
      UserStorage.setValue(EPIC_KEY, _epicField);
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
      UserStorage.setValue(EPIC_KEY, _epicField);
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
      UserStorage.removeValue(EPIC_KEY);
      _epicField = null
    },
    EPIC_KEY: EPIC_KEY
  }
})();

// Node required code block
module.exports = EpicField;
// End of Node required code block