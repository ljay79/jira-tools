// Node required code block

// End of Node required code block

//@TOOD: probably move to own file
function RendererFactory_(RendererClassName) {
  var name = 'RendererFactory_';
  
  switch(RendererClassName) {
    case 'IssueTableRendererDefault_':
      return new IssueTableRendererDefault_(this);
      break;
    default:
      throw new Error("{RendererClassName} is a unknown IssueTable Renderer.");
      break;
  }
}


function IssueTableRendererDefault_(IssueTable) {
  var that = this;

  that.render = function () {
    console.log('IssueTableRendererDefault_.render()');
    console.log('getSheetId: %s; rangeA1: %s', IssueTable.getSheetId(), IssueTable.getMeta('rangeA1'));
  };
  
  /**
   * @desc Initialization, validation
   */
  init = function() {
    console.warn('IssueTableRendererDefault_.init() - that %s', that); // self / IssueTableRendererDefault_
    console.warn('IssueTableRendererDefault_.init() - this %s', this); // this = window/gas
    console.warn('IssueTableRendererDefault_.init() - IssueTable %s', IssueTable); // instance of passed IssueTable_
  };

  init();
}


// Node required code block
module.exports = IssueTableRendererDefault_;
// End of Node required code block
