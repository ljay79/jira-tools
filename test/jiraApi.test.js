

global.environmentConfiguration = require('../src/environmentConfiguration.gs');
const hasSettings = require("../src/settings.gs").hasSettings;
const debug = require("../src/debug.gs").debug;
const Request = require('../src/jiraApi.gs');
PropertiesService = require('./mocks/PropertiesService');

Browser = {
  Buttons: {
    OK: "OK"
  },
  msgBox: function (type, exception, button) {
    debug.error("Browser.msgBox " + exception);
  }
};

UrlFetchApp = {
  fetch: function () { }
}

Utilities = {
  base64Encode: function () { }
}

beforeEach(() => {
  Browser.msgBox = jest.fn();
  Utilities.base64Encode = jest.fn();
  UrlFetchApp.fetch = jest.fn();
  debug.enable(false);
});

function initJiraDummyConfig() {
  var getCfg = require("../src/settings.gs").getCfg;
  var setCfg = require("../src/settings.gs").setCfg;
  setCfg('jira_url', "https://jiraserver");
  setCfg('jira_username', "username");
  setCfg('jira_password', "password");
}

test('no jira config should give an error when making a request', () => {
  var requestObj = new Request();

  // no settings for Jira instance should give an error
  // @TODO: require actual valid ticket number from used JIRA instance
  requestObj.call("issueStatus", {
    issueIdOrKey: "PBI-1"
  });
  var result = requestObj.getResponse();
  expect(result.statusCode).toBe(-1);
  expect(result.respData).not.toBeNull();
  expect(result.respData.errorMessages).not.toBeNull();
});

test('an exception when calling UrlFetchApp should be handled', () => {
  initJiraDummyConfig();
  var requestObj = new Request();
  // exception on UrlFetchApp should show a browser box
  UrlFetchApp.fetch.mockImplementationOnce((fetchUrl, args) => {
    throw "Error";
  });
  requestObj.call("issueStatus", {
    issueIdOrKey: "PBI-1"
  });
  var result = requestObj.getResponse();
  expect(Browser.msgBox.mock.calls.length).toBe(1);
  expect(UrlFetchApp.fetch.mock.calls.length).toBe(1);
  expect(Utilities.base64Encode.mock.calls.length).toBe(1);
  expect(Utilities.base64Encode.mock.calls[0][0]).toBe("username:password");
  expect(result.statusCode).toBe(500);
  expect(result.respData).not.toBeNull();
});

test('invalid JSON from mock JIRA should be handled', () => {
  initJiraDummyConfig();
  var requestObj = new Request();
  Utilities.base64Encode.mockImplementation((param) => "base64:" + param);
  // exception on UrlFetchApp should show a browser box
  UrlFetchApp.fetch.mockImplementationOnce((fetchUrl, args) => {
    return {
      getResponseCode: function () {
        return 500;
      },
      getContentText: function () {
        return "THIS IS NOT VALID JSON";
      },
      getAllHeaders: function () {
        return {};
      }
    };
  });

  var successHandler = jest.fn();
  var errorHandler = jest.fn();
  requestObj.call("issueStatus", {
    issueIdOrKey: "PBI-2"
  }).withSuccessHandler(successHandler).withFailureHandler(errorHandler);

  var result = requestObj.getResponse();
  expect(UrlFetchApp.fetch.mock.calls.length).toBe(1);
  expect(successHandler.mock.calls.length).toBe(0);
  expect(errorHandler.mock.calls.length).toBe(1);
  expect(result.statusCode).toBe(500);
  expect(result.method).toBe('get');
  expect(result.respData).not.toBeNull();
  expect(result.respData.errorMessages).not.toBeNull();
});

test('a basic request should be handloed with password and username included', () => {
  initJiraDummyConfig();
  var requestObj = new Request();
  Utilities.base64Encode.mockImplementation((param) => "base64:" + param);
  //  exception on UrlFetchApp should show a browser box
  UrlFetchApp.fetch.mockImplementationOnce((fetchUrl, args) => {
    return {
      getResponseCode: function () {
        return 200;
      },
      getContentText: function () {
        return "{}";
      },
      getAllHeaders: function () {
        return {};
      }
    };
  });
  var successHandler = jest.fn();
  var errorHandler = jest.fn();
  requestObj.call("issueStatus", {
    issueIdOrKey: "PBI-2"
  })
  expect(Browser.msgBox.mock.calls.length).toBe(0);
  expect(UrlFetchApp.fetch.mock.calls.length).toBe(1);
  expect(UrlFetchApp.fetch.mock.calls[0][0]).toBe("https://jiraserver/rest/api/2/issue/PBI-2?fields=status");
  expect(UrlFetchApp.fetch.mock.calls[0][1]).not.toBeNull();
  expect(UrlFetchApp.fetch.mock.calls[0][1]["method"]).not.toBeNull();
  expect(UrlFetchApp.fetch.mock.calls[0][1]["method"]).toBe("get");
  expect(UrlFetchApp.fetch.mock.calls[0][1]["headers"]).not.toBeNull();
  expect(UrlFetchApp.fetch.mock.calls[0][1]["headers"]["Authorization"]).not.toBeNull();
  expect(UrlFetchApp.fetch.mock.calls[0][1]["headers"]["Authorization"]).toBe("Basic base64:username:password");

  requestObj.withSuccessHandler(successHandler).withFailureHandler(errorHandler);
  expect(successHandler.mock.calls.length).toBe(1);
  expect(errorHandler.mock.calls.length).toBe(0);

  var result = requestObj.getResponse();
  expect(result.statusCode).toBe(200);
  expect(result.method).toBe('get');
  expect(result.respData).not.toBeNull();
  expect(result.respData.errorMessages).toBeUndefined();


});

