
/**
 * Generate random number between min and max length
 * @param {integer} min
 * @param {integer} max
 * @return {integer}
 */
var _randomNum = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random string with variable length
 * @param {integer} min    Min length of string
 * @param {integer} max    Max length of string
 * @return {string}
 */
var _randomId = function(min, max) {
  var string = '';
  var length = _randomNum(min || 10, max || 20);
  var possible = "-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    string += possible.charAt(Math.floor(Math.random() * possible.length));

  return string;
}


module.exports = {
  _randomNum: _randomNum,
  _randomId: _randomId
};
