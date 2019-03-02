

var htmlOutput = {
  setTitle: jest.fn(),
  setSandboxMode: jest.fn()
}
var dialog = {
  setWidth: jest.fn(),
  setHeight: jest.fn(),
  setSandboxMode: jest.fn(),
  getContent: jest.fn()
}

var template = {
  evaluate : jest.fn(),
}

var HtmlService = {
  createTemplateFromFile: jest.fn(),
  createHtmlOutput: jest.fn(),
  SandboxMode : {
    IFRAME: "IFRAME"
  },
  // properties to access the mock objects
  templateMock: template,
  dialogMock: dialog,
  htmlOutputMock: htmlOutput,
  // resets all the mocks ready for a new test
  resetMocks: function () {
    this.templateMock = {
      evaluate: template.evaluate
    }
    template = this.templateMock;
    var mocks = [
      [HtmlService.createTemplateFromFile, template],
      [HtmlService.createHtmlOutput,htmlOutput],
      [htmlOutput.setTitle,htmlOutput],
      [htmlOutput.setSandboxMode,htmlOutput],
      [template.evaluate, dialog],
      [dialog.setWidth, dialog],
      [dialog.setHeight, dialog],
      [dialog.setSandboxMode, dialog],
      [dialog.getContent, "<html>dialog<html>"],
    ];
    mocks.forEach((pair) => {
      pair[0].mockReset();
      pair[0].mockImplementation(() => pair[1]);
    });
  },
}

HtmlService.resetMocks();

module.exports = HtmlService;