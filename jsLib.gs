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
function buildUrl(url, parameters){
  var qs = "";
  for(var key in parameters) {
    var value = parameters[key];
    qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
  }
  if (qs.length > 0){
    qs = qs.substring(0, qs.length-1); //chop off last "&"
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
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

/**
 * @desc Converts ISO 8601 date string into JS date object
 * @param string {string}
 * @return {Date}
 */
function getDateFromIso(string) {
  try{
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
    return aDate.setTime(Number(time));
  } catch(e){
    return;
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
    return ((new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ) ? true : false);
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
  Array.prototype.fill = function(value) {

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
 *       Sample call: formatTimeDiff(183599000) returns '2d 2h 59m 59s'
 *                or: formatTimeDiff(new Date('2017-08-03T12:59:59'), new Date('2017-08-01T10:00:00')) return '2d 2h 59m 59s'
 *
 * @param {Integer|Date}   Either the time difference in seconds as integer, 
 *                         or two Date() objects.
 * @param {Date}           Optional Date() object to compare with first param Date()
 * @return {String}
 */
function formatTimeDiff() {
  var delta, response = '';
  if(arguments.length == 1) {
    // delta passed to convert
    delta = arguments[0];
  } else if (arguments.length == 2) {
    // get total seconds between the times
    if ( arguments[1] > arguments[0] ) {
      delta = Math.abs(arguments[1] - arguments[0]) / 1000;
    } else {
      delta = Math.abs(arguments[0] - arguments[1]) / 1000;
    }
  } else {
    throw 'formatTime() accepts 1 or 2 arguments.';
  }

  // calculate (and subtract) whole days (workday=8h)
  var workhoursInSeconds = parseFloat(getVar('workhours')) * 3600;
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
};

/**
 * @desc Converts time difference or seconds passed into hours.
 *
 *       Sample call: formatTimeDiff(5400) returns '1.5' (hours)
 *                or: formatTimeDiff(new Date('2017-08-01T08:30:00'), new Date('2017-08-01T10:00:00')) return '1.5'
 *
 * @param {Integer|Date}   Either the time difference in seconds as integer, 
 *                         or 2 Date objects (from - to).
 * @param {Date}           Optional Date() object to compare with first param Date()
 * @return {Number}
 */
function formatWorkhours() {
  var delta, response = '';
  if(arguments.length == 1) {
    // delta passed to convert
    delta = arguments[0];
  } else if (arguments.length == 2) {
    // get total seconds between the times
    if ( arguments[1] > arguments[0] ) {
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
