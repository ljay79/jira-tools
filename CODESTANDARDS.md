
# Code Standards

This is a work in progress - if you contribute to the code base please work towards these standards and [leave the code base tidier than when you found it](https://deviq.com/boy-scout-rule/). 
- All code should be placed in the `src` folder
- All unit tests should be placed in the `test` folder
- Use camel case for all files
- Test your code using unit tests and make sure all tests run before pushing code.
 - Classes should use an initial uppercase letter e.g. `MyClass`
- Controllers and function libraries sholuld start with a lower case letter `myController`
- For private functions use an underscore suffix as per Googles GAS standards e.g. `myPrivateFunction_`
- Use JSDocs for all functions
```
/**
 * Raises a number to the given power, and returns the result.
 *
 * @param {number} base the number we're raising to a power
 * @param {number} exp the exponent we're raising the base to
 * @return {number} the result of the exponential calculation
 */
function power(base, exp) { ... }
 ```
## File and folder layout
Details layout of /src folder

|File / Folder | Responsibilities |
|------------|-----------|
|`Code.gs` | Initialises menu and GAS lifecycle events|
|`controllers` | One file per feature. Interacts with the sheet, models and updates views |
|`views` | HTML files for the UI in the Google sheet |
|`models` | Entities for the entities e.g Jira Objects, User preferences. Interacts with underlying Google services and Jira API |
|`libs` | Generic JS Libraries used as a dependecy only - does not interact with any other code |
|`api` | Service layer to interact with external services e.g. JIRA. used as a dependency only does not interact with any other code *except* libs |


```
/config/ <- the environment configuration stuff where necessary
    /production/
        environmentConfig.gs
    /test/
        environmentConfig.gs
/views/ <- any HTML files
    /dialogs/ <- all the dialogs HTML
         settings.html
         about.html
    /sidebar/ <- all the sidebar HTML (coming)
        fieldMap.html
/libs/ <- any generic abstract and reusable code like `jsLib` and other generic functions / classes
    jsLib.gs
    debug.gs
/controllers/ <- controllers 
    updateIssues.gs 
    otherFeature.gs
    search.gs
    customFunctions.gs <- all GAS custom functions
    ...
/models/
        /jira/ 
           Issue.gs - Internal Model and CRUD operations on Jira Issue(s)
           IssueFields.gs - Internal model for accessing fields 
        /application/
            UserSettings.gs - Model for saving user settings
   
/api/ <- code which interfaces with external services like JIRA / Google APIs - called by models.
    JiraApi.gs
    Storage.gs
```

### Unit test file and folder structure
All unit tests should be placed in the consistent folder name with `.test` added to the filename before the extenstion.

All unit tests should use the extension `.js`

e.g unit tests for `/controllers/updateIssues.gs` should be placed in 
`/controllers/updateIssues.test.js`

### Controllers

Any action or menu item call functions in a controller file. This file should be placed in the `/controllers` folder and be named after the feature it supports.

For example the entry points for "New Cool Feature" from the menu or call backs from the javascript in the HTML template displayed to the user should be added to a file called `controllers/newCoolFeature.gs`

Inside that file you would add functions based on this template
```
/*
* Functions for New Cool Feature.
*/

function menuNewCoolFeature() {
  // do stuff when the menu item is clicked
  // Add reference in Code.gs 
  //  e.g. .addItem('New cool feature', 'menuNewCoolFeature')
  
}

function menuAnotherThingForNewCoolFeature() {
  // do stuff when the menu item is clicked
  // Add reference in Code.gs 
  //  e.g. .addItem('New cool feature 2' 'menuAnotherThingForNewCoolFeature')
}

function callbackForNewCoolFeature(parameters) {
  // do stuff from a callback from google.script.run in the view displayed for this feature
  // e.g.
  /*
  google.script.run
          .callbackForNewCoolFeature(parameters);
  */
}
```
