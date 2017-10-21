/**
 * @desc Returns a list of users that match the search string.
 *       This resource cannot be accessed anonymously.
 *       Sample: 
 *         findUser('a%')
 *         findUser('ab%')
 *         findUser('abc%')
 *         findUser('z%')
 * @param usernameTerm {string}  A query string used to search username, name or e-mail address
 * @param {boolean} minimal  Def:FALSE; Returning data only includes minimal info (displayName,name[,active])
 * @return {Array}
 */
function findUser(usernameTerm, minimal) {
  var method = 'userSearch', 
      usernameTerm = usernameTerm || '%',
      minimal = minimal || false,
      users = [];

  /**
   * @desc OnSuccess handler
   * @param resp {Object}    JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return Mixed
   */
  var ok = function(resp, httpResp, status){
    if(resp) {
      if(resp.length == 0) {
        Browser.msgBox("No users were found to match your search.", Browser.Buttons.OK);
        return users;
      }

      var user;
      for(var i=0; i<resp.length; i++) {
        user = unifyIssueAttrib((minimal ? 'userMin' : 'user'), resp[i]);
        users.push(user);
      }
    } else {
      // Something funky is up with the JSON response.
      Browser.msgBox("Failed searching for user!", Browser.Buttons.OK);
      return users;
    }
  };

  /**
   * @desc OnFailure handler
   * @param resp {Object}    JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return {Array}
   */
  var error = function(resp, httpResp, status) {
    Browser.msgBox("Failed api search request with error status [" + status + "]!\\n" + resp.errorMessages.join("\\n"), 
                   Browser.Buttons.OK);
    return users;
  };

  var request = new Request();

  request.call(method, {username: usernameTerm})
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return users;
}

/**
 * @desc Returns groups with substrings matching a given query.
 *       Sample: 
 *         findGroup('a')
 *         findGroup('ab')
 *         findGroup('abc')
 *         findGroup('z')
 * @param groupTerm {string}  A query string used to search group name
 * @param {boolean} minimal  Def:FALSE; Returning data only includes minimal info (displayName,name[,active])
 * @return {Array}
 */
function findGroup(groupTerm, minimal) {
  var method = 'groupSearch', 
      groupTerm = groupTerm || '',
      minimal = minimal || false,
      groups = [];

  groupTerm = trimChar(groupTerm, "%");

  /**
   * @desc OnSuccess handler
   * @param resp {Object}    JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return Mixed
   */
  var ok = function(resp, httpResp, status) {
    if(resp && resp.hasOwnProperty('groups')) {
      if(resp.groups.length == 0) {
        Browser.msgBox("No groups were found to match your search.", Browser.Buttons.OK);
        return groups;
      }

      var group;
      for(var i=0; i<resp.groups.length; i++) {
        group = unifyIssueAttrib((minimal ? 'groupMin' : 'group'), resp.groups[i]);
        groups.push(group);
      }

    } else {
      // Something funky is up with the JSON response.
      debug.log('Failed searching for group: %s ; %s', httpResp, resp);
      Browser.msgBox("Failed searching for group!", Browser.Buttons.OK);
      return groups;
    }
  };

  /**
   * @desc OnFailure handler
   * @param resp {Object}    JSON response object from Jira
   * @param httpResp {Object}
   * @param status {Number}
   * @return {Array}
   */
  var error = function(resp, httpResp, status) {
    Browser.msgBox("Failed api search request with error status [" + status + "]!\\n" + resp.errorMessages.join("\\n"), Browser.Buttons.OK);
    return groups;
  };

  var request = new Request();

  request.call(method, {query: groupTerm})
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return groups;
}

//function testFindUsers(){ debug.log('%s', findUser('%')); }
//function testFindGroups(){ debug.log('%s', findGroup('')); }
