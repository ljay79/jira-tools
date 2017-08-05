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

  var ok = function(responseData, httpResponse, statusCode){
    if(responseData) {
      if(responseData.length == 0) {
        Browser.msgBox("No users were found to match your search.", Browser.Buttons.OK);
        return users;
      }

      var user;
      for(var i=0; i<responseData.length; i++) {
        user = unifyIssueAttrib((minimal?'userMin':'user'), responseData[i]);
        users.push(user);
      }
      
    } else {
      // Something funky is up with the JSON response.
      Browser.msgBox("Failed searching for user!", Browser.Buttons.OK);
      return users;
    }
  };

  var error = function(responseData, httpResponse, statusCode) {
    Browser.msgBox("Failed api search request with error status [" + statusCode + "]!\\n" + responseData.errorMessages.join("\\n"), Browser.Buttons.OK);
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

  var ok = function(responseData, httpResponse, statusCode){
    if(responseData && responseData.hasOwnProperty('groups')) {
      if(responseData.groups.length == 0) {
        Browser.msgBox("No groups were found to match your search.", Browser.Buttons.OK);
        return groups;
      }

      var group;
      for(var i=0; i<responseData.groups.length; i++) {
        group = unifyIssueAttrib((minimal?'groupMin':'group'), responseData.groups[i]);
        groups.push(group);
      }

    } else {
      // Something funky is up with the JSON response.
      Browser.msgBox("Failed searching for group!", Browser.Buttons.OK);
      return groups;
    }
  };

  var error = function(responseData, httpResponse, statusCode) {
    Browser.msgBox("Failed api search request with error status [" + statusCode + "]!\\n" + responseData.errorMessages.join("\\n"), Browser.Buttons.OK);
    return groups;
  };

  var request = new Request();

  request.call(method, {query: groupTerm})
    .withSuccessHandler(ok)
    .withFailureHandler(error);

  return groups;
}

//function testFindUsers(){ log('%s', findUser('%')); }
//function testFindGroups(){ log('%s', findGroup('')); }
