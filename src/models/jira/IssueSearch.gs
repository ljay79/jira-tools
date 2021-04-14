// Node required code block
var debug = require("src/debug.gs").debug;
global.environmentConfiguration = require('src/environmentConfiguration.gs');
const Request = require('src/jiraApi.gs');
const EpicField = require("src/models/jira/EpicField.gs");
// End of Node required code block

/**
 * @desc Class 'IssueSearch' API abstraction with pagination handling.
 *       Performs a JQL POST search request to JIRA Rest API.
 * @param searchQuery {String}    JQL Query statement
 */
function IssueSearch(searchQuery) {
  var fields = ['key'],
      startAt = 0, maxResults = 1000, maxPerPage = 50,
      queryStr = searchQuery, orderBy = '', orderDir = 'ASC',
      expand = false;
  var response = {
    'data' : [],
    'totalFoundRecords' : 0,
    'status' : -1,
    'errorMessage' : ''
  };

  /**
   * @desc Initialize anything necessary for the class object
   * @return void
   */
  this.init = function () {};

  /**
   * @desc Set the list of jira issue fields to be returned in search response for each issue.
   * @param aFields {Array} Array of jira issue fields
   * @return {this} Allow chaining
   */
  this.setFields = function (aFields) {
    if (aFields.constructor == Array) {
      fields = aFields;
      // has custom Epic field 'jst_epic'?
      if (fields.indexOf(EpicField.EPIC_KEY) > -1) { // Found
        if (EpicField.isUsable()) {
          var _link_key = EpicField.getLinkKey();
          if (fields.indexOf(_link_key) == -1) fields.push(_link_key);
        }
      }
    } else {
      throw '{aFields} is not an Array.';
    }

    return this;
  };

  /**
   * @desc Set result offset start for pagination of search results.
   * @param iStartAt {Number} Number, default:0
   * @return {this} Allow chaining
   */
  this.setStartAt = function (iStartAt) {
    if (iStartAt.constructor == Number) {
      startAt = iStartAt;
    } else {
      throw '{iStartAt} is not a Number.';
    }

    return this;
  };

  /**
   * @desc Set result offset limit for pagination of search results.
   * @param iMaxResults {Number} Number, default:1000
   * @return {this} Allow chaining
   */
  this.setMaxResults = function (iMaxResults) {
    if (iMaxResults.constructor == Number) {
      maxResults = iMaxResults;
    } else {
      throw '{iMaxResults} is not a Number.';
    }

    return this;
  };

  /**
   * @desc Return max results used for search
   * @return {Number} iMaxResults
   */
  this.getMaxResults = function () {
    return maxResults;
  };

  /**
   * @desc Set max results per page
   * @param iMaxPerPage {Number} Integer of how many results max per page to fetch
   * @return {this} Allow chaining
   */
  this.setMaxPerPage = function (iMaxPerPage) {
    if (iMaxPerPage.constructor == Number) {
      maxPerPage = iMaxPerPage;
    } else {
      throw '{iMaxPerPage} is not a Number.';
    }

    return this;
  };

  /**
   * @desc Set Order of results (JQL order by clause)
   * @param sOrderBy {String} Jira field to order by. Example: 'updated'
   * @param sDir {String} Direction of order; 'ASC' or 'DESC'
   * @return {this} Allow Chaining
   */
  this.setOrderBy = function (sOrderBy, sDir) {
    sOrderBy = sOrderBy || '', sDir = sDir || 'ASC';

    if( sOrderBy != '' ) orderBy  = sOrderBy;
    if( sDir != '' )     orderDir = sDir;

    return this;
  };

  /**
   * @desc Set expand
   * @param sExpand {Array} Example: ['changelog']
   * @return {this} Allow Chaining
   */
  this.setExpand = function (sExpand) {
    expand = sExpand;
    return this;
  };



  /**
   * @desc Callback Success handler
   * @param fn {function} Method to call on successfull request (statue=200)
   * @return {this} Allow chaining
   */
  this.withSuccessHandler = function (fn) {
    if (response.status === 200) {
      fn.call(this, {
        data : response.data,
        totalFoundRecords : response.totalFoundRecords
      }, response.status, response.errorMessage);
    }
    return this;
  };

  /**
   * @desc Callback Failure handler
   * @param fn {function} Method to call on failed request (status!==200)
   * @return {this} Allow chaining
   */
  this.withFailureHandler = function (fn) {
    if (response.status !== 200) {
      debug.log("withFailureHandler: %s", response);
      fn.call(this, {
        data : response.data,
        totalFoundRecords : response.totalFoundRecords
      }, response.status, response.errorMessage);
    }
    return this;
  };

  /**
   * @desc Prepare JQL search query
   * @return {String}
   */
  var getJql = function () {
    var jql = queryStr + ((orderBy != '') ? ' ORDER BY ' + orderBy + ' ' + orderDir : '');
    debug.log('IssueSearch JQL: [%s]', jql);

    // return encodeURIComponent(jql); //only when api call is performed as GET
    return jql;
  };

  /**
   * @desc OnSuccess handler for search request
   * @param resp {Object} JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return void
   */
  var onSuccess = function (resp, httpResp, status) {
    var _total = parseInt(resp.total || 0);
    debug.log('onSuccess found total: %s', _total);

    // nothing found - return class response
    if (_total == 0) {
      response = {
        'data' : resp.issues || resp,
        'totalFoundRecords' : _total,
        'status' : status,
        'errorMessage' : resp.hasOwnProperty('warningMessages') ? resp.warningMessages : 'No results found.'
      };
      return;
    }

    // add current results and status
    response.data.push.apply(response.data, resp.issues || []);
    response.status = status;
    response.totalFoundRecords = _total;

    // pagination / sub-requests required?
    var _countTotalResults = parseInt(resp.startAt) + parseInt(resp.maxResults);
    if ((_countTotalResults < _total) && (_countTotalResults < maxResults)) {
      // more data to fetch
      debug.log('-- subSearch: %s / %s of max: %s', _countTotalResults, _total, maxResults);

      // provide little feedback to user
      var _currPage = Math.ceil(_countTotalResults / maxPerPage) + 1;
      var _maxPage  = Math.ceil((_total<maxResults?_total:maxResults) / maxPerPage);
      SpreadsheetApp.getActiveSpreadsheet().toast(".. fetching result page "+_currPage+" / " + _maxPage, "Progress", 5);

      var subSearch = new IssueSearch( queryStr );
      subSearch.setOrderBy( orderBy, orderDir )
               .setFields( fields )
               .setMaxPerPage( maxPerPage )
               .setMaxResults( maxResults )
               .setStartAt( _countTotalResults )
               .setExpand(expand);

      subSearch.search().withSuccessHandler(function(resp, status, errorMessage) {
        // append results to parent results
        try {
          response.data.push.apply(response.data, resp.data || []);
          response.status = status;
        } catch (e) {
          response.status = 500;
          response.errorMessage = e;
          debug.error("Exception: %s || response: %s", e, resp);
        }
      }); // dont bubble up failure - 1st call was successfull so we soft-fail and response with results found so far
    }

    debug.timeEnd('IssueSearch.search(' + startAt + ')');
  };

  /**
   * @desc OnFailure handler for search request
   * @param resp {Object} JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return void
   */
  var onFailure = function (resp, httpResp, status) {
    debug.error('IssueSearch:onFailure: [%s] %s - %s', status, resp, httpResp);

    var msgs = resp.hasOwnProperty('errorMessages') ? resp.errorMessages : [];
    msgs = msgs.concat((resp.hasOwnProperty('warningMessages') ? resp.warningMessages : []));

    response.status = status;
    response.errorMessage = msgs.join("\n");

    debug.timeEnd('IssueSearch.search(' + startAt + ')');
  }

  /**
   * @desc Perform Search
   * @return {this} Allow chaining
   */
  this.search = function () {
    debug.time('IssueSearch.search(' + startAt + ')');
    debug.log("search with startAt:%s, maxPerPage:%s, totalMaxResults:%s and field:[%s]", startAt, maxPerPage, maxResults, fields);

    var data = {
      jql : getJql(),
      fields : fields,
      startAt : startAt,
      maxResults : (maxResults < maxPerPage) ? maxResults : maxPerPage
    };

    if (expand) {
      data.expand = expand;
    }

    var request = new Request();
    request.call('search', data, {'method' : 'post'})
      .withSuccessHandler(onSuccess)
      .withFailureHandler(onFailure);

    return this;
  };

  this.init();
}

// Node required code block
module.exports = IssueSearch;
// End of Node required code block
