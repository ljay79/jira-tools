const utils = require('../utils');

/*
 * Mocking GAS Sheet Class
 * https://developers.google.com/apps-script/reference/spreadsheet/sheet
 */
var randNum = utils._randomNum(10, 100);

var Range = {
    getValues: jest.fn().mockImplementation(() => {
      return [];
    }),
   getA1Notation: jest.fn().mockImplementation(() => {
     return 'A1Notation';
   }),
};

var Sheet = {
  // Returns the ID of the sheet represented by this object
  getSheetId: jest.fn().mockImplementation(() => {
    return '5123456789' + randNum;
  }),
  // Gets the position of the sheet in its parent spreadsheet. Starts at 1.
  getIndex: jest.fn().mockImplementation(() => {
    // random int between 1 and 10
    return utils._randomNum(1, 10);
  }),
  // Returns the name of the sheet
  getName: jest.fn().mockImplementation(() => {
    return 'SheetName 0' + utils._randomNum(1, 10);
  }),

  getActiveRange: jest.fn().mockImplementation(() => Range),
  getActiveCell: jest.fn().mockImplementation(() => Range)
}

/*
 * Mocking GAS Spreadsheet Class
 * https://developers.google.com/apps-script/reference/spreadsheet
 */
var Spreadsheet = {
  getActiveSheet: jest.fn().mockImplementation(() => Sheet),

  //Return array of Sheet's
  getSheets : jest.fn().mockImplementation(() => {
    return [Sheet, Sheet];
  }),

  // Gets a unique identifier for this spreadsheet.
  getId: jest.fn().mockImplementation(() => {
    return utils._randomId(20, 25);
  })
}

module.exports = Spreadsheet;
