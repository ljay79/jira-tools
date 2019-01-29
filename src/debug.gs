/**
 * @desc JavaScript Debug: A simple wrapper for console.?
 *       Allowing Google StackDriver logging to be optionally switched on/off by user.
 */
debug = (function () {
  var aps = Array.prototype.slice,
    con = console,

    // Public object to be returned.
    that = {},

    // has the debugger been initialised
    initialised = false,

      // switch logger on/off; default: off
    log_enabled = false,

    // Logging methods, in "priority order". Not all console implementations
    log_methods = ['log', 'info', 'warn', 'error', 'time', 'timeEnd'],

    idx = log_methods.length;
  while (--idx >= 0) {
    (function (idx, method) {
      that[method] = function () {
        if (!initialised) {
          that.enable();
        }
        var args = aps.call(arguments, 0);
        if (!con || !log_enabled) { return; }
        con[method] ? con[method].apply(con, args) : con.log('[method]:', args);
      };
    })(idx, log_methods[idx]);
  }

  /**
   * @desc Toggle logging on/off
   * @param {boolean}
   * @return {this}    Allows chaining
   */
  that.enable = function( enable ) {
    var userDebugFlag = false;
	  try {
      // getUserProperties may not be available at this point in the lifecycle
      var userProps = PropertiesService.getUserProperties();
      var uDebugging = userProps.getProperty('debugging');
      userDebugFlag = (uDebugging == 'true');
    } catch(e){
      // do nothing - its expected that there may be an exception
    }
    log_enabled = enable || userDebugFlag || environmentConfiguration.debugEnabled;
    // if this has been called the debugger has been initialised
    initialised = true;
    return that;
  };

  that.isEnabled = function() {
    return log_enabled;
  }

  return that;
})();

/**
 * @desc Toggle user preference for debugging on/off from about dialog.
 * @param formData {string}    "1" for enable, "0" for disable
 */
function toggleDebugging(formData) {
  var userProps = PropertiesService.getUserProperties();
  var debugging = formData == '1' ? 'true' : 'false';
  userProps.setProperty('debugging', debugging);
  debug.enable( (debugging=='true') );
  console.log(
    'Debugging preference switched to [%s] Environment setting is [%s] Debugging is [%s]', 
    (debugging=='true' ? 'ON' : 'OFF'), 
    (environmentConfiguration.debugEnabled ? 'ON' : 'OFF'),
    (debug.isEnabled() ? 'ON' : 'OFF')
  );
}


// Node required code block
module.exports = {debug:debug, toggleDebugging:toggleDebugging}
// End of Node required code block
