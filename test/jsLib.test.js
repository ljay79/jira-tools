jsLib = require('../src/jsLib.gs');

test('jsLib - buildUrl() accepts multiple ways of passing parameters', () => {
  var result = jsLib.buildUrl('https://www.example.org', {});
  expect(result).toBe('https://www.example.org');

  result = jsLib.buildUrl('https://www.example.org', {a:'b'});
  expect(result).toBe('https://www.example.org?a=b');

  result = jsLib.buildUrl('https://www.example.org', {a:'1', b:'2'});
  expect(result).toBe('https://www.example.org?a=1&b=2');

  result = jsLib.buildUrl('https://www.example.org', {a:'a?b', b:'b=2'});
  expect(result).toBe('https://www.example.org?a=a%3Fb&b=b%3D2');

  result = jsLib.buildUrl('https://www.example.org', ['1','2']);
  expect(result).toBe('https://www.example.org?0=1&1=2');

  result = jsLib.buildUrl('https://www.example.org', []);
  expect(result).toBe('https://www.example.org');

  result = jsLib.buildUrl('https://www.example.org', true);
  expect(result).toBe('https://www.example.org');
  
  result = jsLib.buildUrl('https://www.example.org');
  expect(result).toBe('https://www.example.org');
});


test('jsLib - getDateFromIso()', () => {
  var result = jsLib.getDateFromIso('2019-12-30T22:59:59.000+01:00');
  var compareDate = new Date('2019-12-30T21:59:59+00:00');
  var timeSecOnly = function(date) {
	  return Math.floor(date.getTime() / 1000);
  };

  expect(typeof result).toBe('object');
  expect(result.toISOString()).toEqual(compareDate.toISOString());

  expect(timeSecOnly(jsLib.getDateFromIso(undefined))).toEqual(timeSecOnly(new Date()));
  expect(timeSecOnly(jsLib.getDateFromIso([]))).toEqual(timeSecOnly(new Date()));
  expect(timeSecOnly(jsLib.getDateFromIso({}))).toEqual(timeSecOnly(new Date()));
  expect(timeSecOnly(jsLib.getDateFromIso(''))).toEqual(timeSecOnly(new Date()));
});

