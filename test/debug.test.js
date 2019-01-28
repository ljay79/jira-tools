
PropertiesService = require('./mocks/PropertiesService');
ScriptApp = require('./mocks/ScriptApp');
global.environmentConfiguration = require('../src/environmentConfiguration.gs');

beforeEach(() =>  {
  jest.resetAllMocks();
  jest.resetModules();
  PropertiesService.resetMocks();
  environmentConfiguration.debugEnabled = false;
});

test("debugging calls console when enabled",() =>{
  var debug = require("../src/debug.gs").debug;
  var consoleLogSpy = jest.spyOn(global.console,'log');
  var consoleErrorSpy = jest.spyOn(global.console,'error');
  var consoleInfoSpy = jest.spyOn(global.console,'info');
  var consoleWarnSpy = jest.spyOn(global.console,'warn');
  debug.enable(true);
  debug.log("log message");
  expect(consoleLogSpy).toBeCalledTimes(1);
  expect(consoleLogSpy).toBeCalledWith("log message");
  debug.info("info message");
  expect(consoleInfoSpy).toBeCalledTimes(1);
  expect(consoleInfoSpy).toBeCalledWith("info message");
  debug.error("error message");
  expect(consoleErrorSpy).toBeCalledTimes(1);
  expect(consoleErrorSpy).toBeCalledWith("error message");
  debug.warn("warn message");
  expect(consoleWarnSpy).toBeCalledTimes(1);
  expect(consoleWarnSpy).toBeCalledWith("warn message");
});

test("debugging makes no calls to console when disabled",() =>{
  var debug = require("../src/debug.gs").debug;
  var consoleLogSpy = jest.spyOn(global.console,'log');
  var consoleErrorSpy = jest.spyOn(global.console,'error');
  var consoleInfoSpy = jest.spyOn(global.console,'info');
  var consoleWarnSpy = jest.spyOn(global.console,'warn');
  debug.enable(false);
  debug.log("no log message");
  expect(consoleLogSpy).toBeCalledTimes(0);
  debug.info("no info message");
  expect(consoleInfoSpy).toBeCalledTimes(0);
  debug.error("no error message");
  expect(consoleErrorSpy).toBeCalledTimes(0);
  debug.warn("no warn message");
  expect(consoleWarnSpy).toBeCalledTimes(0);
});

test("Init function handles exceptions when PropertiesService.getUserProperties is not availble",() =>{
  //PropertiesService.getUserProperties throws an exception in Authmode.NONE
  // ensure it causes no issues
  PropertiesService.getUserProperties.mockImplementation( ()=> {
    throw "getUserProperties is not availble"
  });
  var debug = require("../src/debug.gs").debug;
  var consoleLogSpy = jest.spyOn(global.console,'log');
  debug.log("no log message");
  expect(consoleLogSpy).toBeCalledTimes(0);
  expect(PropertiesService.getUserProperties).toBeCalledTimes(1);
});


test("Debugging is enabled by default when PropertiesService.getUserProperties returns true",() =>{
  PropertiesService.mockUserProps.getProperty.mockImplementation( ()=> {
      return 'true';
  });
  var debug = require("../src/debug.gs").debug;
  var consoleLogSpy = jest.spyOn(global.console,'log');
  debug.log("log message should be output");
  expect(PropertiesService.getUserProperties().getProperty).toBeCalled();
  expect(consoleLogSpy).toBeCalledTimes(1);
});


test("Debugging is disabled by default when PropertiesService.getUserProperties returns null or false",() =>{
  
  PropertiesService.mockUserProps.getProperty.mockImplementation( ()=> {
      return '';
  });
  var debug = require("../src/debug.gs").debug;
  var consoleLogSpy = jest.spyOn(global.console,'log');
  debug.log("log message should not be output");
  expect(PropertiesService.getUserProperties().getProperty).toBeCalled();
  expect(consoleLogSpy).toBeCalledTimes(0);

  jest.resetModules(); // force debug to be reloaded.
  PropertiesService.resetMocks();
  PropertiesService.getUserProperties().getProperty.mockImplementation(() => {
    return 'false';
  });
  var debug2 = require("../src/debug.gs").debug;
  var consoleLogSpy = jest.spyOn(global.console, 'log');
  debug2.log("log message should not be output");
  expect(PropertiesService.getUserProperties().getProperty).toBeCalled();
  expect(consoleLogSpy).toBeCalledTimes(0);
});

test("Environment default debugging as true overrides user preferences",() =>{
  PropertiesService.mockUserProps.getProperty.mockImplementation(() => {
    return '';
  });
  environmentConfiguration.debugEnabled = true;
  var debug = require("../src/debug.gs").debug;
  var consoleLogSpy = jest.spyOn(global.console, 'log');
  debug.log("log message should be output");
  expect(PropertiesService.getUserProperties().getProperty).toBeCalled();
  expect(consoleLogSpy).toBeCalledTimes(1);
});

test("Toggling debugging works when turning ON debugging",() =>{
  PropertiesService.mockUserProps.getProperty.mockImplementation(() => {
    return 'true';
  });
  var debug = require("../src/debug.gs").debug;
  var toggleDebugging = require("../src/debug.gs").toggleDebugging;
  var consoleLogSpy = jest.spyOn(global.console, 'log');
  toggleDebugging('1');
  expect(consoleLogSpy).toBeCalledTimes(1);// there is a console.log call in toggleDebugging
  expect(PropertiesService.mockUserProps.setProperty).toBeCalledTimes(1);
  expect(PropertiesService.mockUserProps.setProperty).toBeCalledWith("debugging","true");
  debug.log("this should be logged out");
  expect(consoleLogSpy).toBeCalledTimes(2);
});

