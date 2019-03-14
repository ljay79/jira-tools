

var _userPropData = {};

var UserProps = {
  getProperty: jest.fn(),
  setProperty: jest.fn(),
  deleteProperty: jest.fn()
}


var PropertiesService = {
  getUserProperties: jest.fn(),
  resetMocks: function () {
    var mocks = [
      [UserProps.getProperty, (key)=>  _userPropData[key]],
      [UserProps.setProperty, (key,data) => { _userPropData[key] = data; }],
      [UserProps.deleteProperty, (key) => {delete(_userPropData[key])}],
      [PropertiesService.getUserProperties,() => UserProps]
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
  },
  mockUserProps: UserProps
}
PropertiesService.resetMocks();
module.exports = PropertiesService;
