
var UserProps = {
  getProperty: jest.fn()
}


var PropertiesService = {
  getUserProperties: jest.fn(),
  resetMocks: function () {
    var mocks = [
      [UserProps.getProperty, ""],
      [PropertiesService.getUserProperties,UserProps]
    ];
    mocks.forEach((pair) => {
      pair[0].mockReset();
      pair[0].mockImplementation(() => pair[1]);
    });
  },
  mockUserProps: UserProps
}
PropertiesService.resetMocks();
module.exports = PropertiesService;