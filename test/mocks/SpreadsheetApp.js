Spreadsheet = require('./Spreadsheet');

var ADDONMENU = {
  addItem : jest.fn().mockImplementation(()=> ADDONMENU),
  addSeparator : jest.fn().mockImplementation(()=> ADDONMENU),
  addToUi : jest.fn().mockImplementation(()=> ADDONMENU)
}
var UI = {
  createAddonMenu : jest.fn().mockImplementation(()=> ADDONMENU),
  showModalDialog : jest.fn()
}

var SpreadsheetApp = {
  getUi: jest.fn().mockImplementation(() => UI),

  getActiveSpreadsheet: jest.fn().mockImplementation(() => Spreadsheet),

  resetMocks: function() {
    mocks = [
      [SpreadsheetApp.getUi,UI],
      [SpreadsheetApp.getActiveSpreadsheet, Spreadsheet],
      [UI.createAddonMenu,ADDONMENU],
      [ADDONMENU.addItem,ADDONMENU],
      [ADDONMENU.addSeparator,ADDONMENU],
      [ADDONMENU.addToUi,ADDONMENU]
    ];
    mocks.forEach((pair)=> {
      pair[0].mockReset();
      pair[0].mockImplementation(() => pair[1] );
    })
  }  
}

module.exports = SpreadsheetApp;
