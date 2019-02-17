
global.PropertiesService = require('test/mocks/PropertiesService');
const UserStorage = require('src/models/gas/UserStorage.gs');

test("It should save items in PropertiesService.", () => {
  UserStorage.setValue("test","value");
  expect(PropertiesService.mockUserProps.setProperty).toBeCalled();
  expect(PropertiesService.mockUserProps.setProperty.mock.calls[0][0]).toBe("jst.test");
  expect(PropertiesService.mockUserProps.setProperty.mock.calls[0][1]).toBe(JSON.stringify("value"));
  
  UserStorage.setValue("test2",{"key":"value"});
  expect(PropertiesService.mockUserProps.setProperty.mock.calls[1][0]).toBe("jst.test2");
  expect(PropertiesService.mockUserProps.setProperty.mock.calls[1][1]).toBe(JSON.stringify({"key":"value"}));
});

test("It should get a value from PropertiesService", () => {
  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    return JSON.stringify("simple string value");
  });
  expect(UserStorage.getValue("test3")).toBe("simple string value");
  expect(PropertiesService.mockUserProps.getProperty.mock.calls[0][0]).toBe("jst.test3");
});

test("It should delete a value",() => {
  UserStorage.removeValue("test4");
  expect(PropertiesService.mockUserProps.deleteProperty.mock.calls[0][0]).toBe("jst.test4");
})