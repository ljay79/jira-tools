let jiraApiMock = require('test/mocks/mockJiraApi.js');
const ChangelogTable_ = require("src/models/jira/ChangelogTable.gs");
const ChangelogTableRendererDefault_ = require('src/models/renderer/ChangelogTableRendererDefault.gs').ChangelogTableRendererDefault_;
Spreadsheet = require('test/mocks/Spreadsheet.js');

beforeEach(() => {
  // IssueChangelog.clearCache_();
});

test("saving data from response", () => {
  var attributes = {
    filter : { id: 1000, jql: 'foobar'},
    maxResults : 10000,
    columns : ['key','issuetype','summary','created','field','fromString','toString'],
    issues : {},
    sheet : Spreadsheet.getActiveSheet(),
    renderer : ChangelogTableRendererDefault_
  };

  var table = new ChangelogTable_(attributes);

  var issuesJson = [
      {
        "expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields",
        "id": "259027",
        "key": "TPORTAL-466",
        "fields": {
          "issuetype": {
            "id": "10100",
            "description": "Eine Aufgabe, die erledigt werden muss.",
            "name": "Aufgabe",
            "subtask": false,
          },
        },
        "changelog": {
          "startAt": 0,
          "maxResults": 6,
          "total": 6,
          "histories": [
            {
              "id": "1198967",
              "created": "2021-04-12T09:55:08.000+0200",
              "items": [
                {
                  "field": "status",
                  "fieldtype": "jira",
                  "from": "17100",
                  "fromString": "Backlog",
                  "to": "3",
                  "toString": "In Progress"
                }
              ]
            },
            {
              "id": "1199868",
              "created": "2021-04-13T10:48:44.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": "JIRAUSER56901",
                  "fromString": "JIRAUSER56903",
                  "to": null,
                  "toString": null
                },
                {
                  "field": "status",
                  "fieldtype": "jira",
                  "from": "3",
                  "fromString": "In Progress",
                  "to": "21800",
                  "toString": "Ready for QA"
                }
              ]
            },
            {
              "id": "1199938",
              "created": "2021-04-13T11:40:32.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": null,
                  "to": "JIRAUSER56100",
                  "toString": "JIRAUSER56101"
                },
                {
                  "field": "status",
                  "fieldtype": "jira",
                  "from": "21800",
                  "fromString": "Ready for QA",
                  "to": "12200",
                  "toString": "In Review"
                }
              ]
            },
            {
              "id": "1200005",
              "created": "2021-04-13T13:12:34.000+0200",
              "items": [
                {
                  "field": "status",
                  "fieldtype": "jira",
                  "from": "12200",
                  "fromString": "In Review",
                  "to": "14200",
                  "toString": "PO Review"
                }
              ]
            },
            {
              "id": "1200006",
              "created": "2021-04-13T13:12:43.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": "JIRAUSER56100",
                  "fromString": "JIRAUSER56100",
                  "to": null,
                  "toString": null
                }
              ]
            },
            {
              "id": "1200398",
              "created": "2021-04-14T08:57:07.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": null,
                  "to": "foobar",
                  "toString": "foobar"
                }
              ]
            }
          ]
        }
      },
      {
        "expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields",
        "id": "257381",
        "key": "TPORTAL-435",
        "fields" : {
          "issuetype": {
            "id": "10001",
            "description": "Created by Jira Agile - do not edit or delete. Issue type for a user story.",
            "name": "Story",
            "subtask": false,
            "avatarId": 10315
          },
        },
        "changelog": {
          "startAt": 0,
          "maxResults": 15,
          "total": 15,
          "histories": [
            {
              "id": "1191061",
              "created": "2021-03-30T11:01:35.000+0200",
              "items": [
                {
                  "field": "Rang",
                  "fieldtype": "custom",
                  "from": "",
                  "fromString": "",
                  "to": "",
                  "toString": "Ranked higher"
                }
              ]
            },
            {
              "id": "1191159",
              "created": "2021-03-30T11:45:34.000+0200",
              "items": [
                {
                  "field": "Rang",
                  "fieldtype": "custom",
                  "from": "",
                  "fromString": "",
                  "to": "",
                  "toString": "Ranked lower"
                }
              ]
            },
            {
              "id": "1194137",
              "created": "2021-04-01T10:24:26.000+0200",
              "items": [
                {
                  "field": "Rang",
                  "fieldtype": "custom",
                  "from": "",
                  "fromString": "",
                  "to": "",
                  "toString": "Ranked higher"
                }
              ]
            },
            {
              "id": "1194140",
              "created": "2021-04-01T10:24:50.000+0200",
              "items": [
                {
                  "field": "description",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "Umschaltung zwischen Deutsch / Englisch ermöglichen",
                  "to": null,
                  "toString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n "
                }
              ]
            },
            {
              "id": "1194141",
              "created": "2021-04-01T10:24:57.000+0200",
              "items": [
                {
                  "field": "labels",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "",
                  "to": null,
                  "toString": "toBeRefined"
                }
              ]
            },
            {
              "id": "1194266",
              "created": "2021-04-01T11:38:15.000+0200",
              "items": [
                {
                  "field": "description",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n ",
                  "to": null,
                  "toString": "Umschaltung zwischen Deutsch / Englisch ermöglichen"
                }
              ]
            },
            {
              "id": "1194270",
              "created": "2021-04-01T11:39:40.000+0200",
              "items": [
                {
                  "field": "description",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "Umschaltung zwischen Deutsch / Englisch ermöglichen",
                  "to": null,
                  "toString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n "
                }
              ]
            },
            {
              "id": "1199871",
              "created": "2021-04-13T10:50:03.000+0200",
              "items": [
                {
                  "field": "Rang",
                  "fieldtype": "custom",
                  "from": "",
                  "fromString": "",
                  "to": "",
                  "toString": "Ranked higher"
                }
              ]
            },
            {
              "id": "1200419",
              "created": "2021-04-14T09:04:19.000+0200",
              "items": [
                {
                  "field": "status",
                  "fieldtype": "jira",
                  "from": "17100",
                  "fromString": "Backlog",
                  "to": "10000",
                  "toString": "To Do"
                }
              ]
            },
            {
              "id": "1200420",
              "created": "2021-04-14T09:04:19.000+0200",
              "items": [
                {
                  "field": "Rang",
                  "fieldtype": "custom",
                  "from": "",
                  "fromString": "",
                  "to": "",
                  "toString": "Ranked higher"
                }
              ]
            },
            {
              "id": "1200421",
              "created": "2021-04-14T09:04:22.000+0200",
              "items": [
                {
                  "field": "Rang",
                  "fieldtype": "custom",
                  "from": "",
                  "fromString": "",
                  "to": "",
                  "toString": "Ranked higher"
                }
              ]
            },
            {
              "id": "1200424",
              "created": "2021-04-14T09:04:51.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": null,
                  "to": "suw",
                  "toString": "Foo Bar"
                },
                {
                  "field": "status",
                  "fieldtype": "jira",
                  "from": "10000",
                  "fromString": "To Do",
                  "to": "3",
                  "toString": "In Progress"
                }
              ]
            },
            {
              "id": "1200425",
              "created": "2021-04-14T09:05:02.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": "suw",
                  "fromString": "Foo Bar",
                  "to": "JIRAUSER56901",
                  "toString": "Foo Bar2"
                }
              ]
            }
          ]
        }
      }
    ]

  table.setData(issuesJson);

  var data = table.getData();
  expect(data).not.toBeNull();
  expect(data.length).toBe(6);

});
