beforeEach(() =>  {
  jest.resetAllMocks();
  jest.resetModules();
});

test("customFunctionAllowed_ throws exceptions", () => {
  jest.mock('src/settings.gs');
  const settingsMock = require('src/settings.gs');
  settingsMock.getCfg_ = jest.fn();

  const customFunctions = require('src/customFunctions.gs');
  
  settingsMock.getCfg_.mockImplementationOnce( ()=> {
    return null;
  });
  expect(customFunctions.customFunctionAllowed_).toThrowError();

  settingsMock.getCfg_.mockImplementationOnce( ()=> {
    return undefined;
  });
  expect(customFunctions.customFunctionAllowed_).toThrowError();

  settingsMock.getCfg_.mockImplementationOnce( ()=> {
    return 0;
  });
  expect(customFunctions.customFunctionAllowed_).toThrowError();

  settingsMock.getCfg_.mockImplementationOnce( ()=> {
    return 1;
  });
  expect(customFunctions.customFunctionAllowed_).not.toThrowError();
});