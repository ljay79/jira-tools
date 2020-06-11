jiraApiMock = require('test/mocks/mockJiraApi.js');
const UserStorage = require("src/models/gas/UserStorage.gs");
const CustomFields = require("src/models/jira/CustomFields.gs");
global.EpicField = require("src/models/jira/EpicField.gs");
const CUSTOMFIELD_FORMAT_RAW = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_RAW;
const CUSTOMFIELD_FORMAT_SEARCH = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_SEARCH;
const CUSTOMFIELD_FORMAT_UNIFY = require("src/models/jira/IssueFields.gs").CUSTOMFIELD_FORMAT_UNIFY;
const IssueFields = require("src/models/jira/IssueFields.gs");

beforeEach(() => {
  IssueFields.clearCache_();
});

test("field validation", () => {
  var fieldList = [
    {
      key: "summary",
      name: "Summary",
      custom: false,
      schemaType: 'string',
      supported: true
    },
    {
      key: "custom1234",
      name: "My custom field",
      custom: true,
      schemaType: 'datetime',
      supported: true

    },
    {
      key: "custom5678",
      name: "My custom field 2",
      custom: true,
      schemaType: 'datetime',
      supported: true

    }
  ]
  IssueFields.setAllFields_(fieldList);

  var matchedField = IssueFields.getMatchingField("Summary");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("summary");

  var matchedField = IssueFields.getMatchingField("My custom field");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");

  var matchedField = IssueFields.getMatchingField("An unrecognised field");
  expect(matchedField).toBeNull();


  var matchedField = IssueFields.getMatchingField("custom1234");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");

  var matchedField = IssueFields.getMatchingField("my CUStom field");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");

  var matchedField = IssueFields.getMatchingField("my CUStom field ");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");

  var matchedField = IssueFields.getMatchingField(" my CUStom field ");
  expect(matchedField).not.toBeNull();
  expect(matchedField.key).toBe("custom1234");
});

test("Convert Jira Field Responses to internal field data", () => {
  var result = IssueFields.convertJiraResponse({
    schema: { type: "string" },
    key: "xyz",
    name: "XYZ field",
    custom: false
  });
  expect(result.key).toBe("xyz");
  expect(result.custom).toBe(false);
  expect(result.name).toBe("XYZ field");
  expect(result.supported).toBe(true);
  expect(result.schemaType).toBe("string");

  result = IssueFields.convertJiraResponse({
    schema: { type: "a custom field not recognised", custom: "customFieldType" },
    key: "abc",
    name: "ABC field",
    custom: true
  });
  expect(result.key).toBe("abc");
  expect(result.custom).toBe(true);
  expect(result.name).toBe("ABC field");
  expect(result.supported).toBe(false);
  expect(result.schemaType).toBe("a custom field not recognised");
  expect(result.customType).toBe("customFieldType");

  result = IssueFields.convertJiraResponse({
    schema: { type: "string" },
    id: "def",
    name: "DEF field",
    custom: true
  });
  expect(result.key).toBe("def");
  expect(result.custom).toBe(true);
  expect(result.name).toBe("DEF field");
  expect(result.supported).toBe(true);
  expect(result.schemaType).toBe("string");
});

