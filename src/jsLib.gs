// Node required code block
const UserStorage = require('src/models/gas/UserStorage.gs');
// End of Node required code block

/**
 * @desc Extend Object src with obj2
 * @param src {object}
 * @return obj2 {object}
 * @return {object}
 */
function extend(src, obj2) {
  for (var key in obj2) {
    if (obj2.hasOwnProperty(key)) src[key] = obj2[key];
  }
  return src;
}

/**
 * Copy keys and values from src into a new object
 * @param src {Object}
 * @return {object}
 */
function copyObject(src) {
  var result = {};
  for (var key in src) {
    result[key] = src[key];
  }
  return result;
}

/**
 * Reverses the input text.
 *
 * @param {string} input The text to reverse.
 * @return The input text reversed.
 * @customfunction
 */
function reverse(string) {
  if (typeof string != 'string') {
    return null;
  }
  return string.split('').reverse().join('');
}

/**
 * @desc Build URL with query parameters
 * @param url {string}
 * @param parameters {object
 * @return {string}
 */
function buildUrl(url, parameters) {
  var qs = "";
  for (var key in parameters) {
    if (!parameters.hasOwnProperty(key)) continue;
    var value = parameters[key];
    qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
  }
  if (qs.length > 0) {
    qs = qs.substring(0, qs.length - 1); //chop off last "&"
    url = url + "?" + qs;
  }
  return url;
}


/**
 * @desc Camelize string
 * @param str {string}
 * @return {string}
 */
function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/**
 * @desc Converts ISO 8601 date string into JS date object
 * @param string {string}
 * @return {Date}    In case of any issue or bad param it returns new Date()
 */
