
var dialog = {
  setWidth: jest.fn(),
  setHeight: jest.fn(),
  setSandboxMode: jest.fn()
}

var template = {
  evaluate : jest.fn()
}

var HtmlService = {
  createTemplateFromFile: jest.fn(),
  SandboxMode : {
    IFRAME: "IFRAME"
  },
  // properties to access the mock objects
  templateMock: template,
  dialogMock: dialog,
  // resets all the mocks ready for a new test
  resetMocks: function () {
    var mocks = [
      [HtmlService.createTemplateFromFile, template],
      [template.evaluate, dialog],
      [dialog.setWidth, dialog],
      [dialog.setHeight, dialog],
      [dialog.setSandboxMode, dialog]
    ];
    mocks.forEach((pair) => {
      pair[0].mockReset();
      pair[0].mockImplementation(() => pair[1]);
    });
  },
}

HtmlService.resetMocks();

module.exports = HtmlService;