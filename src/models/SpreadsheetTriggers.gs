
/**
 * Centralized handler to register/install spreadsheet triggers 
 * while ensuring no duplicated triggers are registered.
 */
var SpreadsheetTriggers_ = {

  /**
   * Get a installed Spreadsheet trigger if exists.
   * @param {string} handlerFunction    The Trigger handler function name
   * @return {Trigger|object|FALSE}   Returns the found trigger or false if not found
   */
  get: function(handlerFunction) {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === handlerFunction) {
        return triggers[i];
      }
    }

    return false;
  },

  /**
   * Register/Install new Spreadsheet trigger to current active spreadsheet.
   * If already installed, it will be ignore unless param {reinstall} is set to true.
   * @see: https://developers.google.com/apps-script/reference/script/spreadsheet-trigger-builder
   * @param {string} event    Spreadsheet trigger event ['onChange', 'onEdit', 'onFormSubmit', 'onOpen']
   * @param {string} handlerFunction    The Trigger handler function name
   * @param {string} reinstall    Default:false; Shall existing trigger be overwritten/reset or not.
   * @return {Trigger|object}   Returns the trigger object
   * @throws Error
   */
  register: function(event, handlerFunction, reinstall) {
    reinstall = reinstall || false;
    var _events = ['onChange', 'onEdit', 'onFormSubmit', 'onOpen'];

    // check for proper event "onXXX"
    if( _events.indexOf(event) === -1 ) {
      throw new Error("{event} has a not supported. Value must be one of: " + _events.join(','));
    }

    var _trigger = this.get(handlerFunction);

    if( _trigger !== false && reinstall === false ) {
      // Trigger already registered and reinstall not requested, return trigger
      return _trigger;
    }

    if( _trigger !== false && reinstall === true ) {
      // Trigger already registered BUT reinstall requested
      this.deleteTrigger(handlerFunction);
    }

    var sheet = SpreadsheetApp.getActive();
    var _newTrigger = ScriptApp.newTrigger(handlerFunction).forSpreadsheet(sheet);

    switch(event) {
      case 'onChange':
        _newTrigger.onChange();
        break;
      case 'onEdit':
        _newTrigger.onEdit();
        break;
      case 'onFormSubmit':
        _newTrigger.onFormSubmit();
        break;
      case 'onOpen':
        _newTrigger.onOpen();
        break;
    }

    _trigger = _newTrigger.create();

    return _trigger;
  },

  /**
   * Deletes a trigger based on Function Name.
   * @param {string} handlerFunction    The Trigger handler function name
   * @return SpreadsheetTriggers_
   */
  deleteTrigger: function(handlerFunction) {
    // Loop over all triggers.
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === handlerFunction) {
        // delete found trigger
        ScriptApp.deleteTrigger(triggers[i]);
        break;
      }
    }

    return this;
  }

};


// Node required code block
module.exports = {
  SpreadsheetTriggers_: SpreadsheetTriggers_
};
// End of Node required code block
