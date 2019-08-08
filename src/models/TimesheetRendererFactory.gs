// Node required code block

// End of Node required code block

/**
 * Factory class to instantiate different TimesheetTableRenderer classes.
 * 
 * @param {string} RendererClassName Classname of a TimesheetTableRenderer class
 * @return {object} An instance of type TimesheetRendererFactory_
 */
function TimesheetRendererFactory_(RendererClassName) {
  debug.log('TimesheetRendererFactory_(%s)', RendererClassName);
  var name = 'TimesheetRendererFactory_';

  switch (RendererClassName) {
    case 'TimesheetTableRendererLayout01_':
    case 'list_layout_01': // alias
      debug.log('Instantiate new TimesheetTableRendererLayout01_');
      return new TimesheetTableRendererLayout01_(this);
      break;
    case 'TimesheetTableRendererLayout02_':
    case 'list_layout_02': // alias
      debug.log('Instantiate new TimesheetTableRendererLayout02_');
      return new TimesheetTableRendererLayout02_(this);
      break;
    default:
      throw new Error("{RendererClassName} is a unknown TimesheetTable Renderer.");
      break;
  }
}

// Node required code block
module.exports = {
  TimesheetRendererFactory_ : TimesheetRendererFactory_
}
// End of Node required code block
