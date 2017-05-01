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
 *       http://delete.me.uk/2005/03/iso8601.html
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
