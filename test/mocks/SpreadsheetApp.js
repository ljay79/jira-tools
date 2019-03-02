
var ADDONMENU = {
  addItem : jest.fn().mockImplementation(()=> ADDONMENU),
  addSeparator : jest.fn().mockImplementation(()=> ADDONMENU),
  addToUi : jest.fn().mockImplementation(()=> ADDONMENU)
}
var UI = {
  createAddonMenu : jest.fn().mockImplementation(()=> ADDONMENU),
  showSidebar: jest.fn(),
  showModalDialog : jest.fn()
}

var SPREADSHEET = {
  getActiveSheet: jest.fn()
}
var SHEET = {
  getActiveRange: jest.fn()
}

var SHEETRANGE = {
  getValues: jest.fn()
}

var SpreadsheetApp = {
  getUi: jest.fn().mockImplementation(() => UI ),
  getActiveSpreadsheet: jest.fn().mockImplementation(() => SPREADSHEET ),
  resetMocks: function() {
    mocks = [
      [SpreadsheetApp.getUi,UI],
      [UI.createAddonMenu,ADDONMENU],
      [ADDONMENU.addItem,ADDONMENU],
      [ADDONMENU.addSeparator,ADDONMENU],
      [ADDONMENU.addToUi,ADDONMENU],
      [SpreadsheetApp.getActiveSpreadsheet,SPREADSHEET],
      [SPREADSHEET.getActiveSheet, SHEET],
      [SHEET.getActiveRange, SHEETRANGE]
    ];
    mocks.forEach((pair)=> {
      pair[0].mockReset();
      pair[0].mockImplementation(() => pair[1] );
    })
  }  
}
SpreadsheetApp.resetMocks();


module.exports = SpreadsheetApp;