test('query parameters should be added to the url for user search method', () => {
  initJiraDummyConfig();
  var requestObj = new Request();
  // exception on UrlFetchApp should show a browser box
  UrlFetchApp.fetch.mockImplementationOnce((fetchUrl, args) => {
    return {
      getResponseCode: function () {
        return 200;
      },
      getContentText: function () {
        return "{}";
      },
      getAllHeaders: function () {
        return {};
      }
    };
  });
  var successHandler = jest.fn();
  var errorHandler = jest.fn();

  requestObj.call("userSearch", {
    username: "paul"
  }).withSuccessHandler(successHandler).withFailureHandler(errorHandler);

  var result = requestObj.getResponse();

  expect(Browser.msgBox.mock.calls.length).toBe(0);
  expect(UrlFetchApp.fetch.mock.calls[0][0]).toBe("https://jiraserver/rest/api/2/user/search?startAt=0&maxResults=250&username=paul");
  expect(result.statusCode).toBe(200);
  expect(result.respData).not.toBeNull();
  expect(result.method).toBe('get');
  expect(result.respData.errorMessages).toBeUndefined();
  expect(successHandler.mock.calls.length).toBe(1);
  expect(errorHandler.mock.calls.length).toBe(0);


});
test('a jira dashboard request is made correctly', () => {
  initJiraDummyConfig();
  var requestObj = new Request();
  //  exception on UrlFetchApp should show a browser box
  UrlFetchApp.fetch.mockImplementationOnce((fetchUrl, args) => {
    return {
      getResponseCode: function () {
        return 200;
      },
      getContentText: function () {
        return "{}";
      },
      getAllHeaders: function () {
        return {};
      }
    };
  });
  requestObj.call("dashboard", {})
  var result = requestObj.getResponse();
  expect(UrlFetchApp.fetch.mock.calls.length).toBe(1);
  expect(UrlFetchApp.fetch.mock.calls[0][0]).toBe("https://jiraserver/rest/api/2/dashboard");
  expect(result.statusCode).toBe(200);
  expect(result.respData).not.toBeNull();
  expect(result.respData.errorMessages).toBeUndefined();


});

test('a PUT request is made for updating issues', () => {
  initJiraDummyConfig();
  var requestObj = new Request();
  //  exception on UrlFetchApp should show a browser box
  UrlFetchApp.fetch.mockImplementationOnce((fetchUrl, args) => {
    return {
      getResponseCode: function () {
        return 204;
      },
      getContentText: function () {
        return "{}";
      },
      getAllHeaders: function () {
        return {};
      }
    };
  });
  requestObj.call("issueUpdate", {
    issueIdOrKey: "PBI-2",
    "fields": {
      "summary": "NEW Summary",
      "description": "Description",
      "customfield_10200": "Test 1",
      "customfield_10201": "Value 1"
    }
  });
  var result = requestObj.getResponse();
  expect(UrlFetchApp.fetch.mock.calls.length).toBe(1);
  expect(UrlFetchApp.fetch.mock.calls[0][0]).toBe("https://jiraserver/rest/api/2/issue/PBI-2");
  expect(UrlFetchApp.fetch.mock.calls[0][1]["method"]).not.toBeNull();
  expect(UrlFetchApp.fetch.mock.calls[0][1]["method"]).toBe("put");
  expect(UrlFetchApp.fetch.mock.calls[0][1]["payload"]).not.toBeNull();
  var payload = JSON.parse(UrlFetchApp.fetch.mock.calls[0][1]["payload"]);
  expect(payload["fields"]).not.toBeNull();
  expect(payload["fields"]["summary"]).not.toBeNull();
  expect(payload["fields"]["summary"]).toBe("NEW Summary");
  expect(UrlFetchApp.fetch.mock.calls[0][1]["contentType"]).not.toBeNull();
  expect(UrlFetchApp.fetch.mock.calls[0][1]["contentType"]).toBe("application/json");
  expect(result.statusCode).toBe(204);
  expect(result.respData).not.toBeNull();
  expect(result.method).toBe('put');
  expect(result.respData.errorMessages).toBeUndefined();


});
