
PropertiesService = require('./mocks/PropertiesService');


beforeEach(() =>  {
  jest.resetAllMocks();
  jest.resetModules();
  PropertiesService.resetMocks();
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

test("Init function does not cause and exception when PropertiesService.getUserProperties  is not valid",() =>{
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