global.PropertiesService = require('../../mocks/PropertiesService');
global.UserStorage = require('../../../src/UserStorage.gs').UserStorage;
var EpicField = require("../../../src/models/jira/EpicField.gs");

beforeEach(() => {
  PropertiesService.resetMocks();
  EpicField.reset();
  jest.resetModules();
});

test("Initialises the object from the Properties Service and saves to Properties Service",()=> {
  // ensure propoerties returns an empty response 
  UserStorage.getValue = jest.fn().mockImplementationOnce(() => {null});
  UserStorage.setValue = jest.fn().mockImplementationOnce(() => {null});
  // should return default values
  var epicFieldJson = EpicField.getJson();
  expect(epicFieldJson.usable).toBe(false);
  expect(epicFieldJson.key).toBe("jst_epic");
  expect(epicFieldJson.link_key).toBeNull();
  expect(epicFieldJson.label_key).toBeNull();
  expect(UserStorage.getValue.mock.calls[0][0]).toBe("jst_epic");
  UserStorage.getValue.mockReset();


  // setting values should be stored in user props
  epicFieldJson.label_key = "abce";
  epicFieldJson.link_key = "defgh";
  EpicField.setJson(epicFieldJson);
  expect(UserStorage.setValue).toBeCalled();
  expect(UserStorage.setValue.mock.calls[0][0]).toBe("jst_epic");
  epicFieldJson = EpicField.getJson();
  expect(UserStorage.getValue).not.toBeCalled();
  expect(epicFieldJson.usable).toBe(true);
  expect(epicFieldJson.key).toBe("jst_epic");
  expect(epicFieldJson.name).toBe("Epic");
  expect(epicFieldJson.label_key).toBe("abce");
  expect(epicFieldJson.link_key).toBe("defgh");
});

test("Retrieves the object from the Properties Service",()=> {
  
  UserStorage.getValue = jest.fn().mockImplementationOnce(() => {
    return {
      usable: true,  // true|false
      key: 'jst_epic',
      name: 'Epic',
      link_key: "xyz", // customfield_10003
      label_key: "pqr"  // customfield_10005
    };
  });
  var epicFieldJson = EpicField.getJson();
  expect(UserStorage.getValue).toBeCalled();
  expect(UserStorage.getValue.mock.calls[0][0]).toBe("jst_epic");
  expect(epicFieldJson.usable).toBe(true);
  expect(epicFieldJson.key).toBe("jst_epic");
  expect(epicFieldJson.name).toBe("Epic");
  expect(epicFieldJson.link_key).toBe("xyz");
  expect(epicFieldJson.label_key).toBe("pqr");

});

test("Check for sideeffects on the JSON object returned",()=> {

  var epicFieldJson = EpicField.getJson();
  epicFieldJson.name = "New name";

  var epicFieldJson2 = EpicField.getJson();
  expect(epicFieldJson2).not.toBe("New name");

  EpicField.setJson(epicFieldJson);

  epicFieldJson.name = "Newer name";

  var epicFieldJson3 = EpicField.getJson();
  expect(epicFieldJson3.name).toBe("New name");

});

test("setting the label and link and usable property", () => {
  expect(EpicField.getLabelKey()).toBeNull()
  expect(EpicField.getLinkKey()).toBeNull();
  expect(EpicField.isUsable()).toBe(false);
  EpicField.setLabelKey("abc");
  expect(EpicField.getLabelKey()).toBe("abc");
  expect(EpicField.getLinkKey()).toBeNull();
  expect(EpicField.isUsable()).toBe(false);
  EpicField.setLinkKey("def");
  expect(EpicField.isUsable()).toBe(true);
  expect(EpicField.getLabelKey()).toBe("abc");
  expect(EpicField.getLinkKey()).toBe("def");

  var epicFieldJson = EpicField.getJson();
  expect(epicFieldJson.usable).toBe(true);
  expect(epicFieldJson.key).toBe("jst_epic");
  expect(epicFieldJson.name).toBe("Epic");
  expect(epicFieldJson.link_key).toBe("def");
  expect(epicFieldJson.label_key).toBe("abc");

  
  expect(EpicField.getKey()).toBe("jst_epic");
  expect(EpicField.getName()).toBe("Epic");


});