test("Set all JIRA fields", () => {
  IssueFields.setAllFields_({ a: "b" });
  expect(IssueFields.getAllFields()).toEqual({ a: "b" });
});
describe("Fetching all fields from JIRA", () => {
test("Get all fields from Jira", () => {
  var fieldList = [
    {
      schema: { type: "string" },
      key: "xyz",
      name: "XYZ field",
      custom: false
    },
    {
      schema: { type: "a custom field not recognised" },
      key: "abc",
      name: "ABC field",
      custom: true
    },
    {
      schema: { type: "string" },
      id: "def",
      name: "DEF field",
      custom: true
    }
  ];
  jiraApiMock.resetMocks();
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);

  const successCallBack = jest.fn();
  const errorCallBack = jest.fn();
  var result = IssueFields.getAllFields(successCallBack, errorCallBack);
  expect(jiraApiMock.call.mock.calls.length).toBe(1);
  expect(successCallBack.mock.calls.length).toBe(1);
  expect(errorCallBack.mock.calls.length).toBe(0);
  var fieldListReturned = successCallBack.mock.calls[0][0];
  expect(fieldListReturned.length).toBe(3);
  expect(fieldListReturned[0].key).toBe("abc");
  expect(fieldListReturned[1].key).toBe("def");
  expect(fieldListReturned[2].key).toBe("xyz");
  expect(result).toBe(fieldListReturned);

  // now check the cache
  var result = IssueFields.getAllFields(successCallBack, errorCallBack);
  expect(successCallBack.mock.calls.length).toBe(2);
  expect(errorCallBack.mock.calls.length).toBe(0);
  // no additional calls to JIRA API
  expect(jiraApiMock.call.mock.calls.length).toBe(1);

  successCallBack.mockClear();
  errorCallBack.mockClear();
  IssueFields.clearCache_();
  jiraApiMock.withSuccessHandler.mockClear();
  jiraApiMock.withFailureHandler.mockImplementationOnce((callback) => {
    callback({ errorMessages: ["mocked error"] }, 404, false);
    return jiraApiMock
  });
  var result = IssueFields.getAllFields(successCallBack, errorCallBack);
  expect(successCallBack.mock.calls.length).toBe(0);
  expect(errorCallBack.mock.calls.length).toBe(1);
  expect(errorCallBack.mock.calls[0].length).toBe(3);
  expect(errorCallBack.mock.calls[0][0]).toContain("mocked error");
  expect(errorCallBack.mock.calls[0][1]).toBe(404);
  expect(errorCallBack.mock.calls[0][2]).toBe(false);
  expect(result.length).toBe(0);
});


test("Get all custom fields from Jira", () => {
  var fieldList = [
    {
      schema: { type: "string" },
      key: "xyz",
      name: "XYZ field",
      custom: false
    },
    {
      schema: { type: "a custom field not recognised" },
      key: "abc",
      name: "ABC field",
      custom: true
    },
    {
      schema: { type: "string" },
      id: "def",
      name: "DEF field",
      custom: true
    },
    {
      "id": "Epic_link_key",
      "name": "Epic Link",
      "custom": true,
      "schema": {
        "custom": ":gh-epic-link",
        "type": "string",
        "system": "description"
      }
    },
    {
      "id": "Epic_label_key",
      "name": "Epic Label",
      "custom": true,
      "schema": {
        "custom": ":gh-epic-label",
        "type": "string",
        "system": "description"
      }
    }
  ];
  //set up
  jiraApiMock.setNextJiraResponse(200, "field", fieldList);
  const successCallBack = jest.fn();
  const errorCallBack = jest.fn();

  // execute
  var result = IssueFields.getAllCustomFields(successCallBack, errorCallBack);
  // verify call backs
  expect(successCallBack.mock.calls.length).toBe(1);
  expect(errorCallBack.mock.calls.length).toBe(0);
  // verify results
  var fieldListReturned = successCallBack.mock.calls[0][0];
  expect(fieldListReturned.length).toBe(5);
  expect(fieldListReturned[0].key).toBe("jst_epic");
  expect(fieldListReturned[1].key).toBe("abc");
  expect(fieldListReturned[2].key).toBe("def");
  expect(result).toBe(fieldListReturned);

});

test("Error when fetching all custom fields from Jira", () => {

  // when nothing is returned
  jiraApiMock.setNextJiraResponse(500, "field", null);
  const successCallBack = jest.fn();
  const errorCallBack = jest.fn();
  
  // execute
  var result = IssueFields.getAllCustomFields(successCallBack, errorCallBack);
  // verify call backs
  expect(successCallBack.mock.calls.length).toBe(0);
  expect(errorCallBack.mock.calls.length).toBe(1);

  //when unexpected message is returned
  /* In response to error found in logs
     TypeError: Funktion map in Objekt [object Object] nicht gefunden
     at processFieldResponse_ (models/jira/IssueFields:363)
   */
  jiraApiMock.setNextJiraResponse(500, "field", "{msg:'some unexpected response'}");
  
  // execute
  var result = IssueFields.getAllCustomFields(successCallBack, errorCallBack);
  // verify call backs
  expect(successCallBack.mock.calls.length).toBe(0);
  expect(errorCallBack.mock.calls.length).toBe(2);
  
  });
});

