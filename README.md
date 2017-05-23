## Jira Sheet Tools

tbc...

Jira Sheet Tools provides a few useful integrations of Jira REST api into Google Spreadsheet.

### Introduction

Find it in [Chrome Web Store](https://chrome.google.com/webstore/category/apps)

Once installed:
To use, select “Add-ons > TimeSheet > Create Report” to get started - or select “How To” to learn more.


### Refresh Ticket Data

Any Jira ticket Id in the form of "KEY-123" will be updated on the current active google sheet and extended with the current status of matching Jira ticket.

Sample Data:
```markdown
| Before | After
| KEY-123 | KEY-123 [Done]
```

Even with in text it will search for keys and adds the status.
If Jira issue key used in a single cell, the value will be linked automatically to the Jira issue page.

### List Issues From Filter

Allows you to add a table/list of all found Jira issues based on a Jira Filter.
The dialog will let you choose from all your Jira filters and then insert all results into the active Google sheet.
