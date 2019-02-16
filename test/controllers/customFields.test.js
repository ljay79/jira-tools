jiraApiMock = require('test/mocks/mockJiraApi.js');
debug = require("src/debug.gs").debug;
PropertiesService = require('test/mocks/PropertiesService');
global.environmentConfiguration = require('src/environmentConfiguration.gs');
const UserStorage = require("src/UserStorage.gs").UserStorage;
global.EpicField = require("src/models/jira/EpicField.gs");

beforeEach(() =>  {
    debug.enable(true);
    jest.resetModules();
    jiraApiMock = require('test/mocks/mockJiraApi.js');
    jiraApiMock.resetMocks();
});

test("Custom fields should be returned", () => {
  jiraApiMock.setNextJiraResponse(200,"field",mockFieldJiraApiResponse);
  var callbackFetchCustomFields = require('src/controllers/customFields.gs').callbackFetchCustomFields;
  var customFields = callbackFetchCustomFields();
  // fields returned should only have custom fields from the mock data
  expect(customFields.length).toBe(6);
  // sorted correctly?
  expect(customFields[0].name).toBe("Epic");
  expect(customFields[1].name).toBe("Custom 0");
  expect(customFields[2].name).toBe("Custom 1");
  expect(customFields[3].name).toBe("Epic Label");
  expect(customFields[4].name).toBe("Epic Link");
  expect(customFields[5].name).toBe("AA Not Supported");
  // correct fields should be set
  expect(customFields[0].key).toBe("jst_epic");
  expect(customFields[1].key).toBe("custom000");
  expect(customFields[1].supported).toBe(true);
  expect(customFields[1].schemaType).toBe("string");
  expect(customFields[2].key).toBe("custom001");
  expect(customFields[2].supported).toBe(true);
  expect(customFields[2].schemaType).toBe("number");
  expect(customFields[5].key).toBe("custom0ZZ");
  expect(customFields[5].supported).toBe(false);
  expect(customFields[5].schemaType).toBe("notsupported");
  // epic should be set
  var epicField = EpicField.getJson();
  expect(epicField.key).toBe("jst_epic");
  expect(epicField.name).toBe('Epic');
  expect(epicField.link_key).toBe('Epic_link_key');
  expect(epicField.label_key).toBe('Epic_label_key');
  expect(epicField.usable).toBe(true);

  

});


var mockFieldJiraApiResponse = [
  {
    "id": "custom0ZZ",
    "name": "AA Not Supported",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "type": "notsupported",
      "system": "description"
    }
  },
  {
    "id": "custom001",
    "name": "Custom 1",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "type": "number",
      "system": "description"
    }
  },
  {
    "id": "description",
    "name": "Description",
    "custom": false,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "type": "string",
      "system": "description"
    }
  },
  {
    "id": "summary",
    "key": "summary",
    "name": "Summary",
    "custom": false,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "summary"
    ],
    "schema": {
      "type": "string",
      "system": "summary"
    }
  },
  {
    "id": "custom000",
    "name": "Custom 0",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "type": "string",
      "system": "description"
    }
  },
  {
    "id": "Epic_link_key",
    "name": "Epic Link",
    "custom": true,
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
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
    "orderable": true,
    "navigable": true,
    "searchable": true,
    "clauseNames": [
      "description"
    ],
    "schema": {
      "custom": ":gh-epic-label",
      "type": "string",
      "system": "description"
    }
  }
];