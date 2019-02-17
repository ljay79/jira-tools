function testTable1() {
  console.log('testTable1()');

  SpreadsheetTriggers_.register('onChange', 'onChangeTableMeta');
  console.log('---------------------------------------------------');
  SpreadsheetTriggers_.register('onChange', 'onChangeTableMeta');
  console.log('---------------------------------------------------');
  SpreadsheetTriggers_.register('onChange', 'onChangeTableMeta', true);
  console.log('---------------------------------------------------');
  
}

function onChangeTableMeta(e) {
  console.log('onChangeTableMeta(): %s', e);
}
