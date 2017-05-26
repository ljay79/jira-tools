# Jira Sheet Tools

[Jira](https://www.atlassian.com/software/jira) is a powerful and well established project management tool amoung small to enterprice businesses. Still we often end up using Google Sheets for some overview roadmaps, project dashboards and other purposes.

With this Google Sheet Add-on the, called "[Jira Sheet Tools](https://chrome.google.com/webstore/detail/jira-sheet-tools/ncijnapilmmnebhbdanhkbbofofcniao)" available in the Google Add-On store from within Google Sheet, you can now take your sheets with Jira information to the next level.

[Jira Sheet Tools](https://chrome.google.com/webstore/detail/jira-sheet-tools/ncijnapilmmnebhbdanhkbbofofcniao) allows you to visualize the status of any Jira ticket you mention in a sheet.
You can directly import entire issue lists with your Jira filters just from within Google sheet.

Enter your Jira server domain and user details once, and be able to use the Jira features in any sheet at any time.
No manual status update copy&paste anymore.

# Install / Get started
* Open up your chrome browser
* Find & Install the Add-on "[Jira Sheet Tools](https://chrome.google.com/webstore/detail/jira-sheet-tools/ncijnapilmmnebhbdanhkbbofofcniao)"
* Authorize the Add-On when asked for

##### Authorizations
```View and manage your spreadsheets in Google Drive```
Required to change and add Jira issue information within the active sheet.
```View and manage data associated with the application```
The Add-on will store your Jira settings within the protected google sheet storage.
```Allow this application to run when you are not present```
Fault. This permission is actually not used at all, but triggered by yet unknown word within the code. Will hopefully be not necessary in a sonner release.
```Connect to an external service```
Required for establishing connection to the Jira RESTful API to fetch your Jira issue details when requested.

## Setup Connection to JIRA
Once installed:
Simply provide your individual Jira server settings before you use all features.

In any Google sheet, go in the menu to “Add-ons" > "Jira Sheet Tools" > "Settings”.
Enter your "Jira Domain", "Username" and "Password".

**You're all set and ready to go**

# Features
## Refresh Ticket Data
Any Jira ticket Id in the form of "KEY-123" will be updated on the current active google sheet and extended with the current status of matching Jira ticket.

Sample Data:
```markdown
| Before  | After
| KEY-123 | KEY-123 [Done]
| KEY-456 | KEY-456 [In Progress]
| KEY-789 | KEY-789 [Closed]
```

Even when used within text it will search for keys and add the status.
If Jira issue key used in a single cell, the value will be linked automatically to the Jira issue page.

### List Issues From Filter
“Add-ons" > “Jira Sheet Tools” > "Insert...” > "List Issues from Filter"

Allows you to add a table/list of all found Jira issues based on a Jira Filter.
The dialog will let you choose from all your Jira filters and then insert all results into the active Google sheet.
You can even decide which information to be shown in the resulting table.
Most common Jira fields / columns are available to select from.

