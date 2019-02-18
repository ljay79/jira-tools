
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

var SpreadsheetApp = {
  getUi: jest.fn().mockImplementation(() => UI ),
  resetMocks: function() {
    mocks = [
      [SpreadsheetApp.getUi,UI],
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
