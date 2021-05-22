
/**
 * Factory class to instantiate different Renderer classes.
 * 
 * @param {string} RendererClassName Classname of a Renderer class
 * @return {object} An instance of any TableRenderer
 */
function RendererFactory_(RendererClassName) {
  debug.log('RendererFactory_(%s)', RendererClassName);
  var name = 'RendererFactory_';

  switch (RendererClassName)
  {
    case 'IssueTableRendererDefault_':
      debug.log('Instantiate new IssueTableRendererDefault_');
      return new IssueTableRendererDefault_(this);
      break;

    case 'ChangelogTableRendererDefault_':
      debug.log('Instantiate new ChangelogTableRendererDefault_');
      return new ChangelogTableRendererDefault_(this);

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
      throw new Error("{RendererClassName} is a unknown IssueTable Renderer.");
      break;
  }
}


// Node required code block
module.exports = {
  RendererFactory_ : RendererFactory_
}
// End of Node required code block
