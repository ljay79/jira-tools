let jiraApiMock = require('test/mocks/mockJiraApi.js');
const ChangelogTable_ = require("src/models/jira/ChangelogTable.gs");
const ChangelogTableRendererDefault_ = require('src/models/renderer/ChangelogTableRendererDefault.gs').ChangelogTableRendererDefault_;
Spreadsheet = require('test/mocks/Spreadsheet.js');

beforeEach(() => {
  // IssueChangelog.clearCache_();
});

test("saving data from response", () => {
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
        "self": "https://jira.tarent.de/rest/api/2/issue/259027",
        "key": "TPORTAL-466",
        "fields": {
          "issuetype": {
            "self": "https://jira.tarent.de/rest/api/2/issuetype/10100",
            "id": "10100",
            "description": "Eine Aufgabe, die erledigt werden muss.",
            "iconUrl": "https://jira.tarent.de/secure/viewavatar?size=xsmall&avatarId=10500&avatarType=issuetype",
            "name": "Aufgabe",
            "subtask": false,
            "avatarId": 10500
          },
        },
        "changelog": {
          "startAt": 0,
          "maxResults": 6,
          "total": 6,
          "histories": [
            {
              "id": "1198967",
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=bjung",
                "name": "bjung",
                "key": "JIRAUSER56901",
                "emailAddress": "b.jung@tarent.de",
                "avatarUrls": {
                  "48x48": "https://www.gravatar.com/avatar/b8753768d92af2f122b99e37c882d1ac?d=mm&s=48",
                  "24x24": "https://www.gravatar.com/avatar/b8753768d92af2f122b99e37c882d1ac?d=mm&s=24",
                  "16x16": "https://www.gravatar.com/avatar/b8753768d92af2f122b99e37c882d1ac?d=mm&s=16",
                  "32x32": "https://www.gravatar.com/avatar/b8753768d92af2f122b99e37c882d1ac?d=mm&s=32"
                },
                "displayName": "Benjamin Patrick Jung",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=bjung",
                "name": "bjung",
                "key": "JIRAUSER56901",
                "emailAddress": "b.jung@tarent.de",
                "avatarUrls": {
                  "48x48": "https://www.gravatar.com/avatar/b8753768d92af2f122b99e37c882d1ac?d=mm&s=48",
                  "24x24": "https://www.gravatar.com/avatar/b8753768d92af2f122b99e37c882d1ac?d=mm&s=24",
                  "16x16": "https://www.gravatar.com/avatar/b8753768d92af2f122b99e37c882d1ac?d=mm&s=16",
                  "32x32": "https://www.gravatar.com/avatar/b8753768d92af2f122b99e37c882d1ac?d=mm&s=32"
                },
                "displayName": "Benjamin Patrick Jung",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=cromme",
                "name": "cromme",
                "key": "JIRAUSER56100",
                "emailAddress": "c.rommelfanger@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=JIRAUSER56100&avatarId=45400",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=JIRAUSER56100&avatarId=45400",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=JIRAUSER56100&avatarId=45400",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=JIRAUSER56100&avatarId=45400"
                },
                "displayName": "Christoph Rommelfanger",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-13T11:40:32.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": null,
                  "to": "JIRAUSER56100",
                  "toString": "Christoph Rommelfanger"
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=cromme",
                "name": "cromme",
                "key": "JIRAUSER56100",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=JIRAUSER56100&avatarId=45400",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=JIRAUSER56100&avatarId=45400",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=JIRAUSER56100&avatarId=45400",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=JIRAUSER56100&avatarId=45400"
                },
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=cromme",
                "key": "JIRAUSER56100",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=JIRAUSER56100&avatarId=45400",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=JIRAUSER56100&avatarId=45400",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=JIRAUSER56100&avatarId=45400",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=JIRAUSER56100&avatarId=45400"
                },
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-13T13:12:43.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": "JIRAUSER56100",
                  "fromString": "Christoph Rommelfanger",
                  "to": null,
                  "toString": null
                }
              ]
            },
            {
              "id": "1200398",
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-14T08:57:07.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": null,
                  "to": "mmeltz",
                  "toString": "Mario Meltzow"
                }
              ]
            }
          ]
        }
      },
      {
        "expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields",
        "id": "257381",
        "self": "https://jira.tarent.de/rest/api/2/issue/257381",
        "key": "TPORTAL-435",
        "fields" : {
          "issuetype": {
            "self": "https://jira.tarent.de/rest/api/2/issuetype/10001",
            "id": "10001",
            "description": "Created by Jira Agile - do not edit or delete. Issue type for a user story.",
            "iconUrl": "https://jira.tarent.de/secure/viewavatar?size=xsmall&avatarId=10315&avatarType=issuetype",
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-01T10:24:50.000+0200",
              "items": [
                {
                  "field": "description",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "Umschaltung zwischen Deutsch / Englisch ermöglichen",
                  "to": null,
                  "toString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n \r\n\r\nzu klären:\r\n * wollen wir das umsetzen?"
                }
              ]
            },
            {
              "id": "1194141",
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-01T11:38:15.000+0200",
              "items": [
                {
                  "field": "description",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n \r\n\r\nzu klären:\r\n * wollen wir das umsetzen?",
                  "to": null,
                  "toString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n out of scope:\r\n * right2left Layouts / Sprache\r\n\r\nzu klären:\r\n * wollen wir das umsetzen?\r\n * Datumsformat, Zahlenformatierung => Internationalisation\r\n * nicht nur Sprache übersetzung"
                }
              ]
            },
            {
              "id": "1194270",
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-01T11:39:40.000+0200",
              "items": [
                {
                  "field": "description",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n out of scope:\r\n * right2left Layouts / Sprache\r\n\r\nzu klären:\r\n * wollen wir das umsetzen?\r\n * Datumsformat, Zahlenformatierung => Internationalisation\r\n * nicht nur Sprache übersetzung",
                  "to": null,
                  "toString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n out of scope:\r\n * right2left Layouts / Sprache\r\n\r\nzu klären:\r\n * wollen wir das umsetzen?\r\n * Datumsformat, Zahlenformatierung => Internationalisation\r\n * nicht nur Sprache übersetzung\r\n * Sprache vom System auslesen"
                }
              ]
            },
            {
              "id": "1194271",
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-01T11:40:19.000+0200",
              "items": [
                {
                  "field": "description",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n out of scope:\r\n * right2left Layouts / Sprache\r\n\r\nzu klären:\r\n * wollen wir das umsetzen?\r\n * Datumsformat, Zahlenformatierung => Internationalisation\r\n * nicht nur Sprache übersetzung\r\n * Sprache vom System auslesen",
                  "to": null,
                  "toString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n out of scope:\r\n * right2left Layouts / Sprache\r\n\r\nsiehe [https://flutter.dev/docs/development/accessibility-and-localization/internationalization]\r\n\r\nzu klären:\r\n * wollen wir das umsetzen?\r\n * Datumsformat, Zahlenformatierung => Internationalisation\r\n * nicht nur Sprache übersetzung\r\n * Sprache vom System auslesen"
                }
              ]
            },
            {
              "id": "1197736",
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-08T11:18:34.000+0200",
              "items": [
                {
                  "field": "description",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n out of scope:\r\n * right2left Layouts / Sprache\r\n\r\nsiehe [https://flutter.dev/docs/development/accessibility-and-localization/internationalization]\r\n\r\nzu klären:\r\n * wollen wir das umsetzen?\r\n * Datumsformat, Zahlenformatierung => Internationalisation\r\n * nicht nur Sprache übersetzung\r\n * Sprache vom System auslesen",
                  "to": null,
                  "toString": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n out of scope:\r\n * right2left Layouts / Sprache\r\n\r\nsiehe [https://flutter.dev/docs/development/accessibility-and-localization/internationalization]\r\n\r\nzu klären:\r\n * wollen wir das umsetzen?\r\n * Datumsformat, Zahlenformatierung => Internationalisation\r\n * nicht nur Sprache übersetzung\r\n * Sprache vom System auslesen\r\n * Fehlermeldung in entsprechender Sprache darstellen"
                }
              ]
            },
            {
              "id": "1199871",
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=mmeltz",
                "name": "mmeltz",
                "key": "mmeltz",
                "emailAddress": "m.meltzow@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=mmeltz&avatarId=27600",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=mmeltz&avatarId=27600",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=mmeltz&avatarId=27600",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=mmeltz&avatarId=27600"
                },
                "displayName": "Mario Meltzow",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=gbruec",
                "name": "gbruec",
                "key": "suw",
                "emailAddress": "g.bruecher@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=suw&avatarId=17501",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=suw&avatarId=17501",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=suw&avatarId=17501",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=suw&avatarId=17501"
                },
                "displayName": "Gunnar Bruecher",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=gbruec",
                "name": "gbruec",
                "key": "suw",
                "emailAddress": "g.bruecher@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=suw&avatarId=17501",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=suw&avatarId=17501",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=suw&avatarId=17501",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=suw&avatarId=17501"
                },
                "displayName": "Gunnar Bruecher",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=gbruec",
                "name": "gbruec",
                "key": "suw",
                "emailAddress": "g.bruecher@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=suw&avatarId=17501",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=suw&avatarId=17501",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=suw&avatarId=17501",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=suw&avatarId=17501"
                },
                "displayName": "Gunnar Bruecher",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=gbruec",
                "name": "gbruec",
                "key": "suw",
                "emailAddress": "g.bruecher@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=suw&avatarId=17501",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=suw&avatarId=17501",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=suw&avatarId=17501",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=suw&avatarId=17501"
                },
                "displayName": "Gunnar Bruecher",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-14T09:04:51.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": null,
                  "fromString": null,
                  "to": "suw",
                  "toString": "Gunnar Bruecher"
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
              "author": {
                "self": "https://jira.tarent.de/rest/api/2/user?username=gbruec",
                "name": "gbruec",
                "key": "suw",
                "emailAddress": "g.bruecher@tarent.de",
                "avatarUrls": {
                  "48x48": "https://jira.tarent.de/secure/useravatar?ownerId=suw&avatarId=17501",
                  "24x24": "https://jira.tarent.de/secure/useravatar?size=small&ownerId=suw&avatarId=17501",
                  "16x16": "https://jira.tarent.de/secure/useravatar?size=xsmall&ownerId=suw&avatarId=17501",
                  "32x32": "https://jira.tarent.de/secure/useravatar?size=medium&ownerId=suw&avatarId=17501"
                },
                "displayName": "Gunnar Bruecher",
                "active": true,
                "timeZone": "Europe/Berlin"
              },
              "created": "2021-04-14T09:05:02.000+0200",
              "items": [
                {
                  "field": "assignee",
                  "fieldtype": "jira",
                  "from": "suw",
                  "fromString": "Gunnar Bruecher",
                  "to": "JIRAUSER56901",
                  "toString": "Benjamin Patrick Jung"
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
