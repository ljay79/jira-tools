// Node required code block
var changelogTableRendererDefault_ = require('../renderer/ChangelogTableRendererDefault.gs').ChangelogTableRendererDefault_;
// End of Node required code block

/**
 * Factory class to instantiate different ChangelogTableRenderer classes.
 *
 * @param {string} RendererClassName Classname of a ChangelogTableRenderer class
 * @return {object} An instance of type ChangelogRendererFactory_
 */
function ChangelogRendererFactory_(ChangelogeTable, RendererClassName) {
  debug.log('ChangelogRendererFactory_(%s)', RendererClassName);
  var name = 'ChangelogRendererFactory_';

  debug.log('Instantiate new ChangelogTableRendererDefault_');
  return changelogTableRendererDefault_(ChangelogeTable);
}

// Node required code block
module.exports = {
  ChangelogRendererFactory_ : ChangelogRendererFactory_
}
// End of Node required code block