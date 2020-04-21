// Node required code block
var debug = require("src/debug.gs").debug;
global.environmentConfiguration = require('src/environmentConfiguration.gs');
const extend = require('../../jsLib.gs').extend;
const Request = require('src/jiraApi.gs');
// End of Node required code block

/**
 * @desc Class 'JiraFilter'.
 *       A model class to reflect a Jira Filter object, can fetch and update from Jira api.
 *       Init class with single optional argument.
 *       Example:
 *         var filter      = new Filter();
 *         var filterById  = new Filter(123);
 *         var filterByObj = new Filter({id:123, name:'Filter Name'});
 *         
 * @param {integer|object|undefined}
 * @param {integer=} [filterId]  Optional filter Id to identify a Jira filter object
 * @param {object=} [filter]  Optional filter object of Jira filter
 */
function JiraFilter(argument) {
  var that = this; // clear encapsulation of scope's
  var filter = {
      owner: {
        displayName: '',
        name: '',
        accountId: ''
      }, 
      jql: '',  
      name: '', 
      viewUrl: null, 
      //self: 'https://<name>.atlassian.net/rest/api/2/filter/14415', 
      id: null,
      favourite: null
  };
  var modified = false;

  /**
   * @desc Initialization, validation
   * @return void
   */
  init = function (argument) {
    debug.log('Filter:init(%s)', JSON.stringify(argument));
    if (parseInt(argument) > 0) {
      // init class with given FilterId
      filter.id = parseInt(argument);
    } else if(typeof argument === 'object') {
      // init class with data object
      filter = extend(filter, argument);
    }
  };

  init(argument);

  /* -------- */

  /**
   * @desc Is filter's Name or Id modified or not
   * @return {boolean}
   */
  that.isModified = function() {
    return (modified === true);
  };

  /**
   * @desc Return Filter's Id
   * @return {integer}
   */
  that.getId = function() {
    return filter.id;
  };

  /**
   * @desc Return Filter's JQL query string
   * @return {string}
   */
  that.getJql = function() {
    return filter.jql;
  };

  /**
   * @desc Return filter object
   * @return {Object}
   */
  that.getFilter = function() {
    return filter;
  };

  /**
   * @desc Updates/fetch Jira filter data from Jira api.
   * @return {JiraFilter}
   */
  that.update = function() {
    if (parseInt(filter.id) == 0) {
      throw new Error("Can not update filter without {filter.id}.");
    }

    return update();
  };

  /**
   * @desc OnSuccess handler
   * @param resp {Object} JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return void
   */
  var onSuccess = function (resp, httpResp, status) {
    debug.log('Filter:onSuccess: [%s] %s - %s', status, resp, httpResp);
    var compareOriginalFilterObj = JSON.stringify([filter.name, filter.jql]);

    try {
      filter.jql = resp.jql;
      filter.name = resp.name;
      filter.owner.displayName = resp.owner.displayName;
      filter.owner.name = resp.owner.name || '';
      filter.owner.accountId = resp.owner.accountId || '';
      filter.viewUrl = resp.viewUrl;
      filter.favourite = (resp.favourite == 'true');

      // filter data changes?
      var compareFilterObj = JSON.stringify([filter.name, filter.jql]);
      if (compareOriginalFilterObj != compareFilterObj) {
        modified = true;
      }
    } catch (e) {
      console.error(e);
    }

    debug.timeEnd('Filter.update(' + filter.id + ')');
  };

  /**
   * @desc OnFailure handler
   * @param resp {Object} JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return void
   */
  var onFailure = function (resp, httpResp, status) {
    console.error('Filter:onFailure: [%s] %s - %s', status, resp, httpResp);

    var msgs = resp.hasOwnProperty('errorMessages') ? resp.errorMessages : [];
    msgs = msgs.concat((resp.hasOwnProperty('warningMessages') ? resp.warningMessages : []));

    debug.error('Filter:onFailure: %s', msgs.join("\n"));

    debug.timeEnd('Filter.update(' + filter.id + ')');
  };

  /**
   * @desc Perform Update/Fetch
   * @return {this} Allow chaining
   */
  update = function () {
    debug.time('Filter.update(' + filter.id + ')');
    debug.log("Fetch updates for Jira filter id [%s].", filter.id);

    var data = {
      filterId: filter.id
    };

    var request = new Request();
    request.call('filter', data)
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure);

    return that;
  };

}

// Node required code block
module.exports = Filter;
// End of Node required code block