test("Toggling debugging works when turning OFF debugging",() =>{
  PropertiesService.mockUserProps.getProperty.mockImplementation(() => {
    return 'false';
  });
  var debug = require("../src/debug.gs").debug;
  var toggleDebugging = require("../src/debug.gs").toggleDebugging;
  var consoleLogSpy = jest.spyOn(global.console, 'log');
  toggleDebugging('0');
  expect(consoleLogSpy).toBeCalledTimes(1);// there is a console.log call in toggleDebugging
  expect(PropertiesService.mockUserProps.setProperty).toBeCalledTimes(1);
  expect(PropertiesService.mockUserProps.setProperty).toBeCalledWith("debugging","false");
  debug.log("this should NOT be logged out");
  expect(consoleLogSpy).toBeCalledTimes(1);
});


test("Toggling debugging works when turning OFF debugging but is overriden by environmentconfig",() =>{
  PropertiesService.mockUserProps.getProperty.mockImplementation(() => {
    return 'false';
  });
  environmentConfiguration.debugEnabled = true;
  var debug = require("../src/debug.gs").debug;
  var toggleDebugging = require("../src/debug.gs").toggleDebugging;
  var consoleLogSpy = jest.spyOn(global.console, 'log');
  toggleDebugging('0');
  expect(consoleLogSpy).toBeCalledTimes(1);// there is a console.log call in toggleDebugging
  expect(PropertiesService.mockUserProps.setProperty).toBeCalledTimes(1);
  expect(PropertiesService.mockUserProps.setProperty).toBeCalledWith("debugging","false");
  debug.log("this should be be logged because its set in the enviroment by default");
  expect(consoleLogSpy).toBeCalledTimes(2);
});


test('check if debug mode is turned on appropriately', () => {
  var extend = require('../src/jsLib.gs').extend;
  // covering all the scenarios
  // userDebug - has the use selected debugging (stored in user preferences).
  // environmentDebug - value for debug set in enviroment config. 
  // authmode - value of authmode the plugin should run in. This impacts access to user preferences
  // debugIsEnabled - will debug actually be enabled - the expected outcome
  // debugIsEnabled - this should be true if (userDebug || environmentDebug)
  var scenarioList = [
    { num:1, userDebug: false, environmentDebug: false, authmode: ScriptApp.AuthMode.NONE, debugIsEnabled: false },
    { num:2, userDebug: false, environmentDebug: false, authmode: ScriptApp.AuthMode.LIMITED, debugIsEnabled: false },
    { num:3, userDebug: false, environmentDebug: false, authmode: ScriptApp.AuthMode.FULL, debugIsEnabled: false },
    { num:4, userDebug: true, environmentDebug: false, authmode: ScriptApp.AuthMode.NONE, debugIsEnabled: false },
    { num:5, userDebug: true, environmentDebug: false, authmode: ScriptApp.AuthMode.LIMITED, debugIsEnabled: true },
    { num:6, userDebug: true, environmentDebug: false, authmode: ScriptApp.AuthMode.FULL, debugIsEnabled: true },
    { num:7, userDebug: true, environmentDebug: true, authmode: ScriptApp.AuthMode.NONE, debugIsEnabled: true },
    { num:8, userDebug: true, environmentDebug: true, authmode: ScriptApp.AuthMode.LIMITED, debugIsEnabled: true },
    { num:9, userDebug: true, environmentDebug: true, authmode: ScriptApp.AuthMode.FULL, debugIsEnabled: true },
    { num:10, userDebug: false, environmentDebug: true, authmode: ScriptApp.AuthMode.NONE, debugIsEnabled: true },
    { num:11, userDebug: false, environmentDebug: true, authmode: ScriptApp.AuthMode.LIMITED, debugIsEnabled: true },
    { num:12, userDebug: false, environmentDebug: true, authmode: ScriptApp.AuthMode.FULL, debugIsEnabled: true },
  ];
  scenarioList.forEach((scenario) => {
    // reset imported modules so that the debug code re-initiliases
    jest.resetModules();
    // reset the test environment and mocks from previous tests
    //SpreadsheetApp.resetMocks();
    PropertiesService.resetMocks();
    // set up the values from the scenario in mocks and configuration

    PropertiesService.getUserProperties.mockImplementation(() => {
      // Authmode will cause getUserProperties to throw an exception in NONE
      if (scenario.authmode == ScriptApp.AuthMode.NONE) {
        throw Error("This is not available when in ScriptApp.AuthMode.NONE");
      }
      // other wise return the mock functions
      return PropertiesService.mockUserProps;
    });
    
    // set up the value for whether the user has selected debugging should be available
    PropertiesService.mockUserProps.getProperty.mockImplementation(() => {
      if (scenario.userDebug === true) {
        return "true";
      } else {
        return "false"
      }
    });

    // set up the value in the environment congige
    environmentConfiguration.debugEnabled = scenario.environmentDebug;
    
    var debug = require("../src/debug.gs").debug;
   
    // try to log on the debugger which will trigger a call to debug.enable
    debug.log("Just a test");

    // put the final state into an object and compare to the desired scenario in the current test
    // this makes it easier to see the failed scenario from the jest output

    var actual = extend({}, scenario);
    actual.debugIsEnabled = debug.isEnabled();
    expect(actual).toEqual(scenario);

  });
});
