/*jiraApiMock = require('./mocks/mockJiraApi.js');
debug = require("../src/debug.gs").debug;
PropertiesService = require('./mocks/PropertiesService');
global.environmentConfiguration = require('../src/environmentConfiguration.gs');
const UserStorage = require("../src/UserStorage.gs").UserStorage;

beforeEach(() =>  {
    debug.enable(true);
    jest.resetModules();
    jiraApiMock = require('./mocks/mockJiraApi.js');
    jiraApiMock.resetMocks();
});

test("Custom fields should be returned", () => {
  jiraApiMock.setNextJiraResponse(200,"field",mockFieldJiraApiResponse);
  var fetchCustomFields = require('../src/customFields.gs').fetchCustomFields;
  var customFields = fetchCustomFields();
  // fields returned should only have custom fields from the mock data
  expect(customFields.length).toBe(3);
  // sorted correctly?
  expect(customFields[0].name).toBe("Custom 0");
  expect(customFields[1].name).toBe("Custom 1");
  expect(customFields[2].name).toBe("AA Not Supported");
  // correct fields should be set
  expect(customFields[0].key).toBe("custom000");
  expect(customFields[0].supported).toBe(true);
  expect(customFields[0].type).toBe("string");
  expect(customFields[1].key).toBe("custom001");
  expect(customFields[1].supported).toBe(true);
  expect(customFields[1].type).toBe("number");
  expect(customFields[2].key).toBe("custom0ZZ");
  expect(customFields[2].supported).toBe(false);
  expect(customFields[2].type).toBe("notsupported");
  // epic should be set
  var epicField = UserStorage.getValue('jst_epic');
  expect(epicField.key).toBe("jst_epic");
  expect(epicField.name).toBe('Epic');
  expect(epicField.usable).toBe(true);
  expect(epicField.link_key).toBe('Epic_link_key');
  expect(epicField.label_key).toBe('Epic_label_key');

  

});*/


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
  }
];