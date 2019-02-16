# Project Aid for Jira (formerly known as: Jira Sheet Tools)

[Jira](https://www.atlassian.com/software/jira) is a powerful and well established project management tool among small to enterprise businesses. Still we often end up using Google Sheets for some overview roadmaps, project dashboards and other purposes.

With this Google Sheet Add-on the, called "[Project Aid for Jira](https://chrome.google.com/webstore/detail/project-aid-for-jira/ncijnapilmmnebhbdanhkbbofofcniao)" available in the Google Add-On store from within Google Sheet, you can now take your sheet based reports with Jira information to the next level.

[Project Aid for Jira](https://chrome.google.com/webstore/detail/project-aid-for-jira/ncijnapilmmnebhbdanhkbbofofcniao) allows you to visualize the status of any Jira ticket you mention in a sheet.
You can directly import entire issue lists with your Jira filters just from within Google sheet.
Or create time reports for any of your users based on the Jira worklogs.

Enter your Jira server domain and user details once, and be able to use these Jira features in any sheet at any time.
No manual status update copy&paste anymore.

> Tested with latest Jira Cloud (OnDemand) - compatible with latest Jira Server. Please provide feedback if you expirience any issue.

# Table of Content
[Install / Get started](#install--get-started)

[Features](#features)

[Custom Functions](#custom-functions)

[Known Limitations](#known-limitations)

[Known Issues](#known-issues)

[Development](#development)

# Install / Get started
* Open up your chrome browser
* Open or create a Google Sheet
* Find & Install the Add-on "[Project Aid for Jira](https://chrome.google.com/webstore/detail/project-aid-for-jira/ncijnapilmmnebhbdanhkbbofofcniao)"
* Authorize the Add-On when asked for

### Authorizations
Explanation of the different privileges, this add-on will ask your permission for when installing.

`View and manage spreadsheets that this application has been installed in`
Required to change and add Jira issue information within the active sheet.

`Display and run third-party web content in prompts and sidebars inside Google applications`
Implied when using CSS style sheets from google (gstatic.com) within any dialog window and when executing Jira API requests.

`Allow this application to run when you are not present`
Fault. This permission is actually not used at all, but triggered by yet unknown word within the code. Will hopefully be not necessary in a sonner release.
In fact, this add-on does not execute anything while the sheet is closed or not implicitly requested by the user.

`Connect to an external service`
Required for establishing connection to the Jira RESTful API to fetch your Jira issue details when requested.

`Publish this application as a web app or a service that may share your data`
Implied when publishing this add-on as a google sheet add-on.
NO data is shared with any third-party other then your google sheet and the used Jira instance.


## Setup Connection to JIRA
Once installed:
Simply provide your individual Jira server settings before you use any feature.

In any Google sheet, go in the menu to “Add-ons" > "Project Aid for Jira" > "Settings”.
Enter your "Jira Domain" and your log on credentials.

#### (A) Email / Username and Password
Either combination of your Atlassian account username/email + password are possible to be used.
Depending on your JIRA instance setup, there is a chance that you will expirience authentication issues with this.

In case your Jira instance is connected to a third-party authentication service such as Google Domain, you should use your email or username and the Jira (Atlassian) password, not the password from your Google account - if it differs.
Read more here in section [Known Issues](#known-issues)

#### (B) Atlassian API Token
A little more effort to prepare, but once done, it will be the safest way of authenticating the sheets add-on.
Using the Atlassian API Token instead of a password in combination with your Atlassian (Jira) username or email address.

For this, you will need to obtain a unique and secure API Token upfront first (you need to do only once).
Best described here -> [How to obtain API Token](https://confluence.atlassian.com/cloud/api-tokens-938839638.html)

> It is recommended to use this Add-on only with an Jira Cloud/Server instance which runs via SSL (https).
> This Add-on is using simple Basic Auth mechanism to authenticate with Jira, which means, user credentials are transmitted unencrypted when used without SSL.

You're all set and ready to go.

# Features
### Update issue key status
“Add-ons" > “Project Aid for Jira” > "Update issue key status "KEY-123 [Done]""

Any Jira ticket Id in the form of "KEY-123" will be updated on the current active google sheet and extended with the current status of matching Jira ticket.

Sample Data:
```markdown
| Before  | After
| KEY-123 | KEY-123 [Done]
| KEY-456 | KEY-456 [In Progress]
| KEY-789 | KEY-789 [Closed]
```
Even when used within text it will search for keys and add the status.
If a Jira issue key is found in a single cell, the value will be linked automatically to the Jira issue page.


### Update formulas in active sheet
“Add-ons" > “Project Aid for Jira” > "Update formulas in active sheet"

When anu custom function or other formula is used, this simple 'click' will refresh / re-calculate all the formulas and custom functions used in the current active google sheet.
If a sheet is re-opened this will re-calculate all custom functions by default anyway, but usually not while editing or watching the current sheet.


### Jira field map
“Add-ons" > “Project Aid for Jira” > "Jira field map"

Fetch and show all your Jira fields name and id in a sidebar. Very useful for our custom functions where you can make use of JQL queries.


### List issues from filter
“Add-ons" > “Project Aid for Jira” > "List issues from filter"

Allows you to add a table/list of all found Jira issues based on your favorite Jira Filter.
The dialog will let you choose from all your Jira filters and then insert all results into the active Google sheet.
You can even decide which information to be shown in the resulting table.
Most common Jira fields / columns are available to select from.
Additionally you can configure many different types of custom Jira field, which then will be available for you in this dialog. (“Add-ons" > “Project Aid for Jira” > "Configure custom fields")

> Note: This feature is currently limited to list a maximum of 1000 jira issues.
> It may even break earlier when the requests takes longer then Google's maximum execution timeout.
> Depending on Jira response time i had successfully listed 1000 issues but sometimes only about >850.


### Update Jira Issues
“Add-ons" > “Project Aid for Jira” > "Update Jira Issues"

Allows you to update values in multiple Jira issues from the values in your spreadsheet.
This feature allows you to select an area of your spreadsheet with header rows and each row below it corresponding to an issue.
The dialog will let you configure the columns from your spreadsheet and map them to Jira issue fields.
It will let you select from most common fields and the custom fields you have configured (“Add-ons" > “Project Aid for Jira” > "Configure custom fields")
Not all fields will update in Jira as there may not be enough data in the spreadsheet for the Add on to set the value. Error messages are shown from Jira when this was the case.

> Each row requires at least one call to Jira REST API to update it.
> Setting the status of a Jira Issue can required 3 calls per row, do not include this field if you do not need to.

### Time Report
“Add-ons" > “Project Aid for Jira” > "Create time report"

Lets you pick a user from Jira and a date period to filter for and generates a nice Time sheet report based on all worklogs for the filtered user and date period.
Supports two different time report formats; "1d 7h 59m" for better readibility or "7.5" (work hours as decimal number) for better calculations in the sheet.
Under “Settings” you can configure which time format you prefer to use.

> Careful when selecting to big date periods, can be slow and become a wide table. Start with 1 week and scale up.

### Configure custom fields
“Add-ons" > “Project Aid for Jira” > "Configure custom fields"

If you wish to list issues in your sheet with the function "List issues from filter" you can specify which columns to insert.
By default only most common Jira default Fields (Columns) are available to choose from.
In case you use custom Jira fields you can now go to the settings section and select some of these customs fields as your favorites.
> Note: Not all custom field formats are supported, these are indicated in the list of fields.

Once you configured your custom fields, these fields are available to create column of in the "List issues from filter" dialog.

> Supported custom fields are of type: **string**, **number**, **date**, **datetime**
**option**, **array of options**, **array of strings**, **user**, **array of users**, **group**, **array of groups**, **version** and **array of versions**


# Custom Functions
Custom functions in Google sheet's are created using standard JavaScript.
(see https://developers.google.com/apps-script/guides/sheets/functions#using_a_custom_function)

### JST_EPICLABEL

Sample: `JST_EPICLABEL("JST-123")`

Description: `Fetch EPIC label from Jira instance for a given Jira Issue Key of type EPIC.`

TicketId: `A well-formed Jira EPIC Ticket Id / Key.`

Use this custom function whenever you like to automatically retrieve the Jira issue label for a given EPIC ticket Id / Key.


### JST_getTotalForSearchResult
Sample: `JST_getTotalForSearchResult("status = Done")`

Description: `Fetch the total count of results for given Jira JQL search query.`

JQL: `A well-formed Jira JQL query.`
(see [https://confluence.atlassian.com/jirasoftwarecloud/...](https://confluence.atlassian.com/jirasoftwarecloud/advanced-searching-764478330.html#Advancedsearching-ConstructingJQLqueries))

Use this custom function whenever you simply need the total count of Jira issues resulting from your JQL ([Jira Query Language](https://confluence.atlassian.com/jirasoftwarecloud/advanced-searching-764478330.html#Advancedsearching-ConstructingJQLqueries)) queries.


### JST_search
Sample: `JST_search("status = Done"; "summary,status")`

Description: `(Mini)Search for Jira issues using JQL.`

JQL: `A well-formed Jira JQL query.` _(*required)_
(see [https://confluence.atlassian.com/jirasoftwarecloud/...](https://confluence.atlassian.com/jirasoftwarecloud/advanced-searching-764478330.html#Advancedsearching-ConstructingJQLqueries))

Fields: `Jira issue field IDs. e.g.: "key,summary,status"` _(*required)_

Limit: `Number of results to return. 1 to 100. Default: 1` _(*optional)_

StartAt: `The index of the first result to return (0-based)` _(*optional)_

Little but quite powerful function to search for Jira issues and fill your sheet with the results.
Using JQL ([Jira Query Language](https://confluence.atlassian.com/jirasoftwarecloud/advanced-searching-764478330.html#Advancedsearching-ConstructingJQLqueries)) queries as you would inside Jira.
Can return just a single cell value or entire list of issues spanning over multiple columns.
Expecting a valid JQL query as 1st parameter and a comma-separated list of Jira field IDs as the 2nd.
If your dont know the exact names and syntax of Jira fields, then look at the Field Map (“Add-ons" > “Project Aid for Jira” > "Jira field map").

**Limitation**: This custom function can return a maximum of **100** results/issues. Search and processing is limited to **30 seconds** per call (Google Limitation), if the Jira Server responds slow, it might not be able to provide full result to you.

> **Tip:** When using more than one field as the second function parameter, the result will use 2 columns in your sheet, starting from the cell you enter the function.
When you define a `Limit` greater than `1`, the results will fill multiple rows below starting from the cell you enter the function.
Give it a try, with a very basic JQL: `JST_search("status = Done"; "key,summary,status"; 5)`
This will search for any Jira issue with `status` equals `Done` and fill your cells with max 5 rows over 3 columns (3 fields = 3 columns).

**Sample Result:**
In cell `A1` put in `JST_search("status = Done"; "key,summary,status"; 5)`
```markdown
1 | A      | B                       | C
2 | KEY-11 | Summary of first issue  | Done
3 | KEY-12 | Summary of second issue | Pending
4 | KEY-13 | Summary of third issue  | Closed
5 | KEY-14 | Summary of fourth issue | Done
6 | KEY-15 | Summary of fifth issue  | ToDo
```


### JST_formatDuration

Sample: `JST_formatDuration(60*60)`

Description: `Format time difference in seconds into nice duration format.`

Seconds: `Duration in seconds`

Use this custom function whenever you like to format a duration time in seconds into JIRA common work duration format.

**Sample Result:**
In cell `A1` put in `JST_formatDuration(60*60)`
```markdown
1 | A
2 | 1h
```
357878 = `12d 3h 24m 38s`


# Known Limitations
With the features of this Add-On come a few hard limits implemented purposly.
Specifically related to the amount of records you can fetch from your Jira API due to Atlassians REST API policy and Google's execution timeouts.
It is described here on [Atlassian.com](https://confluence.atlassian.com/jirakb/changing-maxresults-parameter-for-jira-rest-api-779160706.html) that the limit of records per call can be changed without notice.
Therefore i do use already pagination where ever possible to fetch as many data as possible.

Current existing limitations by this Add-On:
* "List issues from filter" is limited to a total amount of **10.000** issues to be listed per request
  * To comply with Atlassians policy, it does internally fetch only *50* records per page which can result in quite some delay when dealing with too many issues.
* Listing of Jira users and groups (within dialogs) is limited to **100** user/group records
* "Time Report" is limited to report max **1.000** worklogs per Jira issue (max **1.000** issues) per Time sheet
* All data processing however is bound to run within Google's maximum execution time of **5 minutes**.


# Known Issues
`Could not connect to Jira Server![401]`
**1st: Make sure you use your Atlassian username and password, not an email or possibly Google password!**
In case someone comes across the same or similar issue, i could actually reproduce that error and identify one use case where this would happen.

### Solution
This applies to **JIRA Cloud** using **G-Suite synced** account. It might not apply to self hosted Jira instances.

Note that if you are logging in via a synced Google account, it is **NOT** the google password you are supposed to use. Instead you should go to your user profile and look up your username and set a password.

For site admin functions, RSS feeds, REST API access, or WebDAV uploads you'll need to have an Atlassian Cloud password (separate to your Google Apps password.) Which applies to this Add-On as well.

#### Instructions
Log out from your Jira portal.
Go to https://id.atlassian.com and click on "Can't log in?" - just below the log on form.
On the next page enter your email address (which would be your Google Email) and press "Send recovery link".

You will get an email from Atlassian where you please click the provided link at "Reset your password".
Now on the Atlassian page where you can set/change your Atlassian (and not Google) password, enter a new password for your Atlassian account, not to mix up with your Google account.

Of course it makes no sense that this information is not available on the REST API documentation page, since it is quite crucial to get it working.


# Development

## Pre-requisites
To enable Google-Apps-Script (GAS) build, deployment and running unit test on local environment you will need `node`, `gulp` and `clasp`.

* Install latest version of Node.js - https://nodejs.org/en/download/
* Gulp - https://gulpjs.com/
* Clasp - https://codelabs.developers.google.com/codelabs/clasp

Installing `node` will differ from your environment, see install instructions on https://nodejs.org/ .

Assuming `node` is already installed, first install `gulp`:

```sh
sudo npm install gulp-cli -g
sudo npm install gulp -D
```

Now you can install `clasp`:
```sh
sudo npm i @google/clasp -g
```

Then enable Apps Script API: https://script.google.com/home/usersettings

(If that fails, run this:)
```sh
sudo npm i -g grpc @google/clasp --unsafe-perm
```

## Checkout and Setup
Clone the code from Github onto your local machine

```sh
git clone https://github.com/ljay79/jira-tools.git jira-tools
cd jira-tools
```

Then install dependencies

```sh
npm install
```

Check gulp runs ok and displays list of tasks
```sh
$ gulp --tasks
├── clean
├── build
├── set-environment-config
├── use-test-environment
├── clasp-push
├── clasp-pull
├── un-google
├── copy-changed-pulled-code
├─┬ deploy
│ └─┬ <series>
│   ├── clean
│   ├── build
│   ├── set-environment-config
│   └── clasp-push
├─┬ deploy-test
│ └─┬ <series>
│   ├── use-test-environment
│   └─┬ deploy
│     └─┬ <series>
│       ├── clean
│       ├── build
│       ├── set-environment-config
│       └── clasp-push
└─┬ pull
  └─┬ <series>
    ├── clean
    ├── clasp-pull
    ├── un-google
    └── copy-changed-pulled-code
```

Check unit tests are running
```sh
npm test
```

You should now be good for development.

## Developing locally
You will need to be able to test any development work using the code on the target deployment environment of the Google App Scripts (GAS) runtime with a connection to a JIRA instance.

To speed up development of features the code is set up to be able to run locally on your development machine and use TDD ("Test Driven Development") to test code before running against the deployment environment. The use of TDD also enables the reduced risk of regression bugs when building new features.

*Reflected Work Flow:*
1. TDD / Development on local source code
2. Deploy to GAS with `gulp deploy`
3. Test within GAS and tweak code in the GAS interface (if easier)
4. Pull the code with `gulp pull` from GAS back locally and merge with source (_./src_)
5. Commit and push changes to `git`

### Workarounds needed to run GAS files locally in Node
The Google App Scripts (GAS) runtime environment differs from Node.js. For example, in the GAS runtime, any function available in a _.gs_ file in your project is automatically available to call from other files.
Node.js does not allow that.

In enable to allow the running of the unit tests locally using Node.js each _.gs_ file requires the use of import and export statements to make the files available e.g. The following `require` statements imports the '`getCfg`', '`setCfg`' and '`hasSettings`' functions defined in '_settings.gs_' into in another JS file (when running in Node).

```markdown
// Node required code block
const getCfg = require("./settings.gs").getCfg;
const setCfg = require("./settings.gs").setCfg;
const hasSettings = require("./settings.gs").hasSettings;
// End of Node required code block
```

This exports statement in 'settings.gs' is also required
```markdown
// Node required code block
module.exports = {getCfg: getCfg, setCfg: setCfg, hasSettings: hasSettings}
// End of Node required code block
```

These statements are unnecessary in GAS and would cause an error since 'Require' is a Node.js feature.

The gulp scripts used to deploy the source code to GAS (via Clasp) include tasks to comment out these lines of code. The script looks for blocks starting and ending with the following lines and comments the whole block out. 

```markdown
// Node required code block
THIS WHOLE BLOCK WILL BE COMMENTED WHEN DEPLOYED BY THE GULP SCRIPT
// Node required code block
```

> ToDo: Another approach could be to use this code in the unit tests...
> https://github.com/mzagorny/gas-local

## Testing and deploying to GAS
### Set up and linking to your project using `clasp`
Enabling your local project to deploy and test in a Google project requires you to link either an existing Google project using `clasp clone <scriptId>` or *recommended* creating a new Google project with `clasp create`.

Details and options for `clasp clone` you can find here: https://github.com/google/clasp#clone

for `clasp create` please see here https://github.com/google/clasp#create

In both cases, you must login to GAS first and go through the authorisation:
```sh
clasp login
```

you should see something like
```markdown
Logging in globally...
  Authorize clasp by visiting this url:
https://accounts.google.com/o/oauth2/v2/auth?...
  
Authorization successful.

Default credentials saved to: ~/.clasprc.json (/.clasprc.json).
```

#### 1. Create and deploy to a new Google project
```sh
cd ./src
clasp create --type sheets --title "Project Aid for Jira - Devel"
cd ..
gulp deploy
```

#### 2. You already have a existing Google project
The clasp command is currently not yet able to list container bound app scripts such as this Google Sheet (container) bound script.
The command `clasp list` (which lists all your existing projects) might not show you the existing Sheet project [Issue#208](https://github.com/google/clasp/issues/208).
In this case you must obtain the Google Script Id in a different way. One way, which worked for me, is described here: https://github.com/google/clasp/issues/208#issuecomment-395608767

Once you have the correct projects script ID;

```sh
cd ./src
clasp clone <scriptId>
cd ..
```

check you have a _.clasp.json_ file in your _./src/.clasp.json_ folder then perform your first deploy
```sh
gulp deploy
```

### Testing unit tests
In the folder _./test_ are already a few unit test defined to verify the projects functionality.
You can add further to enhance the testing.

To run the tests:

```sh
npm test
```

which will execute all available tests and gives a result like

```markdown
...
Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        10.195s
Ran all test suites.
```

- list all available tests

```sh
npm test -- --listTests
```

- exec specific test

```sh
npm test ./test/jiraApi.test.js
```

- see unit test coverage
```sh
npx jest --coverage
```

### Deploying using `gulp` task

Using the following gulp task will clean the export and require statements and push the code to the configured GAS project.

```sh
gulp deploy
```

This task does actually 4 steps as one; `clean`, `build`, `set-environment-config` and `clasp-push`.
The deployment will update the configuration using one for the files in _/config/test_ or _/config/production_. This will overwrite the default configuration file _./src/environmentConfiguration.gs_ .By default the _production_ folder is used but you can specify the environment you wish by using the following tasks

```sh
gulp deploy --test
gulp deploy-test
```
Both commands above will use the test config file. The second task being a shortcut to avoid entering the parameter.

### Pulling changes back from your Google project

If you make changes to the code in the google project web interface you can pull those changes down onto your local machine.

```sh
gulp pull
```

Use this script if you have changed the source code within the GAS editors while testing on the GAS envrironment.
This task will pull the changes down from your GAS project into a temporary folder './dist/pull'. Then the script will uncomment the require and exports statments. The files copied into the _./src_ folder. It does execute multiple tasks as one; `clean`, `clasp-pull`, `un-google` , `copy-changed-pulled-code`.

### Commit and push changes to git repository

Committing and pushing all your tested and verified changes to a git repository works just as usual.

```sh
git add .
git commit
git push
```

