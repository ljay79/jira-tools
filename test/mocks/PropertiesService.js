
/*
 * @see https://developers.google.com/apps-script/reference/properties/properties
 */

var _userPropData = {};
var _scriptPropData = {};
var _documentPropData = {};

/*
 * @see https://developers.google.com/apps-script/reference/properties/properties-service#getuserproperties
 */
var UserProps = {
  getProperty: jest.fn().mockImplementation((key)=>  _userPropData[key]),
  setProperty: jest.fn().mockImplementation(function(key) { _userPropData[key] = data; }),
  getProperties: jest.fn().mockImplementation(() => _userPropData ),
  deleteProperty: jest.fn().mockImplementation(function(key) { 
    _userPropData[key] = null; 
    delete _userPropData[key];
  }),
  deleteAllProperties: jest.fn().mockImplementation(function() { _userPropData = {}; }),
};

/*
 * @see https://developers.google.com/apps-script/reference/properties/properties-service#getscriptproperties
 */
var ScriptProps = {
  getProperty: jest.fn().mockImplementation((key)=>  _scriptPropData[key]),
  setProperty: jest.fn().mockImplementation(function(key) { _scriptPropData[key] = data; }),
  deleteProperty: jest.fn().mockImplementation(function(key) { 
    _scriptPropData[key] = null; 
    delete _scriptPropData[key];
  }),
  deleteAllProperties: jest.fn().mockImplementation(function() { _scriptPropData = {}; }),
};

/*
 * @see https://developers.google.com/apps-script/reference/properties/properties-service#getdocumentproperties
 */
var DocumentProps = {
  getProperty: jest.fn().mockImplementation((key)=>  _documentPropData[key]),
  setProperty: jest.fn().mockImplementation(function(key) { _documentPropData[key] = data; }),
  deleteProperty: jest.fn().mockImplementation(function(key) { 
    _documentPropData[key] = null; 
    delete _documentPropData[key];
  }),
  deleteAllProperties: jest.fn().mockImplementation(function() { _documentPropData = {}; }),
};

/**
 * @see https://developers.google.com/apps-script/reference/properties/properties-service
 */
var PropertiesService = {
  getUserProperties: jest.fn(),
  getScriptProperties: jest.fn(),
  getDocumentProperties: jest.fn(),
  resetMocks: function () {
    var mocks = [
      [UserProps.getProperty, (key)=> _userPropData[key]],
      [UserProps.setProperty, (key,data) => { _userPropData[key] = data; }],
      [UserProps.deleteProperty, (key) => {delete(_userPropData[key])}],
      [UserProps.deleteAllProperties, null],
      [PropertiesService.getUserProperties,() => UserProps],
      
      [ScriptProps.getProperty, (key)=> _scriptPropData[key]],
      [ScriptProps.setProperty, (key,data) => { _scriptPropData[key] = data; }],
      [ScriptProps.deleteProperty, (key) => {delete(_scriptPropData[key])}],
      [ScriptProps.deleteAllProperties, null],
      [PropertiesService.getScriptProperties,() => ScriptProps],
      
      [DocumentProps.getProperty, (key)=> _documentPropData[key]],
      [DocumentProps.setProperty, (key,data) => { _documentPropData[key] = data; }],
      [DocumentProps.deleteProperty, (key) => {delete(_documentPropData[key])}],
      [DocumentProps.deleteAllProperties, null],
      [PropertiesService.getDocumentProperties,() => DocumentProps]
    ];
    mocks.forEach((pair) => {
      pair[0].mockReset();
      if (pair[1] != null) {
        pair[0].mockImplementation(pair[1]);
      }
    });
  },
  resetMockUserData: function() {
    _userPropData = {};
    _scriptPropData = {};
    _documentPropData = {};
  },
  mockUserProps: UserProps,
  mockScriptProps: ScriptProps,
  mockDocumentProps: DocumentProps
}

PropertiesService.resetMocks();

module.exports = PropertiesService;
