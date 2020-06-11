/**
 * Model class for storage of bulk customfield settings
 */

// Node required code block
const UserStorage = require("src/models/gas/UserStorage.gs");
// End of Node required code block


var CustomFields = {

  fields: [],

  save: function(data) {
    // Storage limitation workaround for users with a lot of custom fields (#255)
    var _limit = 10, _i, _chunkLen = 0, _chunk = [];
    var _length = data.length;

    if (_length > _limit) {
      for(_i=0; _i<_length; _i++) {
        _chunk = data.splice(0, _limit);
        UserStorage.setValue('favoriteCustomFields_' + _i, JSON.stringify(_chunk));
        _length -= _limit - 1;
        _chunkLen++;
        debug.log("Saved CustomFields chunks[%d]: %s", _chunk.length, _chunk);
      }

    } else {
      UserStorage.setValue('favoriteCustomFields', JSON.stringify(data));
      debug.log("Saved CustomFields[%d]: %s", _length, JSON.stringify(data));
    }

    UserStorage.setValue('favoriteCustomFields_length', _chunkLen);

    StorageCounter.log();
  },

  load: function() {
    if (this.fields.length == 0) {
      this.fields = this._loadFromStorage();
    }
    return this.fields;
  },

  _loadFromStorage: function() {
    var customFields = [];
    var _chunkLen = UserStorage.getValue('favoriteCustomFields_length') || 0;
    var _data = [], data = UserStorage.getValue('favoriteCustomFields') || '[]';

    if (_chunkLen == 0) {
      customFields = JSON.parse(data);
      debug.log("Loaded CustomFields[%d]: %s", customFields.length, JSON.stringify(customFields));
    } else {
      var _i = 0;
      for(_i=0; _i<_chunkLen; _i++) {
        _data = JSON.parse(UserStorage.getValue('favoriteCustomFields_' + _i) || '[]');
        customFields.push.apply(customFields, _data);
        debug.log("Loaded CustomFields chunks[%d]: %s", _data.length, JSON.stringify(_data));
      }
    }
    
    StorageCounter.log();

    return customFields;
  },

  reset: function() {
	  this.fields = [];
  }

};


// Node required code block
module.exports = CustomFields
// End of Node required code block
