let jiraApiMock = require('test/mocks/mockJiraApi.js');
const ChangelogTable_ = require("src/models/jira/ChangelogTable.gs");

beforeEach(() => {
  // IssueChangelog.clearCache_();
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
  var attributes = {
    filter : { id: 1000, jql: 'foobar'},
    maxResults : 10000,
    columns : ['key','issuetype','summary','created','field','fromString','toString'],
    issues : {},
    // sheet : getTicketSheet(),
    // renderer : ChangelogTableRendererDefault_
  };

  var table = new ChangelogTable_(attributes);

  var issuesJson = {
    "expand": "schema,names",
    "startAt": 0,
    "maxResults": 50,
    "total": 3,
    "issues": [
      {
        "expand": "operations,versionedRepresentations,editmeta,changelog,renderedFields",
        "id": "259027",
        "self": "https://jira.tarent.de/rest/api/2/issue/259027",
        "key": "TPORTAL-466",
        "fields": {
          "customfield_19200": null,
          "customfield_18111": null,
          "customfield_21400": null,
          "customfield_23700": null,
          "customfield_18112": null,
          "customfield_23701": null,
          "customfield_18113": null,
          "customfield_18114": null,
          "customfield_18110": null,
          "customfield_15400": null,
          "customfield_17700": null,
          "customfield_18115": null,
          "resolution": null,
          "customfield_24000": null,
          "customfield_20301": null,
          "customfield_22601": null,
          "customfield_22600": null,
          "customfield_18100": null,
          "customfield_20300": null,
          "lastViewed": "2021-04-14T09:44:14.383+0200",
          "customfield_18103": null,
          "customfield_24806": null,
          "customfield_18108": null,
          "customfield_24808": null,
          "customfield_18109": null,
          "customfield_24809": null,
          "customfield_18104": null,
          "customfield_18105": null,
          "customfield_18106": null,
          "labels": [],
          "customfield_18107": null,
          "aggregatetimeoriginalestimate": null,
          "customfield_25100": null,
          "customfield_21506": null,
          "customfield_25101": null,
          "issuelinks": [],
          "customfield_21505": null,
          "customfield_21504": {
            "self": "https://jira.tarent.de/rest/api/2/customFieldOption/14505",
            "value": "nein",
            "id": "14505",
            "disabled": false
          },
          "assignee": {
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
          "customfield_21503": null,
          "customfield_21502": null,
          "customfield_21501": null,
          "customfield_21500": null,
          "customfield_23600": null,
          "customfield_23006": null,
          "customfield_19300": "{summaryBean=com.atlassian.jira.plugin.devstatus.rest.SummaryBean@c76f91c[summary={pullrequest=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@33bc45b0[overall=PullRequestOverallBean{stateCount=0, state='OPEN', details=PullRequestOverallDetails{openCount=0, mergedCount=0, declinedCount=0}},byInstanceType={}], build=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@5c8191b5[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BuildOverallBean@d41de50[failedBuildCount=0,successfulBuildCount=0,unknownBuildCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], review=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@7c2a8932[overall=com.atlassian.jira.plugin.devstatus.summary.beans.ReviewsOverallBean@3aba6a4d[stateCount=0,state=<null>,dueDate=<null>,overDue=false,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], deployment-environment=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@6a665896[overall=com.atlassian.jira.plugin.devstatus.summary.beans.DeploymentOverallBean@6956a8d4[topEnvironments=[],showProjects=false,successfulCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], repository=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@419ddfd5[overall=com.atlassian.jira.plugin.devstatus.summary.beans.CommitOverallBean@289c2da9[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], branch=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@70e662c4[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BranchOverallBean@2c2a6404[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}]},errors=[],configErrors=[]], devSummaryJson={\"cachedValue\":{\"errors\":[],\"configErrors\":[],\"summary\":{\"pullrequest\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"stateCount\":0,\"state\":\"OPEN\",\"details\":{\"openCount\":0,\"mergedCount\":0,\"declinedCount\":0,\"total\":0},\"open\":true},\"byInstanceType\":{}},\"build\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"failedBuildCount\":0,\"successfulBuildCount\":0,\"unknownBuildCount\":0},\"byInstanceType\":{}},\"review\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"stateCount\":0,\"state\":null,\"dueDate\":null,\"overDue\":false,\"completed\":false},\"byInstanceType\":{}},\"deployment-environment\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"topEnvironments\":[],\"showProjects\":false,\"successfulCount\":0},\"byInstanceType\":{}},\"repository\":{\"overall\":{\"count\":0,\"lastUpdated\":null},\"byInstanceType\":{}},\"branch\":{\"overall\":{\"count\":0,\"lastUpdated\":null},\"byInstanceType\":{}}}},\"isStale\":false}}",
          "components": [],
          "customfield_23003": null,
          "customfield_23001": null,
          "customfield_17001": null,
          "customfield_23000": null,
          "customfield_15500": null,
          "customfield_17803": null,
          "customfield_15503": null,
          "customfield_15501": [],
          "customfield_17801": null,
          "customfield_17800": null,
          "customfield_15502": null,
          "customfield_10600": null,
          "customfield_10601": null,
          "customfield_20406": null,
          "customfield_26201": null,
          "customfield_28501": null,
          "customfield_26200": null,
          "customfield_26203": "noch nicht Versand",
          "customfield_20405": null,
          "customfield_26202": null,
          "customfield_28500": null,
          "customfield_22702": null,
          "customfield_26205": null,
          "customfield_20403": null,
          "customfield_22701": null,
          "customfield_26204": null,
          "customfield_20400": null,
          "customfield_22700": null,
          "customfield_20401": null,
          "customfield_26206": null,
          "customfield_24701": null,
          "customfield_18200": null,
          "subtasks": [],
          "reporter": {
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
          "customfield_16701": null,
          "customfield_16700": null,
          "customfield_25000": null,
          "progress": {
            "progress": 0,
            "total": 0
          },
          "votes": {
            "self": "https://jira.tarent.de/rest/api/2/issue/TPORTAL-466/votes",
            "votes": 0,
            "hasVoted": false
          },
          "customfield_23107": null,
          "customfield_23500": null,
          "customfield_23501": "Datum:\r\nKosten:",
          "customfield_25800": null,
          "customfield_25801": null,
          "issuetype": {
            "self": "https://jira.tarent.de/rest/api/2/issuetype/10100",
            "id": "10100",
            "description": "Eine Aufgabe, die erledigt werden muss.",
            "iconUrl": "https://jira.tarent.de/secure/viewavatar?size=xsmall&avatarId=10500&avatarType=issuetype",
            "name": "Aufgabe",
            "subtask": false,
            "avatarId": 10500
          },
          "customfield_19400": null,
          "customfield_23103": null,
          "customfield_19401": null,
          "customfield_17102": null,
          "customfield_23100": null,
          "customfield_17100": null,
          "customfield_17106": null,
          "project": {
            "self": "https://jira.tarent.de/rest/api/2/project/31500",
            "id": "31500",
            "key": "TPORTAL",
            "name": "t-Portal",
            "projectTypeKey": "software",
            "avatarUrls": {
              "48x48": "https://jira.tarent.de/secure/projectavatar?pid=31500&avatarId=45800",
              "24x24": "https://jira.tarent.de/secure/projectavatar?size=small&pid=31500&avatarId=45800",
              "16x16": "https://jira.tarent.de/secure/projectavatar?size=xsmall&pid=31500&avatarId=45800",
              "32x32": "https://jira.tarent.de/secure/projectavatar?size=medium&pid=31500&avatarId=45800"
            },
            "projectCategory": {
              "self": "https://jira.tarent.de/rest/api/2/projectCategory/10502",
              "id": "10502",
              "description": "",
              "name": "tarent"
            }
          },
          "customfield_17104": null,
          "customfield_15600": null,
          "customfield_17107": null,
          "customfield_10700": null,
          "customfield_26100": null,
          "resolutiondate": null,
          "customfield_22803": null,
          "customfield_22802": null,
          "customfield_20501": null,
          "customfield_22801": null,
          "customfield_22800": null,
          "customfield_26900": null,
          "customfield_24600": null,
          "customfield_20500": null,
          "customfield_24601": null,
          "customfield_24602": null,
          "customfield_24603": null,
          "watches": {
            "self": "https://jira.tarent.de/rest/api/2/issue/TPORTAL-466/watchers",
            "watchCount": 3,
            "isWatching": true
          },
          "customfield_18300": null,
          "customfield_18301": null,
          "customfield_16000": null,
          "customfield_27200": null,
          "customfield_21704": null,
          "customfield_27201": null,
          "customfield_21703": null,
          "customfield_21702": null,
          "customfield_21701": null,
          "customfield_23208": null,
          "customfield_21700": null,
          "customfield_23207": null,
          "customfield_23400": null,
          "updated": "2021-04-14T09:44:14.000+0200",
          "customfield_25700": null,
          "customfield_23205": null,
          "customfield_25701": null,
          "customfield_23202": null,
          "customfield_23201": null,
          "customfield_17201": null,
          "customfield_22111": null,
          "customfield_23200": null,
          "customfield_17200": null,
          "customfield_22110": null,
          "timeoriginalestimate": null,
          "description": "h4.Worum geht es?\r\nDie `docker-compose` Unit, die im Moment die Flutter app ausliefert wurde manuell auf dem Staging System hinterlegt und ist nicht gesichert. Wir würden diesen Code gerne in das \"Infrastructure\" Repository schieben.\r\n\r\nh4.Akzeptanzkriterien\r\n- Deployment des nginx Servers, der /app/ ausliefert (d.h.: die Flutter app) soll voll automatisiert im \"Infrastructure\" Ansible Playbook stattfinden",
          "customfield_17203": null,
          "customfield_17202": null,
          "customfield_15700": null,
          "customfield_10005": null,
          "customfield_10007": null,
          "customfield_16903": null,
          "customfield_10008": null,
          "customfield_16902": null,
          "customfield_28300": null,
          "customfield_20602": null,
          "customfield_22109": null,
          "customfield_20600": null,
          "customfield_22900": null,
          "customfield_22108": null,
          "customfield_20601": null,
          "customfield_22107": null,
          "customfield_24500": null,
          "customfield_22106": null,
          "customfield_24501": null,
          "customfield_24502": null,
          "summary": "Container, der statischen Flutter-app Content ausliefert automatisch deployen",
          "customfield_22104": null,
          "customfield_24503": null,
          "customfield_22103": null,
          "customfield_24504": null,
          "customfield_22102": null,
          "customfield_24505": null,
          "customfield_22101": null,
          "customfield_16101": null,
          "customfield_22100": null,
          "customfield_16100": null,
          "customfield_16103": null,
          "customfield_10000": "1|i074ck:",
          "customfield_16102": null,
          "customfield_10001": "TPORTAL-451",
          "customfield_16901": null,
          "customfield_16900": null,
          "environment": null,
          "duedate": null,
          "customfield_27101": null,
          "customfield_27100": null,
          "customfield_21800": null,
          "customfield_25600": null,
          "customfield_25602": null,
          "customfield_27900": null,
          "customfield_25603": null,
          "customfield_25604": null,
          "customfield_21002": null,
          "customfield_23301": null,
          "customfield_23300": null,
          "customfield_19604": null,
          "fixVersions": [],
          "customfield_15800": null,
          "customfield_19600": null,
          "customfield_15801": null,
          "customfield_19601": null,
          "customfield_19603": null,
          "customfield_28200": null,
          "customfield_24400": null,
          "customfield_20700": null,
          "customfield_22201": null,
          "customfield_22200": null,
          "priority": {
            "self": "https://jira.tarent.de/rest/api/2/priority/3",
            "iconUrl": "https://jira.tarent.de/images/icons/priorities/medium.svg",
            "name": "Medium",
            "id": "3"
          },
          "customfield_16207": null,
          "customfield_15903": null,
          "customfield_15904": null,
          "customfield_15901": null,
          "customfield_15902": null,
          "customfield_21908": null,
          "customfield_21907": null,
          "customfield_27000": null,
          "timeestimate": null,
          "versions": [],
          "customfield_21906": null,
          "customfield_15905": null,
          "customfield_21905": null,
          "customfield_27002": null,
          "customfield_15906": null,
          "customfield_21904": null,
          "customfield_27001": null,
          "customfield_21903": null,
          "customfield_27004": null,
          "customfield_21902": null,
          "customfield_27003": null,
          "customfield_21901": null,
          "customfield_27006": null,
          "customfield_21900": null,
          "customfield_27005": null,
          "customfield_25500": null,
          "customfield_27800": null,
          "customfield_25501": null,
          "customfield_25502": null,
          "status": {
            "self": "https://jira.tarent.de/rest/api/2/status/14200",
            "description": "This status is managed internally by JIRA Software",
            "iconUrl": "https://jira.tarent.de/",
            "name": "PO Review",
            "id": "14200",
            "statusCategory": {
              "self": "https://jira.tarent.de/rest/api/2/statuscategory/4",
              "id": 4,
              "key": "indeterminate",
              "colorName": "yellow",
              "name": "In Progress"
            }
          },
          "customfield_21100": null,
          "customfield_15900": null,
          "aggregatetimeestimate": null,
          "customfield_20804": null,
          "customfield_20805": null,
          "customfield_28100": null,
          "customfield_20802": null,
          "customfield_20803": null,
          "customfield_20801": null,
          "customfield_24300": null,
          "customfield_24301": null,
          "customfield_26600": null,
          "customfield_19013": null,
          "customfield_19014": null,
          "customfield_19015": null,
          "customfield_22300": null,
          "creator": {
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
          "customfield_19016": null,
          "customfield_19010": null,
          "customfield_19011": null,
          "customfield_19012": null,
          "customfield_16302": null,
          "aggregateprogress": {
            "progress": 0,
            "total": 0
          },
          "customfield_19017": null,
          "customfield_16306": null,
          "customfield_25400": null,
          "customfield_25401": null,
          "customfield_27701": null,
          "customfield_19002": {
            "self": "https://jira.tarent.de/rest/api/2/customFieldOption/12608",
            "value": "Standard",
            "id": "12608",
            "disabled": false
          },
          "customfield_19003": null,
          "customfield_19004": null,
          "customfield_21200": null,
          "customfield_23900": null,
          "customfield_19005": null,
          "customfield_19000": null,
          "timespent": null,
          "customfield_19001": null,
          "customfield_19006": null,
          "aggregatetimespent": null,
          "customfield_19007": null,
          "customfield_19008": null,
          "customfield_19009": null,
          "customfield_28000": null,
          "customfield_28001": null,
          "customfield_20901": null,
          "workratio": -1,
          "customfield_24200": null,
          "customfield_20900": null,
          "customfield_26502": null,
          "customfield_20103": null,
          "customfield_20104": null,
          "customfield_20101": null,
          "customfield_22401": null,
          "customfield_22400": null,
          "created": "2021-04-12T09:55:01.000+0200",
          "customfield_18702": [
            {
              "self": "https://jira.tarent.de/rest/api/2/customFieldOption/12302",
              "value": "Nein",
              "id": "12302",
              "disabled": false
            }
          ],
          "customfield_16400": null,
          "customfield_16406": null,
          "customfield_16405": null,
          "customfield_10300": null,
          "customfield_18700": null,
          "customfield_22517": null,
          "customfield_25300": null,
          "customfield_27600": null,
          "customfield_22516": null,
          "customfield_22515": null,
          "customfield_27602": null,
          "customfield_22514": null,
          "customfield_27601": null,
          "customfield_22513": null,
          "customfield_22512": null,
          "customfield_22511": null,
          "customfield_21300": "Bitte die Art des Changes hier eintragen",
          "customfield_22510": null,
          "customfield_20210": null,
          "customfield_19100": null,
          "customfield_17601": null,
          "customfield_17600": null,
          "customfield_15300": null,
          "customfield_22509": null,
          "customfield_20208": null,
          "customfield_22508": null,
          "customfield_20209": null,
          "customfield_22507": null,
          "customfield_20206": null,
          "customfield_22506": null,
          "customfield_26401": null,
          "customfield_20207": null,
          "customfield_22505": null,
          "customfield_26400": null,
          "customfield_20204": null,
          "customfield_22504": null,
          "customfield_20205": null,
          "customfield_22503": null,
          "customfield_26402": null,
          "customfield_20202": null,
          "customfield_22502": null,
          "customfield_20203": null,
          "customfield_22501": null,
          "customfield_20200": null,
          "customfield_22500": null,
          "customfield_20201": null,
          "customfield_24900": null,
          "customfield_16500": null,
          "customfield_10400": null,
          "customfield_18800": null,
          "customfield_25200": null
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
                  "fromString": "Benjamin Patrick Jung",
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
        "fields": {
          "customfield_19200": null,
          "customfield_18111": null,
          "customfield_21400": null,
          "customfield_23700": null,
          "customfield_18112": null,
          "customfield_23701": null,
          "customfield_18113": null,
          "customfield_18114": null,
          "customfield_18110": null,
          "customfield_15400": null,
          "customfield_17700": null,
          "customfield_18115": null,
          "resolution": null,
          "customfield_24000": null,
          "customfield_20301": null,
          "customfield_22601": null,
          "customfield_22600": null,
          "customfield_18100": null,
          "customfield_20300": null,
          "lastViewed": "2021-04-08T11:18:34.262+0200",
          "customfield_18103": null,
          "customfield_24806": null,
          "customfield_18108": null,
          "customfield_24808": null,
          "customfield_18109": null,
          "customfield_24809": null,
          "customfield_18104": null,
          "customfield_18105": null,
          "customfield_18106": null,
          "labels": [
            "toBeRefined"
          ],
          "customfield_18107": null,
          "aggregatetimeoriginalestimate": null,
          "customfield_25100": null,
          "customfield_21506": null,
          "customfield_25101": null,
          "issuelinks": [],
          "customfield_21505": null,
          "customfield_21504": {
            "self": "https://jira.tarent.de/rest/api/2/customFieldOption/14505",
            "value": "nein",
            "id": "14505",
            "disabled": false
          },
          "assignee": {
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
          "customfield_21503": null,
          "customfield_21502": null,
          "customfield_21501": null,
          "customfield_21500": null,
          "customfield_23600": null,
          "customfield_23006": null,
          "customfield_19300": "{summaryBean=com.atlassian.jira.plugin.devstatus.rest.SummaryBean@260df382[summary={pullrequest=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@7deb53cc[overall=PullRequestOverallBean{stateCount=0, state='OPEN', details=PullRequestOverallDetails{openCount=0, mergedCount=0, declinedCount=0}},byInstanceType={}], build=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@4f8a1267[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BuildOverallBean@68d84d69[failedBuildCount=0,successfulBuildCount=0,unknownBuildCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], review=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@422c5261[overall=com.atlassian.jira.plugin.devstatus.summary.beans.ReviewsOverallBean@57ed8ef8[stateCount=0,state=<null>,dueDate=<null>,overDue=false,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], deployment-environment=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@486ba748[overall=com.atlassian.jira.plugin.devstatus.summary.beans.DeploymentOverallBean@62f21829[topEnvironments=[],showProjects=false,successfulCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], repository=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@42edf14c[overall=com.atlassian.jira.plugin.devstatus.summary.beans.CommitOverallBean@79cc3da7[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], branch=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@6c888431[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BranchOverallBean@1e49ead9[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}]},errors=[],configErrors=[]], devSummaryJson={\"cachedValue\":{\"errors\":[],\"configErrors\":[],\"summary\":{\"pullrequest\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"stateCount\":0,\"state\":\"OPEN\",\"details\":{\"openCount\":0,\"mergedCount\":0,\"declinedCount\":0,\"total\":0},\"open\":true},\"byInstanceType\":{}},\"build\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"failedBuildCount\":0,\"successfulBuildCount\":0,\"unknownBuildCount\":0},\"byInstanceType\":{}},\"review\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"stateCount\":0,\"state\":null,\"dueDate\":null,\"overDue\":false,\"completed\":false},\"byInstanceType\":{}},\"deployment-environment\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"topEnvironments\":[],\"showProjects\":false,\"successfulCount\":0},\"byInstanceType\":{}},\"repository\":{\"overall\":{\"count\":0,\"lastUpdated\":null},\"byInstanceType\":{}},\"branch\":{\"overall\":{\"count\":0,\"lastUpdated\":null},\"byInstanceType\":{}}}},\"isStale\":false}}",
          "components": [],
          "customfield_23003": null,
          "customfield_23001": null,
          "customfield_17001": null,
          "customfield_23000": null,
          "customfield_15500": null,
          "customfield_17803": null,
          "customfield_15503": null,
          "customfield_15501": [],
          "customfield_17801": null,
          "customfield_17800": null,
          "customfield_15502": null,
          "customfield_10600": null,
          "customfield_10601": null,
          "customfield_20406": null,
          "customfield_26201": null,
          "customfield_28501": null,
          "customfield_26200": null,
          "customfield_26203": "noch nicht Versand",
          "customfield_20405": null,
          "customfield_26202": null,
          "customfield_28500": null,
          "customfield_22702": null,
          "customfield_26205": null,
          "customfield_20403": null,
          "customfield_22701": null,
          "customfield_26204": null,
          "customfield_20400": null,
          "customfield_22700": null,
          "customfield_20401": null,
          "customfield_26206": null,
          "customfield_24701": null,
          "customfield_18200": null,
          "subtasks": [],
          "reporter": {
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
          "customfield_16701": null,
          "customfield_16700": null,
          "customfield_25000": null,
          "progress": {
            "progress": 0,
            "total": 0
          },
          "votes": {
            "self": "https://jira.tarent.de/rest/api/2/issue/TPORTAL-435/votes",
            "votes": 0,
            "hasVoted": false
          },
          "customfield_23107": null,
          "customfield_23500": null,
          "customfield_23501": "Datum:\r\nKosten:",
          "customfield_25800": null,
          "customfield_25801": null,
          "issuetype": {
            "self": "https://jira.tarent.de/rest/api/2/issuetype/10001",
            "id": "10001",
            "description": "Created by Jira Agile - do not edit or delete. Issue type for a user story.",
            "iconUrl": "https://jira.tarent.de/secure/viewavatar?size=xsmall&avatarId=10315&avatarType=issuetype",
            "name": "Story",
            "subtask": false,
            "avatarId": 10315
          },
          "customfield_19400": null,
          "customfield_23103": null,
          "customfield_19401": null,
          "customfield_17102": null,
          "customfield_23100": null,
          "customfield_17100": null,
          "customfield_17106": null,
          "project": {
            "self": "https://jira.tarent.de/rest/api/2/project/31500",
            "id": "31500",
            "key": "TPORTAL",
            "name": "t-Portal",
            "projectTypeKey": "software",
            "avatarUrls": {
              "48x48": "https://jira.tarent.de/secure/projectavatar?pid=31500&avatarId=45800",
              "24x24": "https://jira.tarent.de/secure/projectavatar?size=small&pid=31500&avatarId=45800",
              "16x16": "https://jira.tarent.de/secure/projectavatar?size=xsmall&pid=31500&avatarId=45800",
              "32x32": "https://jira.tarent.de/secure/projectavatar?size=medium&pid=31500&avatarId=45800"
            },
            "projectCategory": {
              "self": "https://jira.tarent.de/rest/api/2/projectCategory/10502",
              "id": "10502",
              "description": "",
              "name": "tarent"
            }
          },
          "customfield_17104": null,
          "customfield_15600": null,
          "customfield_17107": null,
          "customfield_10700": null,
          "customfield_26100": null,
          "resolutiondate": null,
          "customfield_22803": null,
          "customfield_22802": null,
          "customfield_20501": null,
          "customfield_22801": null,
          "customfield_22800": null,
          "customfield_26900": null,
          "customfield_24600": null,
          "customfield_20500": null,
          "customfield_24601": null,
          "customfield_24602": null,
          "customfield_24603": null,
          "watches": {
            "self": "https://jira.tarent.de/rest/api/2/issue/TPORTAL-435/watchers",
            "watchCount": 1,
            "isWatching": true
          },
          "customfield_18300": null,
          "customfield_18301": null,
          "customfield_16000": null,
          "customfield_27200": null,
          "customfield_21704": null,
          "customfield_27201": null,
          "customfield_21703": null,
          "customfield_21702": null,
          "customfield_21701": null,
          "customfield_23208": null,
          "customfield_21700": null,
          "customfield_23207": null,
          "customfield_23400": null,
          "updated": "2021-04-14T09:05:02.000+0200",
          "customfield_25700": null,
          "customfield_23205": null,
          "customfield_25701": null,
          "customfield_23202": null,
          "customfield_23201": null,
          "customfield_17201": null,
          "customfield_22111": null,
          "customfield_23200": null,
          "customfield_17200": null,
          "customfield_22110": null,
          "timeoriginalestimate": null,
          "description": "Umschaltung zwischen Deutsch / Englisch ermöglichen\r\n\r\n out of scope:\r\n * right2left Layouts / Sprache\r\n\r\nsiehe [https://flutter.dev/docs/development/accessibility-and-localization/internationalization]\r\n\r\nzu klären:\r\n * wollen wir das umsetzen?\r\n * Datumsformat, Zahlenformatierung => Internationalisation\r\n * nicht nur Sprache übersetzung\r\n * Sprache vom System auslesen\r\n * Fehlermeldung in entsprechender Sprache darstellen",
          "customfield_17203": null,
          "customfield_17202": null,
          "customfield_15700": null,
          "customfield_10005": null,
          "customfield_10007": null,
          "customfield_16903": null,
          "customfield_10008": null,
          "customfield_16902": null,
          "customfield_10009": null,
          "customfield_28300": null,
          "customfield_20602": null,
          "customfield_22109": null,
          "customfield_20600": null,
          "customfield_22900": null,
          "customfield_22108": null,
          "customfield_20601": null,
          "customfield_22107": null,
          "customfield_24500": null,
          "customfield_22106": null,
          "customfield_24501": null,
          "customfield_24502": null,
          "summary": "Mobile App Sprachuntersützung aktivieren",
          "customfield_22104": null,
          "customfield_24503": null,
          "customfield_22103": null,
          "customfield_24504": null,
          "customfield_22102": null,
          "customfield_24505": null,
          "customfield_22101": null,
          "customfield_16101": null,
          "customfield_22100": null,
          "customfield_16100": null,
          "customfield_16103": null,
          "customfield_10000": "1|i04ysf:aj460004901",
          "customfield_16102": null,
          "customfield_10001": "TPORTAL-400",
          "customfield_16901": null,
          "customfield_16900": null,
          "environment": null,
          "duedate": null,
          "customfield_27101": null,
          "customfield_27100": null,
          "customfield_21800": null,
          "customfield_25600": null,
          "customfield_25602": null,
          "customfield_27900": null,
          "customfield_25603": null,
          "customfield_25604": null,
          "customfield_21002": null,
          "customfield_23301": null,
          "customfield_23300": null,
          "customfield_19604": null,
          "fixVersions": [],
          "customfield_15800": null,
          "customfield_19600": null,
          "customfield_15801": null,
          "customfield_19601": null,
          "customfield_19603": null,
          "customfield_28200": null,
          "customfield_24400": null,
          "customfield_20700": null,
          "customfield_22201": null,
          "customfield_22200": null,
          "priority": {
            "self": "https://jira.tarent.de/rest/api/2/priority/3",
            "iconUrl": "https://jira.tarent.de/images/icons/priorities/medium.svg",
            "name": "Medium",
            "id": "3"
          },
          "customfield_16207": null,
          "customfield_15903": null,
          "customfield_15904": null,
          "customfield_15901": null,
          "customfield_15902": null,
          "customfield_21908": null,
          "customfield_21907": null,
          "customfield_27000": null,
          "timeestimate": null,
          "versions": [],
          "customfield_21906": null,
          "customfield_15905": null,
          "customfield_21905": null,
          "customfield_27002": null,
          "customfield_15906": null,
          "customfield_21904": null,
          "customfield_27001": null,
          "customfield_21903": null,
          "customfield_27004": null,
          "customfield_21902": null,
          "customfield_27003": null,
          "customfield_21901": null,
          "customfield_27006": null,
          "customfield_21900": null,
          "customfield_27005": null,
          "customfield_25500": null,
          "customfield_27800": null,
          "customfield_25501": null,
          "customfield_25502": null,
          "status": {
            "self": "https://jira.tarent.de/rest/api/2/status/3",
            "description": "This issue is being actively worked on at the moment by the assignee.",
            "iconUrl": "https://jira.tarent.de/images/icons/statuses/inprogress.png",
            "name": "In Progress",
            "id": "3",
            "statusCategory": {
              "self": "https://jira.tarent.de/rest/api/2/statuscategory/4",
              "id": 4,
              "key": "indeterminate",
              "colorName": "yellow",
              "name": "In Progress"
            }
          },
          "customfield_21100": null,
          "customfield_15900": null,
          "aggregatetimeestimate": null,
          "customfield_20804": null,
          "customfield_20805": null,
          "customfield_28100": null,
          "customfield_20802": null,
          "customfield_20803": null,
          "customfield_20801": null,
          "customfield_24300": null,
          "customfield_24301": null,
          "customfield_26600": null,
          "customfield_19013": null,
          "customfield_19014": null,
          "customfield_19015": null,
          "customfield_22300": null,
          "creator": {
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
          "customfield_19016": null,
          "customfield_19010": null,
          "customfield_19011": null,
          "customfield_19012": null,
          "customfield_16302": null,
          "aggregateprogress": {
            "progress": 0,
            "total": 0
          },
          "customfield_19017": null,
          "customfield_16306": null,
          "customfield_25400": null,
          "customfield_25401": null,
          "customfield_27701": null,
          "customfield_19002": {
            "self": "https://jira.tarent.de/rest/api/2/customFieldOption/12608",
            "value": "Standard",
            "id": "12608",
            "disabled": false
          },
          "customfield_19003": null,
          "customfield_19004": null,
          "customfield_21200": null,
          "customfield_23900": null,
          "customfield_19005": null,
          "customfield_19000": null,
          "timespent": null,
          "customfield_19001": null,
          "customfield_19006": null,
          "aggregatetimespent": null,
          "customfield_19007": null,
          "customfield_19008": null,
          "customfield_19009": null,
          "customfield_28000": null,
          "customfield_28001": null,
          "customfield_20901": null,
          "workratio": -1,
          "customfield_24200": null,
          "customfield_20900": null,
          "customfield_26502": null,
          "customfield_20103": null,
          "customfield_20104": null,
          "customfield_20101": null,
          "customfield_22401": null,
          "customfield_22400": null,
          "created": "2021-03-29T13:15:54.000+0200",
          "customfield_18702": [
            {
              "self": "https://jira.tarent.de/rest/api/2/customFieldOption/12302",
              "value": "Nein",
              "id": "12302",
              "disabled": false
            }
          ],
          "customfield_16400": null,
          "customfield_16406": null,
          "customfield_16405": null,
          "customfield_10300": null,
          "customfield_18700": null,
          "customfield_22517": null,
          "customfield_25300": null,
          "customfield_27600": null,
          "customfield_22516": null,
          "customfield_22515": null,
          "customfield_27602": null,
          "customfield_22514": null,
          "customfield_27601": null,
          "customfield_22513": null,
          "customfield_22512": null,
          "customfield_22511": null,
          "customfield_21300": "Bitte die Art des Changes hier eintragen",
          "customfield_22510": null,
          "customfield_20210": null,
          "customfield_19100": null,
          "customfield_17601": null,
          "customfield_17600": null,
          "customfield_15300": null,
          "customfield_22509": null,
          "customfield_20208": null,
          "customfield_22508": null,
          "customfield_20209": null,
          "customfield_22507": null,
          "customfield_20206": null,
          "customfield_22506": null,
          "customfield_26401": null,
          "customfield_20207": null,
          "customfield_22505": null,
          "customfield_26400": null,
          "customfield_20204": null,
          "customfield_22504": null,
          "customfield_20205": null,
          "customfield_22503": null,
          "customfield_26402": null,
          "customfield_20202": null,
          "customfield_22502": null,
          "customfield_20203": null,
          "customfield_22501": null,
          "customfield_20200": null,
          "customfield_22500": null,
          "customfield_20201": null,
          "customfield_24900": null,
          "customfield_16500": null,
          "customfield_10400": null,
          "customfield_18800": null,
          "customfield_25200": null
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
  }

  table.setData(issuesJson);
  expect(table.getData()).not.toBeNull();


  // IssueFields.setAllFields_(fieldList);
  //
  // var matchedField = IssueFields.getMatchingField("Summary");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("summary");
  //
  // var matchedField = IssueFields.getMatchingField("My custom field");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
  //
  // var matchedField = IssueFields.getMatchingField("An unrecognised field");
  // expect(matchedField).toBeNull();
  //
  // var matchedField = IssueFields.getMatchingField("custom1234");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
  //
  // var matchedField = IssueFields.getMatchingField("my CUStom field");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
  //
  // var matchedField = IssueFields.getMatchingField("my CUStom field ");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
  //
  // var matchedField = IssueFields.getMatchingField(" my CUStom field ");
  // expect(matchedField).not.toBeNull();
  // expect(matchedField.key).toBe("custom1234");
});

// test("Convert Jira Field Responses to internal field data", () => {
//   var result = IssueFields.convertJiraResponse({
//     schema: { type: "string" },
//     key: "xyz",
//     name: "XYZ field",
//     custom: false
//   });
//   expect(result.key).toBe("xyz");
//   expect(result.custom).toBe(false);
//   expect(result.name).toBe("XYZ field");
//   expect(result.supported).toBe(true);
//   expect(result.schemaType).toBe("string");
//
//   result = IssueFields.convertJiraResponse({
//     schema: { type: "a custom field not recognised", custom: "customFieldType" },
//     key: "abc",
//     name: "ABC field",
//     custom: true
//   });
//   expect(result.key).toBe("abc");
//   expect(result.custom).toBe(true);
//   expect(result.name).toBe("ABC field");
//   expect(result.supported).toBe(false);
//   expect(result.schemaType).toBe("a custom field not recognised");
//   expect(result.customType).toBe("customFieldType");
//
//   result = IssueFields.convertJiraResponse({
//     schema: { type: "string" },
//     id: "def",
//     name: "DEF field",
//     custom: true
//   });
//   expect(result.key).toBe("def");
//   expect(result.custom).toBe(true);
//   expect(result.name).toBe("DEF field");
//   expect(result.supported).toBe(true);
//   expect(result.schemaType).toBe("string");
// });
//
// test("Set all JIRA fields", () => {
//   IssueFields.setAllFields_({ a: "b" });
//   expect(IssueFields.getAllFields()).toEqual({ a: "b" });
// });
//
// describe("Fetching all changelogs from JIRA", () => {
//   test("Get all changelogs from Jira", () => {
//     var history = [
//       {
//         field: "status",
//         to: 1123,
//         toString: "Done",
//         from: 2233,
//         fromString: "in Progress"
//       },
//       {
//         field: "status",
//         to: 1222,
//         toString: "To Do",
//         from: 3333,
//         fromString: "in Progress"
//       },
//     ];
//     jiraApiMock.resetMocks();
//     jiraApiMock.setNextJiraResponse(200, "history", history);
//
//     const successCallBack = jest.fn();
//     const errorCallBack = jest.fn();
//     var result = ChangelogTable.getAllChangelogs(successCallBack, errorCallBack);
//     expect(jiraApiMock.call.mock.calls.length).toBe(1);
//     expect(successCallBack.mock.calls.length).toBe(1);
//     expect(errorCallBack.mock.calls.length).toBe(0);
//     var fieldListReturned = successCallBack.mock.calls[0][0];
//     expect(fieldListReturned.length).toBe(2);
//     expect(fieldListReturned[0].field).toBe("status");
//   });
// });