test("headerNames", () => {
  CustomFields.save([
    { key: "custom1", name: "Custom 1", schemaType: "Type 1", customType: "1" },
    { key: "custom2", name: "Custom 2", schemaType: "Type 1", customType: "2" },
    { key: "custom_epiclink", name: "Epic Link", customType: "3" }
  ]);
  EpicField.setLinkKey("custom_epiclink");
  EpicField.setLabelKey("not used");
  expect(IssueFields.getHeaderName("hello world")).toBe("helloWorld");
  expect(IssueFields.getHeaderName("key")).toBe("Key");
  expect(IssueFields.getHeaderName("summary")).toBe("Summary");

  expect(IssueFields.getHeaderName("custom1")).toBe("Custom 1");
  expect(IssueFields.getHeaderName("custom2")).toBe("Custom 2");
  expect(IssueFields.getHeaderName("custom_epiclink")).toBe("Epic");
})

describe("Checking custom field behaviour", () => {

  // mock the API return for all fields with the additional data needed for customType
  const jiraApiFieldResponse = [
    {
      schema: {
        custom: "com.pyxis.greenhopper.jira:gh-sprint", type: "array", items: "string", customId: 11090
      }, navigable: true, orderable: true, custom: true, name: "Sprint", id: "custom_sprint", searchable: true
    }, {
      schema: {
        custom: "com.atlassian.jira.plugin.system.customfieldtypes:float", type: "number", customId: 15691
      }, navigable: true, orderable: true, custom: true, name: "Number", id: "custom_number", searchable: true
    }, {
      schema: {
        custom: "com.atlassian.jira.plugin.system.customfieldtypes:textfield", type: "string", customId: 10500
      }, navigable: true, orderable: true, custom: true, name: "Contact Info", id: "custom_string", searchable: true
    }, {
      schema: {
        type: "string", customId: 10501
      }, navigable: true, orderable: true, custom: true, name: "Contact Thing", id: "custom_string2", searchable: true
    }
  ];

  beforeEach( () => {
    PropertiesService.resetMocks();
    PropertiesService.resetMockUserData();
    UserStorage._resetLocalStorage();
    jiraApiMock.resetMocks();
  })

  // getting custom fields
  test.skip("getCustomFields", () => {
	  UserStorage.setValue(
      "favoriteCustomFields",
      [
        { key: "customx", name: "Custom X", schemaType: "Type 1", customType: "1" },
        { key: "customy", name: "Custom Y", schemaType: "Type 2", customType: "2" },
        { key: "customz", name: "Custom Z", type: "Type 3", customType: "3" }
      ]
    );
    var result = IssueFields.getAvailableCustomFields();
    expect(result.length).toBe(3);
    expect(result[0]).toEqual({ key: "customx", name: "Custom X", schemaType: "Type 1", customType: "1" });
    result = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_RAW);
    expect(result.length).toBe(3);
    expect(result).toEqual([
      { key: "customx", name: "Custom X", schemaType: "Type 1", customType: "1" },
      { key: "customy", name: "Custom Y", schemaType: "Type 2", customType: "2" },
      { key: "customz", name: "Custom Z", schemaType: "Type 3", customType: "3" }
    ]
    );
    result = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_SEARCH);
    expect(Object.keys(result).length).toBe(3);
    expect(result.customx).toBe("Custom X");
    expect(result.customy).toBe("Custom Y");
    expect(result.customz).toBe("Custom Z");

    result = IssueFields.getAvailableCustomFields(IssueFields.CUSTOMFIELD_FORMAT_UNIFY);
    expect(Object.keys(result).length).toBe(3);
    expect(result.customx).toBe("Type 1");
    expect(result.customy).toBe("Type 2");
    expect(result.customz).toBe("Type 3");
  });

  test.skip("Fixes up schema if customType was not present", () => {
    // addition of customType to field schema may mean saved custom fields do not contain the correct data
    
    // mock the older format in the users prefences
    PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
      return JSON.stringify([
        { key: "custom_sprint", name: "Sprint", schemaType: "array|string", supported: true },
        { key: "custom_string", name: "String", schemaType: "string", supported: true },
        { key: "custom_number", name: "Number", schemaType: "number", supported: true },
        { key: "custom_string2", name: "Number", schemaType: "number", supported: true },
      ]
      );
    });

    
    jiraApiMock.setNextJiraResponse(200, "field", jiraApiFieldResponse);

    var favouriteCustomFields = IssueFields.getAvailableCustomFields();
    expect(jiraApiMock.call).toBeCalledTimes(1);
    expect(PropertiesService.mockUserProps.getProperty).toBeCalledTimes(1);
    expect(favouriteCustomFields.length).toBe(4);
    expect(favouriteCustomFields[0].key).toBe("custom_sprint");
    expect(favouriteCustomFields[0].customType).toBe("gh-sprint");
    expect(favouriteCustomFields[0].schemaType).toBe("array|string");
    expect(favouriteCustomFields[1].key).toBe("custom_string");
    expect(favouriteCustomFields[1].customType).toBe("textfield");
    expect(favouriteCustomFields[1].schemaType).toBe("string");
    expect(favouriteCustomFields[2].key).toBe("custom_number");
    expect(favouriteCustomFields[2].customType).toBe("float");
    expect(favouriteCustomFields[2].schemaType).toBe("number");
    expect(favouriteCustomFields[3].key).toBe("custom_string2");
    expect(favouriteCustomFields[3].customType).toBe("none");// no custom field in the JIRA response - set it as none
    expect(favouriteCustomFields[3].schemaType).toBe("string");
    expect(PropertiesService.mockUserProps.setProperty).toBeCalledTimes(2);

    // now try again the schema should not need updating
    UserStorage._resetLocalStorage(); // reset in memory cache to force request to Properties Service
    var favouriteCustomFields2 = IssueFields.getAvailableCustomFields();
    expect(PropertiesService.mockUserProps.getProperty).toBeCalledTimes(2);
    // no need for call the jira API again to get all feeds as schema is up to date
    expect(jiraApiMock.call).toBeCalledTimes(1);
    // the favourites should now be saved
    expect(PropertiesService.mockUserProps.setProperty).toBeCalledTimes(2);
    // not testing epic behaviour here
    //expect(PropertiesService.mockUserProps.setProperty.mock.calls[0][0]).toBe("jst.jst_epic");
    expect(PropertiesService.mockUserProps.setProperty.mock.calls[1][0]).toBe("jst.favoriteCustomFields");
    // check that four items are stored
    expect(JSON.parse(PropertiesService.mockUserProps.setProperty.mock.calls[1][1]).length).toBe(4);
    // check the data still contains customType now
    expect(favouriteCustomFields.length).toBe(4);
    expect(favouriteCustomFields[0].customType).toBe("gh-sprint");
    expect(favouriteCustomFields[1].key).toBe("custom_string");
    expect(favouriteCustomFields[2].customType).toBe("float");
    expect(favouriteCustomFields[3].key).toBe("custom_string2");
  });

  test.skip("Fields no longer present in JIRA are cleaned up", ()=> {
    PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
      return JSON.stringify([
        // customType field is missing to trigger validation
        { key: "custom_sprint", name: "Sprint", schemaType: "array|string", supported: true },
        { key: "custom_string", name: "String", schemaType: "string", supported: true },
        { key: "custom_number", name: "Number", schemaType: "number", supported: true },
        // this field is not in the JIRA mocked field response so should be removed
        { key: "not_exists", name: "Number", schemaType: "number", supported: true },
      ]
      );
    });
    jiraApiMock.setNextJiraResponse(200, "field", jiraApiFieldResponse);

    var favouriteCustomFields = IssueFields.getAvailableCustomFields();;
    expect(favouriteCustomFields.length).toBe(3);
    expect(favouriteCustomFields[0].key).toBe("custom_sprint");
    expect(favouriteCustomFields[1].key).toBe("custom_string");
    expect(favouriteCustomFields[2].key).toBe("custom_number");

    expect(PropertiesService.mockUserProps.setProperty).toBeCalledTimes(2);
    // not testing epic behaviour here
    //expect(PropertiesService.mockUserProps.setProperty.mock.calls[0][0]).toBe("jst.jst_epic");
    expect(PropertiesService.mockUserProps.setProperty.mock.calls[1][0]).toBe("jst.favoriteCustomFields");
    // check that three items are stored  as field "not_exists" is no longer present
    expect(JSON.parse(PropertiesService.mockUserProps.setProperty.mock.calls[1][1]).length).toBe(3);
    
    // favourite not_exists is now longer present
  });
})



