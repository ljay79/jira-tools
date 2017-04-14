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
