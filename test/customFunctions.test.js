CacheService = require('test/mocks/CacheService');
const getCfg_ = require("../src/settings.gs").getCfg_;
const setCfg_ = require("../src/settings.gs").setCfg_;
const customFunctions = require('src/customFunctions.gs');

beforeEach(() =>  {
  jest.resetModules();
  CacheService.resetMocks();
});


test("customFunctionAllowed_ throws exceptions", () => {
  // custom_fn_enabled not defined
  setCfg_('custom_fn_enabled', null);
  expect(customFunctions.customFunctionAllowed_).toThrowError();

  // custom_fn_enabled undefined
  setCfg_('custom_fn_enabled', undefined);
  expect(customFunctions.customFunctionAllowed_).toThrowError();

  // custom_fn_enabled disabled
  setCfg_('custom_fn_enabled', 0);
  expect(customFunctions.customFunctionAllowed_).toThrowError();

  // custom_fn_enabled enabled
  setCfg_('custom_fn_enabled', 1);
  expect(customFunctions.customFunctionAllowed_).not.toThrowError();
});

test("customFunctionsSuspended_ for 30 seconds", () => {
  var docProps   = CacheService.getDocumentCache();
  var key_count = 'CUSTOM_FUNCTIONS_ERROR_COUNT';
  var key_time  = 'CUSTOM_FUNCTIONS_ERROR_TIME';
  var now       = new Date(), suspension = null, seconds = 0;
  // custom_fn_enabled enabled
  setCfg_('custom_fn_enabled', 1)

  /* error count = >= 10 */
  docProps.put(key_count, 10, 60*60);
  now = new Date(); suspension = new Date();
  
  expect(customFunctions.customFunctionAllowed_).not.toThrowError();
  // verify suspension time
  suspension.setTime( docProps.get(key_time) );
  seconds = (suspension - now) / 1000;

  expect(seconds).toBeGreaterThanOrEqual(30);
  expect(seconds).toBeLessThan(40);

  // not yet
  //expect(customFunctions.customFunctionAllowed_).toThrowError();
});

test("customFunctionsSuspended_ for 60 seconds", () => {
  var docProps   = CacheService.getDocumentCache();
  var key_count = 'CUSTOM_FUNCTIONS_ERROR_COUNT';
  var key_time  = 'CUSTOM_FUNCTIONS_ERROR_TIME';
  var now       = new Date(), suspension = null, seconds = 0;
  // custom_fn_enabled enabled
  setCfg_('custom_fn_enabled', 1)

  /* error count = >= 25 */
  docProps.put(key_count, 25, 60*60);
  now = new Date(); suspension = new Date();
  
  expect(customFunctions.customFunctionAllowed_).not.toThrowError();
  // verify suspension time
  suspension.setTime( docProps.get(key_time) );
  seconds = (suspension - now) / 1000;

  expect(seconds).toBeGreaterThanOrEqual(60);
  expect(seconds).toBeLessThan(70);

  // not yet
  //expect(customFunctions.customFunctionAllowed_).toThrowError();
});

test("customFunctionsSuspended_ for 300 seconds", () => {
  var docProps   = CacheService.getDocumentCache();
  var key_count = 'CUSTOM_FUNCTIONS_ERROR_COUNT';
  var key_time  = 'CUSTOM_FUNCTIONS_ERROR_TIME';
  var now       = new Date(), suspension = null, seconds = 0;
  // custom_fn_enabled enabled
  setCfg_('custom_fn_enabled', 1)

  /* error count = >= 100 */
  docProps.put(key_count, 100, 60*60);
  now = new Date(); suspension = new Date();
  
  expect(customFunctions.customFunctionAllowed_).not.toThrowError();
  // verify suspension time
  suspension.setTime( docProps.get(key_time) );
  seconds = (suspension - now) / 1000;

  expect(seconds).toBeGreaterThanOrEqual(300);
  expect(seconds).toBeLessThan(310);

  // not yet
  //expect(customFunctions.customFunctionAllowed_).toThrowError();
});
