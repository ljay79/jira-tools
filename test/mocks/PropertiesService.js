
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
      [UserProps.getProperty, ""],
      [UserProps.setProperty, null],
      [UserProps.deleteProperty, null],
      [UserProps.deleteAllProperties, null],
      [PropertiesService.getUserProperties, UserProps],
      
      [ScriptProps.getProperty, ""],
      [ScriptProps.setProperty, null],
      [ScriptProps.deleteProperty, null],
      [ScriptProps.deleteAllProperties, null],
      [PropertiesService.getScriptProperties, ScriptProps],
      
      [DocumentProps.getProperty, ""],
      [DocumentProps.setProperty, null],
      [DocumentProps.deleteProperty, null],
      [DocumentProps.deleteAllProperties, null],
      [PropertiesService.getDocumentProperties, DocumentProps]
    ];
    mocks.forEach((pair) => {
      pair[0].mockReset();
      pair[0].mockImplementation(() => pair[1]);
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