test("Creating Fields", () => {
  var epicField = IssueFields.createField_(
    EpicField.getKey(),
    EpicField.getName(),
    true,
    EpicField.EPIC_KEY,
    EpicField.EPIC_KEY + ":type",
    true
  );
  expect(epicField.supported).toBe(true);
  expect(epicField.name).toBe(EpicField.getName());
  expect(epicField.key).toBe(EpicField.getKey());
  expect(epicField.custom).toBe(true);
  expect(epicField.customType).toBe("type");
  expect(epicField.isVirtual).toBe(true);


  epicField = IssueFields.createField_(
    EpicField.getKey(),
    EpicField.getName(),
    true,
    EpicField.EPIC_KEY,
    null,
    true
  );
  expect(epicField.supported).toBe(true);
  expect(epicField.name).toBe(EpicField.getName());
  expect(epicField.key).toBe(EpicField.getKey());
  expect(epicField.custom).toBe(true);
  expect(epicField.customType).toBeNull();
  expect(epicField.isVirtual).toBe(true);

  epicField = IssueFields.createField_(
    EpicField.getKey(),
    EpicField.getName(),
    true,
    EpicField.EPIC_KEY,
    ":type",
    true
  );
  expect(epicField.supported).toBe(true);
  expect(epicField.name).toBe(EpicField.getName());
  expect(epicField.key).toBe(EpicField.getKey());
  expect(epicField.custom).toBe(true);
  expect(epicField.customType).toBe("type");
  expect(epicField.isVirtual).toBe(true);


  epicField = IssueFields.createField_(
    EpicField.getKey(),
    EpicField.getName(),
    true,
    EpicField.EPIC_KEY,
    "blah:",
    true
  );
  expect(epicField.supported).toBe(true);
  expect(epicField.name).toBe(EpicField.getName());
  expect(epicField.key).toBe(EpicField.getKey());
  expect(epicField.custom).toBe(true);
  expect(epicField.customType).toBe("");
  expect(epicField.isVirtual).toBe(true);
});

test.skip("Read Only fields", () => {
  // mock some fields in the users preferences
  PropertiesService.mockUserProps.getProperty.mockImplementationOnce(() => {
    return JSON.stringify([
      { key: "custom_sprint", name: "Sprint", schemaType: "array|string", customType: "gh-sprint" },
      { key: "custom_string", name: "String", schemaType: "string", supported: true, customType: "gh-none" }
    ]
    );
  });
  var readonly = IssueFields.getReadonlyFields();
  expect(readonly).toContain("project");
  expect(readonly).toContain("created");
  expect(readonly).toContain("updated");
  expect(readonly).toContain("custom_sprint");
  expect(readonly).not.toContain("summary");
  expect(readonly).not.toContain("description");
  expect(readonly).not.toContain("assignee");
  expect(readonly).not.toContain("priority");
});
