environmentConfiguration = require('src/environmentConfiguration.gs');
environmentConfiguration.debugEnabled = false;

// define GAS globals
ScriptApp = require('test/mocks/ScriptApp');
PropertiesService = require('test/mocks/PropertiesService');
CacheService = require('test/mocks/CacheService');
SpreadsheetApp = require('test/mocks/SpreadsheetApp');
HtmlService = require('test/mocks/HtmlService');
Session = require('test/mocks/Session');
SpreadsheetApp = require('test/mocks/SpreadsheetApp');
Browser = require('test/mocks/Browser');

debug = require('src/debug.gs').debug;

UrlFetchApp = {
  fetch: function () { }
}

Utilities = {
  base64Encode: function () { }
}

