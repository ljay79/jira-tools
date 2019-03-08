
const UserStorage = require('src/models/gas/UserStorage.gs');

beforeEach(()=> {

  PropertiesService.resetMocks();
  // this is equivalent to google deleting data stored in the Properties service
  // this is where the data is stored centrally and persistently
  PropertiesService.resetMockUserData();
  // this clears where the data is stored locally to cache and prevent multiple calls to the Properties service
  UserStorage._resetLocalStorage();
})

test("It should save items in PropertiesService.", () => {
  UserStorage.setValue("test","value");
  expect(PropertiesService.mockUserProps.setProperty).toBeCalled();
  expect(PropertiesService.mockUserProps.setProperty.mock.calls[0][0]).toBe("jst.test");
  expect(PropertiesService.mockUserProps.setProperty.mock.calls[0][1]).toBe(JSON.stringify("value"));
  
  UserStorage.setValue("test2",{"key":"value"});
  expect(PropertiesService.mockUserProps.setProperty.mock.calls[1][0]).toBe("jst.test2");
  expect(PropertiesService.mockUserProps.setProperty.mock.calls[1][1]).toBe(JSON.stringify({"key":"value"}));
});

test("It should get values from PropertiesService", () => {
  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    return JSON.stringify("simple string value");
  });
  expect(UserStorage.getValue("test3")).toBe("simple string value");
  expect(PropertiesService.mockUserProps.getProperty.mock.calls[0][0]).toBe("jst.test3");


  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    return JSON.stringify({more:"complex",object:"to store"});
  });
  expect(UserStorage.getValue("test5")).toEqual({more:"complex",object:"to store"});
  expect(PropertiesService.mockUserProps.getProperty.mock.calls[1][0]).toBe("jst.test5");
});

test("The in memory cache of the Storage class should prevent multiple calls to PropertiesService", () => {
  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    console.log("PropertiesService.mockUserProps.getProperty v1 called");
    return JSON.stringify("first call result (cached)");
  });
  expect(UserStorage.getValue("test4")).toBe("first call result (cached)");
  expect(PropertiesService.mockUserProps.getProperty.mock.calls.length).toBe(1);
  expect(PropertiesService.mockUserProps.getProperty.mock.calls[0][0]).toBe("jst.test4");
  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    console.log("PropertiesService.mockUserProps.getProperty v2 called");
    return JSON.stringify("wont be used - data is cached");
  });
  expect(UserStorage.getValue("test4")).toBe("first call result (cached)");
  expect(PropertiesService.mockUserProps.getProperty.mock.calls.length).toBe(1);
});

test("It should delete a value",() => {
  UserStorage.setValue("test4","something");
  expect(UserStorage.getValue("test4")).toBe("something");
  UserStorage.removeValue("test4");
  expect(UserStorage.getValue("test4")).toBeNull();
  // check removed from underlying store
  expect(PropertiesService.mockUserProps.deleteProperty.mock.calls[0][0]).toBe("jst.test4");
})

test("Data should be retained in Properties service", ()=> {

  UserStorage.setValue("test4","something");
  expect(UserStorage.getValue("test4")).toBe("something");
  UserStorage._resetLocalStorage();
  expect(UserStorage.getValue("test4")).toBe("something");
});