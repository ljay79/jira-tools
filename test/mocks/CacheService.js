
/*
 * @see https://developers.google.com/apps-script/reference/cache/cache-service
 */

var _userCache = {};
var _scriptCache = {};
var _documentCache = {};

var UserCache = {
  get: jest.fn().mockImplementation((key)=>  _userCache[key]),
  put: jest.fn().mockImplementation(function(key) { _userCache[key] = data; }),
  remove: jest.fn().mockImplementation(function(key) { 
    _userCache[key] = null; 
    delete _userCache[key];
  }),
  removeAll: jest.fn().mockImplementation(function() { _userCache = {}; }),
};

var ScriptCache = {
  get: jest.fn().mockImplementation((key)=>  _scriptCache[key]),
  put: jest.fn().mockImplementation(function(key) { _scriptCache[key] = data; }),
  remove: jest.fn().mockImplementation(function(key) { 
    _scriptCache[key] = null; 
    delete _scriptCache[key];
  }),
  removeAll: jest.fn().mockImplementation(function() { _scriptCache = {}; }),
};

var DocumentCache = {
  get: jest.fn().mockImplementation((key)=> _documentCache[key]),
  put: jest.fn().mockImplementation(function(key) { _documentCache[key] = data; }),
  remove: jest.fn().mockImplementation(function(key) { 
    _documentCache[key] = null; 
    delete _documentCache[key];
  }),
  removeAll: jest.fn().mockImplementation(function() { _documentCache = {}; }),
};

var CacheService = {
  getUserCache: jest.fn(),
  getScriptCache: jest.fn(),
  getDocumentCache: jest.fn(),
  resetMocks: function () {
    var mocks = [
      [UserCache.get, (key)=> _userCache[key]],
      [UserCache.put, (key,data) => { _userCache[key] = data; }],
      [UserCache.remove, (key) => {delete(_userCache[key])}],
      [UserCache.removeAll, null],
      [CacheService.getUserCache,() => UserCache],

      [ScriptCache.get, (key)=> _scriptCache[key]],
      [ScriptCache.put, (key,data) => { _scriptCache[key] = data; }],
      [ScriptCache.remove, (key) => {delete(_scriptCache[key])}],
      [ScriptCache.removeAll, null],
      [CacheService.getScriptCache,() => ScriptCache],

      [DocumentCache.get, (key)=> _documentCache[key]],
      [DocumentCache.put, (key,data) => { _documentCache[key] = data; }],
      [DocumentCache.remove, (key) => {delete(_documentCache[key])}],
      [DocumentCache.removeAll, null],
      [CacheService.getDocumentCache,() => DocumentCache]
    ];
    mocks.forEach((pair) => {
      pair[0].mockReset();
      if (pair[1] != null) {
        pair[0].mockImplementation(pair[1]);
      }
    });
  },
  resetMockUserData: function() {
    _userCache = {};
    _scriptCache = {};
    _documentCache = {};
  },
  mockUserCache: UserCache,
  mockScriptCache: ScriptCache,
  mockDocumentCache: DocumentCache
}

CacheService.resetMocks();

module.exports = CacheService;
