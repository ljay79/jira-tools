// Node required code block
var ChangelogTableRendererDefault_ = require('../renderer/ChangelogTableRendererDefault.gs').ChangelogTableRendererDefault_;
// End of Node required code block

/**
 * Factory class to instantiate different ChangelogTableRenderer classes.
 *
 * @param {string} RendererClassName Classname of a ChangelogTableRenderer class
 * @return {object} An instance of type ChangelogRendererFactory_
 */
function ChangelogRendererFactory_(ChangelogTable, RendererClassName) {
  debug.log('ChangelogRendererFactory_(%s)', RendererClassName);
  var name = 'ChangelogRendererFactory_';

  debug.log('Instantiate new ChangelogTableRendererDefault_');
  return new ChangelogTableRendererDefault_(ChangelogTable);
}

// Node required code block
module.exports = {
  ChangelogRendererFactory_ : ChangelogRendererFactory_
}
// End of Node required code block
