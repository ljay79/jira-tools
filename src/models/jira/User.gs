// Node required code block
var debug = require("src/debug.gs").debug;
const extend = require('../../jsLib.gs').extend;
// End of Node required code block


/**
 * @desc Class 'User'.
 *       A model class to reflect a Jira User object
 * @param {Object} data    A Jira user object
 */
function User(_data) {
  var that = this; // clear encapsulation of scope's
  this.accountId    = '';
  this.emailAddress = '';
  this.displayName  = '';
  this.active       = false;

  /**
   * @desc Initialization, validation
   * @param {Object} data    A Jira user object
   * @return void
   */
  init = function (_data) {
    debug.log('User:init()');

    var _data = extend({
      accountId    : '',
      emailAddress : '',
      displayName  : '',
      active       : false
    }, _data || {});
    
    if (_data.accountId) {
      that.setAccountId(_data.accountId);
    }
    if (_data.emailAddress) {
      that.setEmailAddress(_data.emailAddress);
    }
    if (_data.displayName) {
      that.setDisplayName(_data.displayName);
    }
    if (_data.active || _data.active === false) {
      that.setActive(_data.active);
    }
  };

  /* -------- */

  /**
   * @desc Set account id
   * @return {this}
   */
  that.setAccountId = function(accountId) {
    that.accountId = accountId;
    return that;
  };

  /**
   * @desc Set email address
   * @return {this}
   */
  that.setEmailAddress = function(emailAddress) {
    that.emailAddress = emailAddress;
    return that;
  };

  /**
   * @desc Set display name
   * @return {this}
   */
  that.setDisplayName = function(displayName) {
    that.displayName = displayName;
    return that;
  };

  /**
   * @desc Set active state
   * @return {this}
   */
  that.setActive = function(active) {
    that.active = (active === true || active === 'true') ? true : false;
    return that;
  };

  
  init(_data);
}


// Node required code block
module.exports = User;
// End of Node required code block
