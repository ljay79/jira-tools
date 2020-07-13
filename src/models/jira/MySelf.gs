// Node required code block
var debug = require("src/debug.gs").debug;
global.environmentConfiguration = require('src/environmentConfiguration.gs');
const extend = require('../../jsLib.gs').extend;
const User = require('src/models/jira/User.gs');
const Request = require('src/jiraApi.gs');
// End of Node required code block


/**
 * @desc Class 'MySelf'.
 *       A model class reflecting the current users jira profile.
 */
function MySelf() {
  var that = this; // clear encapsulation of scope's
  var _myself;

  /**
   * @desc Initialization, validation
   * @return void
   */
  init = function () {
    debug.log('MySelf:init()');

    _myself = new User(getCfg_('myself'));

    if(!_myself.hasOwnProperty('displayName') || _myself.displayName == '') {
      that.fetch();
    }
  };

  /* -------- */

  /**
   * @desc Get accountId
   * @return {String}
   */
  that.getAccountId = function() {
    return _myself.accountId;
  };

  /**
   * @desc Get email address
   * @return {String}
   */
  that.getEmailAddress = function() {
    return _myself.emailAddress;
  };

  /**
   * @desc Get users display name
   * @return {String}
   */
  that.getDisplayName = function() {
    return _myself.displayName;
  };

  /**
   * @desc Get users jira active status
   * @return {Boolean}
   */
  that.getActive = function() {
    return _myself.active;
  };

  /**
   * @desc OnSuccess handler
   * @param resp {Object} JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return void
   */
  var onSuccess = function (resp, httpResp, status) {
    debug.log('MySelf:onSuccess: [%s] %s - %s', status, resp, httpResp);

    try {
      _myself.setAccountId(resp.accountId);
      _myself.setEmailAddress(resp.emailAddress);
      _myself.setDisplayName(resp.displayName);
      _myself.setActive(resp.active);
    } catch (e) {
      console.error(e);
    }

    setCfg_('myself', _myself);

    debug.timeEnd('MySelf.fetch');
  };

  /**
   * @desc OnFailure handler
   * @param resp {Object} JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return void
   */
  var onFailure = function (resp, httpResp, status) {
    console.error('Myself:onFailure: [%s] %s - %s', status, resp, httpResp);
    debug.timeEnd('MySelf.fetch');
  };

  /**
   * @desc Perform Update/Fetch
   * @return {this} Allow chaining
   */
  that.fetch = function () {
    debug.time('MySelf.fetch');
    debug.log('Fetch myself user info');

    var request = new Request();
    request.call('myself')
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure);

    return that;
  };


  init();
}

// Node required code block
module.exports = Filter;
// End of Node required code block
