

var _userPropData = {};

var UserProps = {
  getProperty: jest.fn().mockImplementation((key)=>  _userPropData[key]),
  setProperty: jest.fn().mockImplementation(function(key) { _userPropData[key] = data; }),
  deleteProperty: jest.fn()
}


var PropertiesService = {
  getUserProperties: jest.fn(),
  resetMocks: function () {
    var mocks = [
      [UserProps.getProperty, ""],
      [UserProps.setProperty, null],
      [UserProps.deleteProperty, null],
      [PropertiesService.getUserProperties,UserProps]
    ];
    mocks.forEach((pair) => {
      pair[0].mockReset();
      pair[0].mockImplementation(() => pair[1]);
    });
  },
  resetMockUserData: function() {
    _userPropData = {};
  },
  mockUserProps: UserProps
}
PropertiesService.resetMocks();
module.exports = PropertiesService;
