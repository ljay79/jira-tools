environmentConfiguration = require('src/environmentConfiguration.gs');
environmentConfiguration.debugEnabled = false;
debug = require('src/debug.gs').debug;


// define GAS globals
ScriptApp = require('test/mocks/ScriptApp');
PropertiesService = require('test/mocks/PropertiesService');
SpreadsheetApp = require('test/mocks/SpreadsheetApp');
HtmlService = require('test/mocks/HtmlService');
Session = require('test/mocks/Session');
SpreadsheetApp = require('test/mocks/SpreadsheetApp');
Browser = require('test/mocks/Browser');

UrlFetchApp = {
  fetch: function () { }
}

Utilities = {
  base64Encode: function () { }
}