function getDateFromIso(string) {
  try {
    var aDate = new Date();
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
      "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" +
      "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
      offset = (Number(d[16]) * 60) + Number(d[17]);
      offset *= ((d[15] == '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    time = (Number(date) + (offset * 60 * 1000));
    aDate.setTime(Number(time));
    return aDate;
  } catch (e) {
    return new Date();
  }
}

/**
 * @desc Escape special characters for use in a regular expression
 * @param str {string}
 * @return {string}
 */
function escapeRegExp(strToEscape) {
  return strToEscape.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * @desc Trim a character from string
 * @param origString {string}    Original string to trim character from
 * @param charToTrim {string}    Character to trim from string
 * @return {string}
 */
function trimChar(origString, charToTrim) {
  charToTrim = escapeRegExp(charToTrim);
  var regEx = new RegExp("^[" + charToTrim + "]+|[" + charToTrim + "]+$", "g");
  return origString.replace(regEx, "");
}

/**
 * @desc Check if passed string is valid or not.
 * @param date {String}    String which gets validated as date (ie: '2017-05-31')
 * @return {Boolean}
 */
function isDate(date) {
  return ((new Date(date) !== "Invalid Date" && !isNaN(new Date(date))) ? true : false);
}


/**
 * @desc The fill() method fills all the elements of an array from a start index to an end index with a static value.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill
 * @param value {mixed}    Value to fill an array.
 * @param start {integer}    Optional, Start index, defaults to 0.
 * @param end {integer}    End index, defaults to this.length.
 * @return {Array}    The modified array.
 */
if (!Array.prototype.fill) {
  Array.prototype.fill = function (value) {

    // Steps 1-2.
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }

    var O = Object(this);

    // Steps 3-5.
    var len = O.length >>> 0;

    // Steps 6-7.
    var start = arguments[1];
    var relativeStart = start >> 0;

    // Step 8.
    var k = relativeStart < 0 ?
      Math.max(len + relativeStart, 0) :
      Math.min(relativeStart, len);

    // Steps 9-10.
    var end = arguments[2];
    var relativeEnd = end === undefined ?
      len : end >> 0;

    // Step 11.
    var final = relativeEnd < 0 ?
      Math.max(len + relativeEnd, 0) :
      Math.min(relativeEnd, len);

    // Step 12.
    while (k < final) {
      O[k] = value;
      k++;
    }

    // Step 13.
    return O;
  };
}


/**
 * @desc Converts time difference into human readable format.
 *       Returns difference in %d %h %m %s
 *
 *       Sample call: formatTimeDiff(68399) returns '2d 2h 59m 59s'
 *                or: formatTimeDiff(new Date('2017-08-03T12:59:59'), new Date('2017-08-01T10:00:00')) return '2d 2h 59m 59s'
 *
 * @param {Integer|Date}   Either the time difference in seconds as integer, 
 *                         or two Date() objects.
 * @param {Date}           Optional Date() object to compare with first param Date()
 * @return {String}
 */
function formatTimeDiff() {
  var delta, response = '', workhoursInSeconds = 24;
  workhoursInSeconds = parseFloat(UserStorage.getValue('workhours')) * 3600;

  if(arguments.length == 1) {
    // delta passed to convert
    delta = arguments[0];
  } else if (arguments.length == 2 || arguments.length == 3) {
    // get total seconds between the times
    if (arguments[1] > arguments[0]) {
      delta = Math.abs(arguments[1] - arguments[0]) / 1000;
    } else {
      delta = Math.abs(arguments[0] - arguments[1]) / 1000;
    }
    if (arguments.length == 3) {
      // 3rd argument is optional work hours override as integer in hours
      workhoursInSeconds = parseFloat(arguments[2]) * 3600;
    }
  } else {
    throw 'formatTime() accepts 1 or 2(3) arguments.';
  }

  // calculate (and subtract) whole days (workday=8h)
  var days = Math.floor(delta / workhoursInSeconds);
  delta -= days * workhoursInSeconds;

  // calculate (and subtract) whole hours
  var hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  // calculate (and subtract) whole minutes
  var minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  // what's left is seconds
  var seconds = Math.floor(delta % 60);

  response += days > 0 ? days + 'd ' : '';
  response += hours > 0 ? hours + 'h ' : '';
  response += minutes > 0 ? minutes + 'm ' : '';
  response += seconds > 0 ? seconds + 's ' : '';

  return response.trim();
}

/**
 * @desc Converts time difference or seconds passed into (working-)hours.
 *
 *       Sample call: formatWorkhours(5400) returns '1.5' (hours)
 *                or: formatWorkhours(new Date('2017-08-01T08:30:00'), new Date('2017-08-01T10:00:00')) return '1.5'
 *
 * @param {Integer|Date}   Either the time difference in seconds as integer, 
 *                         or 2 Date objects (from - to).
 * @param {Date}           Optional Date() object to compare with first param Date()
 * @return {Number}
 */
function formatWorkhours() {
  var delta, response = '';
  if (arguments.length == 1) {
    // delta passed to convert
    delta = arguments[0];
  } else if (arguments.length == 2) {
    // get total seconds between the times
    if (arguments[1] > arguments[0]) {
      delta = Math.abs(arguments[1] - arguments[0]) / 1000;
    } else {
      delta = Math.abs(arguments[0] - arguments[1]) / 1000;
    }
  } else {
    throw 'formatWorkhours() accepts 1 or 2 arguments.';
  }

  var hours = Math.round(delta / 3600 * 100) / 100;

  return hours;
}

/**
 * @desc Sorts array of keys in the same order as the keys/properties of a reference object.
 * 
 * @param {Array} usortObject    Unsorted assoc array of keys
 * @param {Object} referenceObject    Reference object to adopt sort of properties from
 * @return {Array}    Original array with sorted keys
 */
function _sortKeysByRef(usortObject, referenceObject) {
  var _sortedObject = Object.keys(referenceObject).filter(function (n) {
    var found = usortObject.indexOf(n) > -1;
    //@TODO: the delete of undefined returned by removeFromArray() makes no sense?
    if (found) delete removeFromArray(usortObject, n);
    return found;
  });

  return _sortedObject.concat(usortObject);
}

/**
 * @desc Removing a specific element from an array
 * 
 * @param {Array} array    Array to remove element from
 * @param {String|Number} element    Element to remove from array
 * @return void
 */
function removeFromArray(array, element) {
  const index = array.indexOf(element);

  if (index !== -1) {
    array.splice(index, 1);
  }
}

/**
 * Splits string into a comma separated list
 * trims whitespace and the start and end of each element
 * ignores empty elements
 * @param listInString {String} String containing comma separated list
 * @return {Array}
 */
function splitCommaList_(listInString) {
  if (typeof listInString === 'string' || listInString instanceof String) {
    var listOfItems = listInString.split(/,\s?/);
    value = [];
    listOfItems.forEach(function (item) {
      if (item.trim().length > 0) {
        value.push(item.trim());
      }
    });
    return value;
  } else {
    return [];
  }
}

/**
 * Takes an array of items and returns an object with the same data 
 * The object uses the passed in "keyFunction" paramater to gets the key from each field
 * @param arrayInput {array}
 * @param keyFunction {function}
 * @returns objectOutput {object}
 */
function convertArrayToObj_(arrayInput, keyFunction) {
  var objectToReturn = {}
  arrayInput.forEach(function (el) {
    objectToReturn[keyFunction(el)] = el;
  });
  return objectToReturn;
}

/**
 * @TODO: Move to appropiate file (not jiraCommand.gs, jsLib.gs, but where?) Get a sheet from current active Spreadsheet by ID passed.
 * @param {int|string} id The sheet id to get a Sheet for.
 * @return {undefined|Sheet}
 */
function getSheetById(id) {
  id = (typeof id === 'string') ? parseInt(id) : id;
  return SpreadsheetApp.getActive().getSheets().filter(function (s) {
    return s.getSheetId() === id;
  })[0];
}

/**
 * @desc Clearing old/obsolete warnings previously set by "TriggerIssueTableModification_()" 
 * @returns void
 */
function clearOldWarnings_() {
  var prop = PropertiesService.getUserProperties();
  var all_props = prop.getProperties();
  var now = new Date();
  var nowSeconds = Math.round(now.getTime() / 1000);

  for( var key in all_props) {
    if (all_props.hasOwnProperty(key)) {
      if (key.indexOf('jst.warning') == 0) {
        var time = Math.round(all_props[key] / 1000);
        if ((nowSeconds - time) > 86400) {
          // warning is older than a day, remove them
          UserStorage.removeValue(key.replace('jst.', ''));
        }
      }
    }
  }
}

// Node required code block
module.exports = {
  buildUrl: buildUrl,
  getDateFromIso: getDateFromIso,
  extend: extend,
  copyObject: copyObject,
  reverse: reverse,
  camelize: camelize,
  getSheetById: getSheetById,
  _sortKeysByRef: _sortKeysByRef,
  splitCommaList_: splitCommaList_,
  convertArrayToObj_: convertArrayToObj_,
  formatTimeDiff: formatTimeDiff,
  formatWorkhours: formatWorkhours,
  trimChar: trimChar,
  removeFromArray: removeFromArray,
  clearOldWarnings_: clearOldWarnings_
};
// End of Node required code block
