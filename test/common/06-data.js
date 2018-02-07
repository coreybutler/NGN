const test = require('tape')
const TaskRunner = require('shortbus')

// Remember to run `npm run test:build` before executing,
// otherwise the lib directory will not exist.

require('../lib/core')
require('../lib/eventemitter')
require('../lib/utility/bootstrap')
require('../lib/tasks/bootstrap')
require('../lib/net/bootstrap')
require('../lib/data/bootstrap')

NGN.BUS.on(NGN.WARNING_EVENT, function (msg) {
  console.log('\n\n\n\n:::WARNING:::', msg)
})

test('Data Sanity Checks', function (t) {
  t.ok(typeof NGN.DATA === 'object', 'NGN.DATA exists as an object/namespace.')
  t.ok(typeof NGN.DATA.UTILITY === 'function', 'NGN.DATA.UTILITY exists as singleton class.')
  t.ok(typeof NGN.DATA.TransactionLog === 'function', 'NGN.DATA.TransactionLog exists as a class.')
  t.ok(typeof NGN.DATA.Rule === 'function', 'NGN.DATA.Rule exists as a class.')
  t.ok(typeof NGN.DATA.RangeRule === 'function', 'NGN.DATA.RangeRule exists as a class.')
  t.ok(typeof NGN.DATA.Field === 'function', 'NGN.DATA.Field exists as a class.')
  t.ok(typeof NGN.DATA.VirtualField === 'function', 'NGN.DATA.VirtualField exists as a class.')
  t.ok(typeof NGN.DATA.Relationship === 'function', 'NGN.DATA.Relationship exists as a class.')
  t.ok(typeof NGN.DATA.FieldMap === 'function', 'NGN.DATA.FieldMap exists as a class.')
  t.ok(typeof NGN.DATA.Entity === 'function', 'NGN.DATA.Entity exists as a class.')
  t.ok(typeof NGN.DATA.Model === 'function', 'NGN.DATA.Model exists as a class.')
  t.ok(typeof NGN.DATA.Index === 'function', 'NGN.DATA.Index exists as a class.')
  t.ok(typeof NGN.DATA.Store === 'function', 'NGN.DATA.Store exists as a class.')
  t.ok(typeof NGN.DATA.BTree === 'function', 'NGN.DATA.BTree exists as a class.')
  t.ok(typeof NGN.DATA.JSONSchema === 'function', 'NGN.DATA.JSONSchema exists as a class.')
  t.end()
})

test('JSON Schema', function (t) {
  var schema = new NGN.DATA.JSONSchema('http://json.schemastore.org/project')
  // var schema = new NGN.DATA.JSONSchema('http://json-schema.org/example/calendar.json')

  schema.getModelDefinitions(definitions => {
    console.log(definitions[0])
    console.log('\n\n\n==========\n\n\n')
    console.log(definitions[1])
    // console.log(JSON.stringify(definitions, null, 2))
    t.end()
  })
})

// test('NGN.DATA.UTILITY', function (t) {
//   var data = {
//     a: 1,
//     b: true,
//     c: 'three'
//   }
//
//   // Data Serialization
//   var originalData = Object.assign({}, data)
//
//   data[Symbol('test')] = 'symbol'
//   data.fn = function () {}
//   data = NGN.DATA.UTILITY.serialize(data)
//
//   t.ok(JSON.stringify(data) === JSON.stringify(originalData), 'Serialization returns an object stripped of functions.')
//
//   data.d = /^s.*/
//   originalData.d = '/^s.*/'
//
//   t.ok(JSON.stringify(NGN.DATA.UTILITY.serialize(data)) === JSON.stringify(originalData), 'Serialization returns an object with proper RegEx conversion (to string).')
//
//   var dt = new Date(2000, 0, 1, 0, 0, 0)
//
//   data.d = dt
//   originalData.d = dt.toISOString()
//   t.ok(JSON.stringify(NGN.DATA.UTILITY.serialize(data)) === JSON.stringify(originalData), 'Serialization returns an object with proper date conversion (to ISO string).')
//
//   delete data.d
//
//   // Checksum Creation
//   t.ok(NGN.DATA.UTILITY.checksum(data) === 1627578237, 'Checksum calculates for an object.')
//
//   // UUID
//   t.ok(/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}/i.test(NGN.DATA.UTILITY.UUID()), 'UUID() returns a properly formatted identifier.')
//
//   // GUID
//   t.ok(/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}/i.test(NGN.DATA.UTILITY.GUID()), 'GUID() returns a properly formatted identifier.')
//
//   // Data Diffing
//   var left = {
//     a: 1,
//     b: true,
//     c: 'three',
//     nested: {
//       element: 'is here',
//       and: 'here'
//     }
//   }
//
//   var right = {
//     a: 1,
//     b: false,
//     nested: {
//       element: 'is here',
//       and: 'there'
//     },
//     x: {
//       y: 'new value'
//     }
//   }
//
//   console.log(NGN.DATA.UTILITY.diff(left, right))
//
//   t.end()
// })
//
// test('NGN.DATA.TransactionLog', function (t) {
//   var log = new NGN.DATA.TransactionLog()
//
//   log.funnel(['advance', 'rollback', 'reset', 'commit'], 'done')
//
//   t.ok(log.cursor === null, 'Initialize with null cursor.')
//   t.ok(log.getCommit() === undefined, 'Fails to return a commit when none exist.')
//
//   log.advance()
//   log.rollback()
//   t.ok(log.cursor === null, 'Advancing and rolling back on an empty log does nothing.')
//
//   var ida = log.commit('a')
//   t.ok(typeof ida === 'symbol', 'Committing an entry generates an ID.')
//   t.ok(log.getCommit(ida).value === 'a', 'Retrieving a record by ID returns a transaction object.')
//
//   var idb = log.commit('b')
//   var idc = log.commit('c')
//   var idd = log.commit('d')
//   var ide = log.commit('e')
//
//   t.ok(log.length === 5, 'Correct number of logs committed.')
//   t.ok(log.cursor === ide, 'Cursor successfully advances with each commit.')
//
//   log.rollback()
//   t.ok(log.cursor === idd, 'Default rollback moves cursor back one index.')
//   t.ok(log.cursorIndex === 3, 'Proper cursor index number retrieved.')
//   t.ok(log.currentValue === 'd', 'Proper cursor value returned for currentValue.')
//
//   log.rollback(2)
//   t.ok(log.cursor === idb, 'Multistep rollback moves cursor back appropriately.')
//
//   log.once('advance', function (data) {
//     t.ok(typeof data === 'symbol', 'Advance event triggered with ID.')
//   })
//
//   log.once('commit', function (data) {
//     t.ok(typeof data === 'symbol', 'Log event triggered with ID.')
//   })
//
//   log.once('rollback', function (data) {
//     t.ok(typeof data === 'symbol', 'Rollback event triggered with ID.')
//   })
//
//   log.advance()
//   t.ok(log.cursor === idc, 'Default advance moves cursor forward one index.')
//
//   log.advance(2)
//   t.ok(log.cursor === ide, 'Multistep advance moves cursor forward appropriately.')
//
//   log.rollback(-1)
//   t.ok(log.cursor === ide, 'Negative rollback ignored.')
//
//   log.advance(-1)
//   t.ok(log.cursor === ide, 'Negative advance ignored.')
//
//   log.rollback(10)
//   t.ok(log.cursor === ida, 'Rollback limited to beginning of log.')
//
//   log.advance(100)
//   t.ok(log.cursor === ide, 'Advance limited to end of log.')
//
//   log.rollback(2)
//   var idf = log.commit('f')
//
//   t.ok(log.length === 4, 'Committing after rollback contains correct number of entries.')
//   t.ok(log.cursor === idf, 'Commit returns latest cursor.')
//
//   log.rollback()
//   log.flush()
//   log.advance()
//   t.ok(log.length === 3 && log.cursor === idc, 'Flush removes correct entries.')
//
//   t.ok(log.log.length === 3, 'Correctly generates an array-based log/report.')
//
//   log.once('done', function () {
//     t.ok(log.length === 0, 'Reset clears the log.')
//
//     log = new NGN.DATA.TransactionLog(3)
//
//     log.commit('aa')
//     log.commit('bb')
//     let idcc = log.commit('cc')
//     log.commit('dd')
//     log.commit('ee')
//     log.rollback(10)
//
//     t.ok(log.cursor === idcc, 'Max entries supported with LIFO pattern.')
//
//     t.end()
//   })
//
//   log.reset()
// })
//
// test('NGN.DATA.Rule', function (t) {
//   var rule = new NGN.DATA.Rule('test')
//
//   t.ok(rule.type === 'string', 'Correctly identifies a string-based exact-match rule.')
//   t.ok(rule.test('test'), 'Exact match string passes string validation.')
//   t.ok(!rule.test('testing'), 'Different text fails exact match string validation.')
//
//   rule = new NGN.DATA.Rule(10)
//
//   t.ok(rule.type === 'number', 'Correctly identifies a number-based exact-match rule.')
//   t.ok(rule.test(10), 'Exact match number passes string validation.')
//   t.ok(!rule.test(11), 'Different number fails exact match number validation.')
//
//   rule = new NGN.DATA.Rule(true)
//
//   t.ok(rule.type === 'boolean', 'Correctly identifies a boolean-based exact-match rule.')
//   t.ok(rule.test(true), 'Exact match value passes boolean validation.')
//   t.ok(!rule.test(false), 'Different value fails exact match boolean validation.')
//
//   rule = new NGN.DATA.Rule(/^a.*/gi)
//
//   t.ok(rule.type === 'regexp', 'Correctly identifies a regular express-based rule.')
//   t.ok(rule.test('alpha'), 'Pattern match passes RegEx validation.')
//   t.ok(!rule.test('beta'), 'Different pattern fails RegeEx validation.')
//
//   rule = new NGN.DATA.Rule(['a', 1, true])
//
//   t.ok(rule.type === 'array', 'Correctly identifies enumeration rule.')
//   t.ok(rule.test(1), 'Included value match passes enumeration validation.')
//   t.ok(!rule.test(false), 'Different value fails enumeration validation.')
//
//   rule = new NGN.DATA.Rule((value) => {
//     return value === 'another test'
//   })
//
//   t.ok(rule.type === 'function', 'Correctly identifies custom function rule.')
//   t.ok(rule.test('another test'), 'Valid value passes custom validation.')
//   t.ok(!rule.test('bob'), 'Invalid value fails custom validation.')
//
//   t.end()
// })
//
// test('NGN.DATA.RangeRule', function (t) {
//   var rule = new NGN.DATA.RangeRule('rangetest', [
//     [null, -50],
//     [-10, -5],
//     [10, 20],
//     ['25->50'],
//     ['100->null']
//   ])
//
//   t.ok(rule.range.length === 5, 'Correct number of ranges created.')
//   t.ok(!rule.test(0), 'Number outside of range is flagged as invalid.')
//   t.ok(rule.test(150), 'Number within range is flagged as valid.')
//
//   rule.removeRange([null, -50])
//
//   t.ok(rule.range.length === 4, 'Correct number of ranges detected after removal.')
//   t.ok(!rule.test(-75), 'Test fails after validation range is removed.')
//
//   rule.addRange([-70, -60])
//   t.ok(rule.range.length === 5, 'Correct number of rules detected after adding new one.')
//   t.ok(rule.test(-65), 'Validation succeeds after new range is added.')
//
//   rule.range = [1, 5]
//   t.ok(rule.range.length === 1, 'Resetting the range yields correct number of ranges.')
//   t.ok(rule.test(3) && !rule.test(10), 'Correctly validates using new rule range.')
//
//   t.end()
// })
//
// test('NGN.DATA.Field (Standard String Field)', function (t) {
//   var field = new NGN.DATA.Field('testfield')
//
//   t.ok(field.type === 'string', 'String by default.')
//   t.ok(field.fieldType === 'data', 'Recognized as a standard data field.')
//   t.ok(!field.required, 'Not required by default.')
//   t.ok(field.value === null, 'Null by default.')
//   t.ok(!field.hidden, 'Not hidden by default.')
//   t.ok(!field.virtual, 'Not virtual by default.')
//   t.ok(!field.identifier, 'Not an identifier by default.')
//   t.ok(field.name === 'testfield', 'Recognized name of the field.')
//   t.ok(field.isNew, 'Field is recognized as new by default.')
//
//   field.required = 1
//   t.ok(field.required, 'Field can be manually set to be required after initial configuration.')
//
//   field.value = 'test value'
//   t.ok(field.value === 'test value', 'Setting a value reflects the appropriate value.')
//   t.ok(!field.modified, 'Field is not considered modified on the initial value set.')
//
//   field.disallowInvalid()
//   t.throws(() => { field.value = 1 }, 'Invalid value throws an error.')
//
//   field.value = 'changed'
//   t.ok(field.modified, 'Modification recognizes alterations as a change.')
//
//   // Test events
//   var tasks = new TaskRunner()
//
//   tasks.add('Hide Field', function (next) {
//     field.once('hidden', function () {
//       t.ok(field.hidden, 'Hiding field triggers an event and successfully updates the "hidden" flag.')
//       next()
//     })
//
//     field.hide()
//   })
//
//   tasks.add('Unhide Field', function (next) {
//     field.once('unhidden', function () {
//       t.ok(!field.hidden, 'Unhiding field triggers an event and successfully updates the "hidden" flag.')
//       next()
//     })
//
//     field.unhide()
//   })
//
//   tasks.add('Modification triggers update event.', function (next) {
//     field.once('update', function () {
//       t.ok(field.modified, 'Modification reflects recognizes update.')
//       next()
//     })
//
//     field.value = 'different'
//   })
//
//   tasks.add('Custom Rules', function (next) {
//     field = new NGN.DATA.Field({
//       name: 'testingField',
//       type: String,
//       rules: function (value) {
//         return value === 'ok'
//       },
//       allowInvalid: true
//     })
//
//     field.value = 'ok'
//     t.ok(field.valid, 'Configured custom rule validates correctly.')
//
//     field.value = 'not ok'
//     t.ok(!field.valid, 'Configured custom rule invalidates correctly.')
//
//     field = new NGN.DATA.Field({
//       name: 'testField',
//       type: String,
//       rules: [
//         function (value) {
//           return /^o.*/.test(value)
//         },
//         function (value) {
//           return value === 'ok' || value === 'ok already!'
//         }
//       ],
//       allowInvalid: true
//     })
//
//     field.value = 'ok'
//     t.ok(field.valid, 'Configured custom rule set 1 validates correctly.')
//
//     field.value = 'ok already!'
//     t.ok(field.valid, 'Configured custom rule set 2 validates correctly.')
//
//     field.value = 'not ok'
//     t.ok(!field.valid, 'Configured custom rule set 1 invalidates correctly.')
//
//     field.value = 'okie dokie'
//     t.ok(!field.valid, 'Configured custom rule set 2 invalidates correctly.')
//
//     next()
//   })
//
//   tasks.on('complete', t.end)
//
//   tasks.run(true)
// })
//
// test('NGN.DATA.Field (Pattern String Field)', function (t) {
//   var field = new NGN.DATA.Field({
//     name: 'testfield',
//     type: String,
//     pattern: /^X.*/
//   })
//
//   t.ok(field.METADATA.rules.length === 2, 'Pattern match configured as part of the validation rules.')
//
//   field.value = 'X-test'
//   t.ok(field.valid, 'Proper value passes pattern match test.')
//
//   field.value = 'problemX'
//   t.ok(field.valid === false, 'Proper value fails pattern match test.')
//
//   t.end()
// })
//
// test('NGN.DATA.Field (Enumeration)', function (t) {
//   var field = new NGN.DATA.Field({
//     name: 'enumfield',
//     type: String,
//     enum: [
//       'a',
//       'b'
//     ],
//     allowInvalid: true
//   })
//
//   t.ok(field.METADATA.rules.length === 2, 'Enumeration match configured as part of the validation rules.')
//
//   field.value = 'b'
//   t.ok(field.valid, 'A value within the enumeration set is marked as valid.')
//
//   field.value = 'x'
//   t.ok(!field.valid, 'A value outside the enumeration set is marked as invalid.')
//
//   t.end()
// })
//
// test('NGN.DATA.Field (Rejected Values)', function (t) {
//   var field = new NGN.DATA.Field({
//     name: 'enumfield',
//     type: String,
//     not: [
//       'a',
//       'b'
//     ],
//     allowInvalid: true
//   })
//
//   t.ok(field.METADATA.rules.length === 2, 'Rejection match configured as part of the validation rules.')
//
//   field.value = 'b'
//   t.ok(!field.valid, 'A value within the enumeration set is marked as invalid.')
//
//   field.value = 'x'
//   t.ok(field.valid, 'A value outside the enumeration set is marked as valid.')
//
//   t.end()
// })
//
// test('NGN.DATA.Field (Number Field)', function (t) {
//   var field = new NGN.DATA.Field({
//     name: 'testfieldnumber',
//     type: Number,
//     range: [
//       [null, -50],
//       [-10, -5],
//       [10, 20],
//       ['25->50'],
//       ['100->null']
//     ],
//     autocorrectInput: true
//   })
//
//   t.ok(field.type === 'number', 'Correctly recognized number value.')
//   t.ok(field.fieldType === 'data', 'Recognized as a standard data field.')
//   t.ok(!field.required, 'Not required by default.')
//   t.ok(field.value === null, 'Null by default.')
//   t.ok(!field.hidden, 'Not hidden by default.')
//   t.ok(!field.virtual, 'Not virtual by default.')
//   t.ok(!field.identifier, 'Not an identifier by default.')
//   t.ok(field.name === 'testfieldnumber', 'Recognized name of the field.')
//   t.ok(field.isNew, 'Field is recognized as new by default.')
//
//   field.value = 0
//   t.ok(!field.valid, 'Number outside of range is flagged as invalid.')
//
//   field.value = 150
//   t.ok(field.valid, 'Number inside range is flagged as valid.')
//
//   field.value = '-3'
//   t.ok(field.value === -3 && !field.valid, 'Autocorrected input yields appropriate result.')
//
//   try {
//     field = new NGN.DATA.Field({
//       name: 'testfieldnumber',
//       type: Number,
//       range: [50, 10]
//     })
//
//     t.fail('Allowed to set a min/max range where max is less than min')
//   } catch (e) {
//     t.pass('Do not allow a min/max range where max is less than min.')
//   }
//
//   field = new NGN.DATA.Field({
//     name: 'testfieldnumber',
//     type: Number,
//     min: 10
//   })
//
//   field.value = 5
//   t.ok(!field.valid, 'Value below minimum is invalid.')
//
//   field.value = 10
//   t.ok(field.valid, 'Value at minimum is valid.')
//
//   field = new NGN.DATA.Field({
//     name: 'testfieldnumber',
//     type: Number,
//     max: 10
//   })
//
//   field.value = 15
//   t.ok(!field.valid, 'Value above maximum is invalid.')
//
//   field.value = 10
//   t.ok(field.valid, 'Value at maximum is valid.')
//
//   field = new NGN.DATA.Field({
//     name: 'testfieldnumber',
//     type: Number,
//     min: 1,
//     max: 10
//   })
//
//   field.value = 15
//   t.ok(!field.valid, 'Value above minimum/maximum threshold is invalid.')
//
//   field.value = 0
//   t.ok(!field.valid, 'Value below minimum/maximum threshold is invalid.')
//
//   field.value = 5
//   t.ok(field.valid, 'Value in minimum/maximum threshold is valid.')
//
//   // Multiples
//   field = new NGN.DATA.Field({
//     name: 'testfieldnumber',
//     type: Number,
//     multipleOf: 10
//   })
//
//   field.value = 100
//   t.ok(field.valid, 'Positive value matching a multipleOf constraint is valid.')
//
//   field.value = -100
//   t.ok(field.valid, 'Negative value matching a multipleOf constraint is valid.')
//
//   field.value = 101
//   t.ok(!field.valid, 'A value outside of a specified multiple is not valid.')
//
//   t.end()
// })
//
// test('NGN.DATA.Field (Array Field)', function (t) {
//   var field = new NGN.DATA.Field({
//     name: 'testfield',
//     type: Array,
//     min: 1,
//     max: 5,
//     listType: Number
//   })
//
//   field.value = [1, 2, 3]
//   t.ok(field.valid, 'Acceptable array is valid.')
//
//   field.value = []
//   t.ok(!field.valid, 'Array with too few items is invalid.')
//
//   field.value = [1, 2, 3, 4, 5, 6]
//   t.ok(!field.valid, 'Array with too many items is invalid.')
//
//   field.value = [1, 2, 3, 'no']
//   t.ok(!field.valid, 'Array that violates listType is invalid.')
//
//   field = new NGN.DATA.Field({
//     name: 'testfield',
//     type: Array,
//     tuples: [{
//       type: Number
//     }, {
//       enum: ['a', 'b']
//     }]
//   })
//
//   field.value = [1, 'a', 1, 2, 3, 4]
//   t.ok(field.valid, 'Array matching tuples is valid.')
//
//   field.value = ['test', 'a']
//   t.ok(!field.valid, 'Array violating tuples type is invalid.')
//
//   field.value = [1, 'c']
//   t.ok(!field.valid, 'Array violating tuples enum is invalid.')
//
//   t.end()
// })
//
// test('NGN.DATA.Field (Multitype Field)', function (t) {
//   var field = new NGN.DATA.Field({
//     name: 'testfield',
//     type: [String, Number]
//   })
//
//   field.value = 'X-test'
//   t.ok(field.valid, 'Acceptable data type value passes data type validation.')
//
//   field.value = 5
//   t.ok(field.valid, 'Acceptable alternative data type value passes data type validation.')
//
//   field.value = true
//   t.ok(field.valid === false, 'Unacceptable data type value fails data type validation.')
//
//   t.end()
// })
//
// test('NGN.DATA.Field Basic Auditing (Changelog)', function (t) {
//   var field = new NGN.DATA.Field({
//     name: 'test',
//     audit: true
//   })
//
//   field.value = 'a'
//   field.value = 'b'
//   field.value = 'c'
//   field.value = 'd'
//   field.value = 'e'
//
//   field.undo()
//   t.ok(field.value === 'd', 'Basic undo rolls back one change.')
//
//   field.redo()
//   t.ok(field.value === 'e', 'Basic redo advances one change.')
//
//   field.undo(3)
//   t.ok(field.value === 'b', 'Multistep rollback quietly updates value.')
//
//   field.redo(3)
//   t.ok(field.value === 'e', 'Multistep redo quietly updates value.')
//
//   field.undo(2)
//   field.value = 'f'
//   t.ok(field.METADATA.AUDITLOG.length === 4, 'Correctly truncated newer values.')
//   t.ok(field.METADATA.AUDITLOG.currentValue === 'f', 'Correctly advanced cursor.')
//
//   field.undo()
//   t.ok(field.value === 'c', 'Correctly reverted value after committing change.')
//
//   field.redo(10)
//   t.ok(field.value === 'f', 'Correctly advanced value after committing change.')
//
//   t.end()
// })
//
// test('NGN.DATA.Field Transformations', function (t) {
//   var field = new NGN.DATA.Field({
//     name: 'testfield',
//     default: 'none',
//     transformer: function (input) {
//       return input + '_test'
//     }
//   })
//
//   t.ok(field.value === 'none', 'Transformation does not affect default value.')
//
//   field.value = 'a'
//   t.ok(field.value === 'a_test', 'Transformation successfully applied to input.')
//
//   t.end()
// })
//
// test('NGN.DATA.VirtualField', function (t) {
//   var field = new NGN.DATA.VirtualField({
//     scope: {
//       multiplier: 3
//     },
//     method: function () {
//       return 5 * this.multiplier
//     }
//   })
//
//   t.ok(field.value === 15, 'Generated correct value.')
//   t.ok(!field.hidden, 'Not hidden by default.')
//
//   field.value = 'nothing'
//   t.ok(field.value === 15, 'Generated correct value after attempting to set value.')
//
//   field.hidden = true
//   t.ok(field.hidden, 'Hidden by request.')
//
//   t.end()
// })
//
// // Common data
// var Meta = function () {
//   return {
//     name: 'metamodel',
//     idField: 'testid',
//
//     fields: {
//       firstname: null,
//       lastname: null,
//       val: {
//         min: 10,
//         max: 20,
//         default: 15
//       },
//       testid: null,
//       virtual: function () {
//         return 'test ' + this.val
//       }
//     }
//   }
// }
//
// test('NGN.DATA.Relationship (Single Model)', function (t) {
//   var Model = new NGN.DATA.Model(Meta())
//   var field = new NGN.DATA.Relationship({
//     audit: true,
//     name: 'test',
//     join: Model
//   })
//
//   t.ok(field.value instanceof NGN.DATA.Entity, 'Correctly returns the nested model.')
//
//   field.value.firstname = 'John'
//   field.value.lastname = 'Doe'
//   field.value.firstname = 'Jill'
//
//   field.undo()
//   t.ok(field.value.firstname === 'John' && field.value.lastname === 'Doe', 'Undo operation yields prior value.')
//
//   field.redo()
//   t.ok(field.value.firstname === 'Jill' && field.value.lastname === 'Doe', 'Redo operation yields next value.')
//
//   field.undo(2)
//   t.ok(field.value.firstname === 'John' && field.value.lastname === null, 'Multiple undo operation yields appropriate value.')
//
//   field.redo(2)
//   t.ok(field.value.firstname === 'Jill' && field.value.lastname === 'Doe', 'Multiple redo operation yields appropriate value.')
//
//   t.ok(field.value.changelog.length === 3, 'Proper changelog length.')
//
//   t.end()
// })
//
// test('NGN.DATA.Model Field Mapping', function (t) {
//   // TODO: Convert this to use the DiffEngine instead of JSON.stringify comparison
//   var map = {
//     father: 'pa',
//     mother: 'ma',
//     brother: 'bro',
//     sister: 'sis',
//     invalid: function () {}
//   }
//
//   var inverse = {
//     pa: 'father',
//     ma: 'mother',
//     bro: 'brother',
//     sis: 'sister'
//   }
//
//   var fieldMap = new NGN.DATA.FieldMap(map)
//
//   delete map.invalid
//
//   t.ok(JSON.stringify(fieldMap.map) === JSON.stringify(map), 'Map created while removing invalid items.')
//   t.ok(JSON.stringify(fieldMap.inverse) === JSON.stringify(inverse), 'Inverse map created while removing invalid items.')
//
//   var result = fieldMap.applyMap({
//     pa: 'John',
//     ma: 'Jill',
//     bro: 'Joe',
//     sis: 'Jane'
//   })
//
//   var expectedResult = {
//     father: 'John',
//     mother: 'Jill',
//     brother: 'Joe',
//     sister: 'Jane'
//   }
//
//   t.ok(JSON.stringify(result) === JSON.stringify(expectedResult), 'Applied map to data correctly.')
//
//   result = fieldMap.applyInverseMap({
//     father: 'John',
//     mother: 'Jill',
//     brother: 'Joe',
//     sister: 'Jane'
//   })
//
//   var expectedInvertedResult = {
//     pa: 'John',
//     ma: 'Jill',
//     bro: 'Joe',
//     sis: 'Jane'
//   }
//
//   t.ok(JSON.stringify(result) === JSON.stringify(expectedInvertedResult), 'Applied inverted map to data correctly.')
//
//   t.end()
// })
//
// test('NGN.DATA.Model', function (t) {
//   var tasks = new TaskRunner()
//   var Person
//   var p
//
//   tasks.add('Create model', function (next) {
//     Person = new NGN.DATA.Model(Meta())
//     t.ok(typeof Person === 'function', 'Model creation works.')
//     next()
//   })
//
//   tasks.add('Create record', function (next) {
//     p = new Person()
//
//     t.ok(p !== undefined, 'Model instantiation works.')
//     t.ok(p.METADATA.name === 'metamodel', 'Model has a custom name.')
//
//     t.ok(
//       p.METADATA.knownFieldNames.has('firstname') &&
//       p.METADATA.knownFieldNames.has('lastname') &&
//       p.METADATA.knownFieldNames.has('val') &&
//       p.METADATA.knownFieldNames.has('testid') &&
//       p.METADATA.knownFieldNames.has('virtual') &&
//       !p.METADATA.knownFieldNames.has('not_a_field'),
//       'Recognized all field names'
//     )
//
//     t.ok(p.getField('firstname').type === 'string', 'Properly unconfigured field as string.')
//     t.ok(p.getField('val').type === 'number', 'Autoidentify data type.')
//
//     t.ok(p.virtual === 'test 15', 'Virtual field successfully generated value.')
//
//     next()
//   })
//
//   tasks.add('Modify Record', function (next) {
//     p.once('field.update', function (change) {
//       t.ok(change.field.name === 'firstname', 'Event fired for data change.')
//       t.ok(!change.old, 'Old value recognized.')
//       t.ok(change.new === 'Corey', 'New value recognized.')
//
//       next()
//     })
//
//     p.firstname = 'Corey'
//   })
//
//   tasks.add('Field Creation', function (next) {
//     p.once('field.create', function (field) {
//       t.ok(field instanceof NGN.DATA.Field, 'Emitted the field in the payload.')
//       t.ok(field.name === 'middle', 'Proper field name recognized in emitted payload.')
//       t.ok(p.hasOwnProperty('middle'), 'Model contains new field as a getter/setter.')
//
//       next()
//     })
//
//     p.addField('middle')
//   })
//
//   tasks.add('Field Removal', function (next) {
//     p.once('field.remove', function (field) {
//       t.ok(field instanceof NGN.DATA.Field, 'Emitted the field in the payload.')
//       t.ok(field.name === 'middle', 'Proper field name recognized in emitted payload.')
//       t.ok(!p.hasOwnProperty('middle'), 'Model no longer contains field as a getter/setter.')
//
//       next()
//     })
//
//     p.removeField('middle')
//   })
//
//   tasks.add('Data Serialization', function (next) {
//     t.ok(JSON.stringify(p.data) === '{"firstname":"Corey","lastname":null,"val":15,"testid":null}', 'Data serialized into JSON object.')
//     t.ok(JSON.stringify(p.representation) === '{"firstname":"Corey","lastname":null,"val":15,"testid":null,"virtual":"test 15"}', 'Representation serialized into JSON object.')
//
//     next()
//   })
//
//   tasks.add('Field Mapping', function (next) {
//     var cfg = Meta()
//
//     cfg.fieldmap = {
//       firstname: 'gn',
//       lastname: 'sn',
//       testid: 'someid',
//       invalid: function () {}
//     }
//
//     var Person = new NGN.DATA.Model(cfg)
//     var p = new Person({
//       gn: 'Joe',
//       sn: 'Dirt',
//       value: 17,
//       val: 16
//     })
//
//     t.ok(
//       p.firstname === 'Joe' &&
//       p.lastname === 'Dirt',
//       'Successfully loaded data using field mapping'
//     )
//     t.ok(p.val === 16, 'Skipped invalid mapping and used raw value.')
//
//     t.ok(JSON.stringify(p.data) === '{"val":16,"gn":"Joe","sn":"Dirt","someid":null}', 'Serialized output respects inverse data mappings.')
//     t.ok(JSON.stringify(p.unmappedData) === '{"firstname":"Joe","lastname":"Dirt","val":16,"testid":null}', 'Serialized unmapped output respects model fields.')
//     t.ok(JSON.stringify(p.representation) === '{"val":16,"virtual":"test 16","gn":"Joe","sn":"Dirt","someid":null}', 'Serialized representation output respects inverse data mappings.')
//     t.ok(JSON.stringify(p.unmappedRepresentation) === '{"firstname":"Joe","lastname":"Dirt","val":16,"testid":null,"virtual":"test 16"}', 'Serialized unmapped representation output respects model fields.')
//
//     next()
//   })
//
//   tasks.add('Automatic ID (Basic)', function (next) {
//     var cfg = Meta()
//
//     delete cfg.idField
//     delete cfg.fields.testid
//
//     cfg.autoid = true
//
//     var AutoModel = new NGN.DATA.Model(cfg)
//     var instance = new AutoModel()
//     var id = instance.id
//
//     t.ok(/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}/i.test(id), 'UUID generated for ID automatically.')
//
//     id = instance.id
//     t.ok(/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}/i.test(id), 'UUID remains consistend on each request.')
//
//     next()
//   })
//
//   tasks.add('Automatic ID (Custom Field)', function (next) {
//     var cfg = Meta()
//
//     cfg.autoid = true
//
//     var AutoModel = new NGN.DATA.Model(cfg)
//     var instance = new AutoModel()
//
//     t.ok(/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}/i.test(instance.testid), 'UUID generated for custom ID field automatically.')
//
//     next()
//   })
//
//   tasks.add('Automatic ID (Ignore)', function (next) {
//     var cfg = Meta()
//
//     cfg.autoid = true
//
//     var AutoModel = new NGN.DATA.Model(cfg)
//     var instance = new AutoModel({
//       testid: 'test'
//     })
//
//     t.ok(instance.id === 'test', 'Recognize ID when it is explicitly set (ignore autoID)')
//
//     next()
//   })
//
//   tasks.add('Expiration (TTL)', function (next) {
//     var cfg = new Meta()
//
//     cfg.expires = 600
//
//     var MetaModel = new NGN.DATA.Model(cfg)
//     var MetaRecord = new MetaModel({
//       firstname: 'John',
//       lastname: 'Doe'
//     })
//
//     MetaRecord.once('expire', function () {
//       t.pass('Record expiration event triggered using milliseconds.')
//
//       MetaRecord.once('expire', function () {
//         t.ok(MetaRecord.expired, 'Record is marked as expired.')
//         t.pass('Record expiration event triggered using future date.')
//         next()
//       })
//
//       MetaRecord.expires = new Date((new Date()).getTime() + 300)
//       t.ok(!MetaRecord.expired, 'Record is not expired if the expiration is reset.')
//     })
//   })
//
//   tasks.on('complete', t.end)
//
//   tasks.run(true)
// })
//
// test('NGN.DATA.Model Data Field Auditing (Changelog)', function (t) {
//   var config = Meta()
//   config.audit = true
//
//   var Model = new NGN.DATA.Model(config)
//   var m = new Model()
//
//   m.firstname = 'John'
//   m.lastname = 'Doe'
//   m.val = 17
//   m.id = '12345'
//
//   m.firstname = 'Jill'
//   m.lastname = 'Rey'
//
//   m.undo()
//   t.ok(m.firstname === 'Jill' && m.lastname === 'Doe', 'Undo rolls back a single change.')
//
//   m.undo()
//   t.ok(m.firstname === 'John' && m.lastname === 'Doe', 'Second undo rolls back another change (different fields).')
//
//   m.redo(2)
//   t.ok(m.firstname === 'Jill' && m.lastname === 'Rey', 'Redo advances the transaction log forward.')
//
//   m.undo(2)
//   m.firstname = 'Billy'
//   m.lastname = 'Bob'
//   m.undo(2)
//   t.ok(m.firstname === 'John' && m.lastname === 'Doe', 'Rollback limited to start of transaction log.')
//
//   m.redo(10)
//   t.ok(m.firstname === 'Billy' && m.lastname === 'Bob', 'Transaction log rewritten at appropriate location.')
//
//   t.end()
// })
//
// test('NGN.DATA.Model Virtual Field Caching', function (t) {
//   var Model = new NGN.DATA.Model(Meta())
//   var model = new Model()
//
//   t.ok(model.METADATA.fields.virtual.METADATA.caching === true, 'Caching enabled by default.')
//   t.ok(model.METADATA.fields.virtual.METADATA.cachedValue === model.METADATA.fields.virtual.METADATA.CACHEKEY, 'Cache is empty before first reference to virtual field.')
//
//   var throwAway = model.virtual
//   t.ok(throwAway === 'test 15' && model.METADATA.fields.virtual.METADATA.cachedValue === 'test 15', 'Cache is set after first reference to virtual field.')
//
//   // Wait for cache.clear event to complete the test.
//   model.funnelOnce(['field.cache.clear', 'done'], 'end.test')
//   model.once('end.test', function () {
//     t.pass('cache.clear event triggered.')
//     t.end()
//   })
//
//   model.val = 11
//   t.ok(model.virtual === 'test 11', 'Successfully cleared cache and returned updated value.')
//   t.ok(model.METADATA.fields.virtual.METADATA.cachedValue === 'test 11', 'Updated cache value.')
//
//   model.emit('done')
// })
//
// test('NGN.DATA.Index', function (t) {
//   var index = new NGN.DATA.Index()
//   var Model = new NGN.DATA.Model(Meta())
//   var records = [
//     new Model({ firstname: 'John', lastname: 'Doe' }),
//     new Model({ firstname: 'Jill', lastname: 'Doe' }),
//     new Model({ firstname: 'Jake', lastname: 'Doe' }),
//     new Model({ firstname: 'John', lastname: 'Dearborn' })
//   ]
//
//   for (var i = 0; i < records.length; i++) {
//     index.add(records[i].firstname, records[i].OID)
//   }
//
//   var indexes = index.recordsFor('John')
//   t.ok(indexes.length === 2 &&
//     records[0].OID === indexes[0] &&
//     records[records.length - 1].OID === indexes[1],
//     'Identifies the appropriate records.'
//   )
//
//   t.ok(
//     index.keys.length === 3 &&
//     index.keys[0] === 'John' &&
//     index.keys[1] === 'Jill' &&
//     index.keys[2] === 'Jake',
//     'Identifies unique keys correctly.'
//   )
//
//   index.update(records[0].OID, 'John', 'Johnny')
//   t.ok(
//     index.recordsFor('John').length === 1 &&
//     index.recordsFor('Johnny').length === 1 &&
//     records[records.length - 1].OID === indexes[1],
//     'Update index with new value.'
//   )
//
//   t.ok(
//     index.keys.length === 4 &&
//     index.keys[0] === 'John' &&
//     index.keys[3] === 'Johnny' &&
//     index.keys[1] === 'Jill' &&
//     index.keys[2] === 'Jake',
//     'Updates unique keys correctly.'
//   )
//
//   index.remove(records[0].OID, 'Johnny')
//   t.ok(index.uniqueValues.size === 3 && !index.uniqueValues.has('Johnny'), 'Remove index with value.')
//
//   index.remove(records[records.length - 1].OID)
//   t.ok(index.uniqueValues.size === 2, 'Remove index without value.')
//
//   index.reset()
//   t.ok(index.uniqueValues.size === 0, 'Reset empties the index.')
//   t.ok(index.keys.length === 0, 'No unique keys remain after reset.')
//
//   t.end()
// })
//
// test('NGN.DATA.BTree', function (t) {
//   var tasks = new TaskRunner()
//   var tree = new NGN.DATA.BTree()
//
//   tasks.add('Put values into BTree', function (next) {
//     var data = [2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36]
//
//     for (var i = 0; i < data.length; i++) {
//       tree.put(data[i], 'value_' + data[i].toString())
//     }
//
//     t.ok(tree.length === data.length, 'BTree has correct number of nodes/leafs.')
//
//     next()
//   })
//
//   tasks.add('Append nodes', function (next) {
//     var currentSize = tree.length
//     var data = [7, 9, 11, 13]
//
//     for (var i = 0; i < data.length; i++) {
//       tree.put(data[i], 'value_' + data[i].toString())
//     }
//
//     t.ok(tree.length === (data.length + currentSize), 'BTree appends the correct number of nodes/leafs after initialization.')
//
//     next()
//   })
//
//   tasks.add('Retrieve values', function (next) {
//     t.ok(tree.get(8) === 'value_8', 'Retrieve correct value from tree.')
//     t.ok(tree.get(3) === undefined, 'Return undefined when no value exists.')
//
//     next()
//   })
//
//   tasks.add('Delete values', function (next) {
//     tree.delete(8)
//     tree.delete(14)
//     tree.delete(36)
//     tree.delete(37)
//
//     t.ok(
//       tree.get(8) === undefined &&
//       tree.get(14) === undefined &&
//       tree.get(36) === undefined &&
//       tree.get(37) === undefined,
//       'Removal of a key deletes it from the index.'
//     )
//
//     next()
//   })
//
//   tasks.add('Walk tree (ascending)', function (next) {
//     var comp = [2, 4, 5, 6, 7, 9, 10, 11, 12, 13]
//     var res = []
//
//     tree.walk(2, 14, function (key, val) {
//       res.push(key)
//
//       if ('value_' + key.toString() !== val) {
//         throw new Error('Invalid key/pair for ' + key + ':' + val.toString())
//       }
//     })
//
//     for (var i = 0; i < comp.length; i++) {
//       if (res[i] !== comp[i]) {
//         t.fail('Walking tree failed to traverse each node.')
//       }
//     }
//
//     t.pass('Ascended walk succeeds.')
//
//     next()
//   })
//
//   tasks.add('Walk tree (descending)', function (next) {
//     var comp = [18, 16, 13, 12, 11, 10, 9, 7, 6, 5, 4, 2]
//     var res = []
//
//     tree.walkDesc(2, 18, function (key, val) {
//       res.push(key)
//
//       if ('value_' + key.toString() !== val) {
//         throw new Error('Invalid key/pair for ' + key + ':' + val.toString())
//       }
//     })
//
//     for (var i = 0; i < comp.length; i++) {
//       if (res[i] !== comp[i]) {
//         t.fail('Descended walk through tree failed to traverse each node.')
//       }
//     }
//
//     t.pass('Descended walk succeeds.')
//
//     next()
//   })
//
//   tasks.add('Restricted count', function (next) {
//     t.ok(tree.count(2, 18) === 12, 'Retrieves the correct number of indexes.')
//
//     next()
//   })
//
//   tasks.add('Walk empty ranges', function (next) {
//     tree.walk(37, 40, function (key, val) { t.fail('Failed to walk empty range (ascending).') })
//     tree.walk(0, 1, function (key, val) { t.fail('Failed to walk empty range (ascending).') })
//     tree.walkDesc(37, 40, function (key, val) { t.fail('Failed to walk empty range (descending).') })
//     tree.walkDesc(0, 1, function (key, val) { t.fail('Failed to walk empty range (descending).') })
//
//     t.ok(tree.length === 20, 'Walk results in proper number of nodes/leafs.')
//
//     next()
//   })
//
//   tasks.on('complete', t.end)
//
//   tasks.run(true)
// })
//
// test('NGN.DATA.Store Basic Functionality', function (t) {
//   var MetaModel = new NGN.DATA.Model(Meta())
//   var GoodStore = new NGN.DATA.Store({
//     model: MetaModel
//   })
//
//   t.ok(GoodStore.name === 'Untitled Data Store', 'Correctly named store.')
//
//   t.throws(function () {
//     var BadStore = new NGN.DATA.Store() // eslint-disable-line no-unused-vars
//   }, 'An invalid or missing configuration throws an error.')
//
//   var tasks = new TaskRunner()
//
//   tasks.add('Add records', function (next) {
//     var record = GoodStore.add({
//       firstname: 'John',
//       lastname: 'Doe'
//     })
//
//     t.ok(GoodStore.length === 1, 'Record added.')
//     t.ok(record.firstname === 'John', 'Added record accurately represents the stored data.')
//     t.ok(GoodStore.contains(record), 'Store recognizes that it contains the new record.')
//     t.ok(GoodStore.indexOf(record) === 0, 'Store accurately returns the index of the new record.')
//
//     GoodStore.add({
//       firstname: 'Jill',
//       lastname: 'Doe'
//     })
//
//     GoodStore.once('record.create', function (rec) {
//       t.pass('Adding a record to a store emits a record.create event.')
//       t.ok(record === GoodStore.first, 'First accessor returns the first record within the store.')
//       t.ok(rec === GoodStore.last, 'Last accessor returns the last record within the store.')
//       t.ok(GoodStore.last.firstname === 'Jake', 'Last accessor returns proper values.')
//       t.ok(GoodStore.first.firstname === 'John', 'First accessor returns proper values.')
//       t.ok(GoodStore.length === 3, 'Correct number of records identified.')
//
//       next()
//     })
//
//     GoodStore.add({
//       firstname: 'Jake',
//       lastname: 'Doe'
//     })
//   })
//
//   tasks.add('Remove records', function (next) {
//     var removedRecord = GoodStore.remove(0)
//
//     t.ok(GoodStore.length === 3, 'Store record manifest is unaffected upon remove by index.')
//     t.ok(GoodStore.size === 2, 'Active record count is decremented upon remove by index.')
//     t.ok(removedRecord.firstname === 'John', 'Correctly returns the removed record when removing by index.')
//     t.ok(GoodStore.first.firstname === 'Jill', 'Removing the first record automatically moves the first index cursor forward.')
//     t.ok(GoodStore.last.firstname === 'Jake', 'Removing the first record does not affect the last index cursor.')
//
//     GoodStore.once('record.delete', function (rec) {
//       t.pass('record.remove event triggered upon record deletion.')
//       t.ok(GoodStore.length === 3, 'Store record manifest is unaffected upon remove by model.')
//       t.ok(GoodStore.size === 1, 'Active record count is decremented upon remove by model.')
//       t.ok(rec.firstname === 'Jake', 'Correctly returns the removed record when removing by model.')
//       t.ok(GoodStore.first.firstname === 'Jill', 'Removing the last record automatically moves the first index cursor forward.')
//       t.ok(GoodStore.last.firstname === 'Jill', 'Removing the last record does not affect the last index cursor.')
//
//       t.ok(GoodStore.remove(2) === null, 'Removal fails when passing an invalid index.')
//
//       next()
//     })
//
//     GoodStore.remove(GoodStore.last)
//   })
//
//   tasks.add('Clear store.', function (next) {
//     GoodStore.once('clear', function () {
//       t.pass('clear event fired when store is cleared.')
//       t.ok(GoodStore.length === 0, 'Cleared store of all records.')
//
//       next()
//     })
//
//     GoodStore.clear()
//   })
//
//   tasks.add('Add multiple records simultaneously.', function (next) {
//     var results = GoodStore.add([{
//       firstname: 'John',
//       lastname: 'Doe'
//     }, {
//       firstname: 'Jill',
//       lastname: 'Doe'
//     }, {
//       firstname: 'Jake',
//       lastname: 'Doe'
//     }, {
//       firstname: 'Jean',
//       lastname: 'Doe'
//     }])
//
//     t.ok(GoodStore.length === 4, 'Added array of records.')
//     t.ok(results.length === 4, 'Returned the correct number of results synchronously.')
//     t.ok(
//       GoodStore.getRecord(0).firstname === 'John' &&
//       GoodStore.getRecord(1).firstname === 'Jill' &&
//       GoodStore.getRecord(2).firstname === 'Jake' &&
//       GoodStore.getRecord(3).firstname === 'Jean',
//       'Proper records recognized when added in bulk.'
//     )
//
//     next()
//   })
//
//   tasks.add('Doubly Linked list', function (next) {
//     GoodStore.clear()
//     GoodStore.add([{
//       firstname: 'John',
//       lastname: 'Doe'
//     }, {
//       firstname: 'Jill',
//       lastname: 'Doe'
//     }, {
//       firstname: 'Jake',
//       lastname: 'Doe'
//     }, {
//       firstname: 'Jean',
//       lastname: 'Doe'
//     }])
//
//     var record = GoodStore.first
//
//     var curr = record.previous()
//     t.ok(curr === null, 'Calling previous() on first item returns null.')
//
//     curr = record.previous(true)
//     t.ok(curr.OID === GoodStore.last.OID, 'Calling previous() on first record with cycling returns last record.')
//
//     curr = record.previous(3, true)
//     t.ok(curr.OID === GoodStore.getRecord(1).OID, 'Calling previous() on the first record with cycling (skipping 2) returns appropriate record.')
//
//     curr = record.previous(5, true)
//     t.ok(curr.OID === GoodStore.last.OID, 'Calling previous() (w/ cycling) for more records than the store contains returns the correct record (multicycle).')
//
//     record = GoodStore.last
//     curr = record.next()
//     t.ok(curr === null, 'Calling next() on the last item returns null.')
//
//     curr = record.next(true)
//     t.ok(curr.OID === GoodStore.first.OID, 'Calling next() on last record with cycling returns first record.')
//
//     curr = record.next(3, true)
//     t.ok(curr.OID === GoodStore.getRecord(2).OID, 'Calling next() on the last record with cycling (skipping 2) returns appropriate record.')
//
//     curr = record.next(5, true)
//     t.ok(curr.OID === GoodStore.first.OID, 'Calling next() (w/ cycling) for more records than the store contains returns the correct record (multicycle).')
//
//     next()
//   })
//
//   tasks.add('Remove a model from a store, from the model.', function (next) {
//     var record = GoodStore.first
//     var firstname = record.firstname
//
//     record.destroy()
//
//     t.ok(GoodStore.size === 3 && firstname !== GoodStore.first.firstname, 'Model.destroy() removes an individual model from its parent store.')
//
//     next()
//   })
//
//   tasks.add('Basic Iteration (forEach)', function (next) {
//     GoodStore.forEach(function (record) {
//       record.lastname = 'changed'
//     })
//
//     t.ok(
//       GoodStore.first.lastname === 'changed' &&
//       GoodStore.getRecord(1).lastname === 'changed' &&
//       GoodStore.last.lastname === 'changed',
//       'Method properly applied to each record within the store.'
//     )
//
//     next()
//   })
//
//   tasks.add('Compact Store', function (next) {
//     GoodStore.clear()
//
//     var x = 0
//     var shortLived = []
//
//     while (x < 220) {
//       var r = GoodStore.add({
//         firstname: x.toString()
//       })
//
//       if (x >= 40 && x < 150) {
//         shortLived.push(r)
//       }
//
//       x++
//     }
//
//     GoodStore.remove(shortLived)
//
//     GoodStore.compact()
//
//     t.ok(GoodStore.size === GoodStore.length, 'Compacted store contains correct number of results.')
//
//     GoodStore.forEach(function (record) {
//       var val = parseInt(record.firstname, 10)
//
//       if (!(val < 40 || val >= 150)) {
//         t.fail('Removed record still exists.')
//       }
//     })
//
//     next()
//   })
//
//   // TODO: B-Tree indexing of numeric and date values
//   // TODO: Load
//   // TODO: Reload
//   // TODO: Find/Query
//   // TODO: Filtering (& Clearing)
//   // TODO: Sorting
//   // TODO: Deduplicate
//   // TODO: Invalid/valid field events for store records
//   // TODO: Undo/Redo
//
//   tasks.on('complete', t.end)
//   tasks.run(true)
// })
//
// test('NGN.DATA.Store Indexing', function (t) {
//   var MetaModel = new NGN.DATA.Model(Meta())
//   var Store = new NGN.DATA.Store({
//     model: MetaModel,
//     index: ['firstname', 'lastname']
//   })
//
//   t.ok(Store.METADATA.INDEXFIELDS.size === 2, 'Indexes applied to store.')
//   t.ok(
//     Store.indexedFieldNames[0] === 'firstname' &&
//     Store.indexedFieldNames[1] === 'lastname',
//     'Store recognizes its indexed fields by name.'
//   )
//
//   Store.add([
//     { firstname: 'John', lastname: 'Doe', val: 17 },
//     { firstname: 'Jill', lastname: 'Doe', val: 13 },
//     { firstname: 'Jake', lastname: 'Doe', val: 14 },
//     { firstname: 'John', lastname: 'Dearborn', val: 14 }
//   ])
//
//   var records = Store.getIndexRecords('lastname', 'Doe')
//
//   t.ok(
//     records.length === 3 &&
//     records[0].firstname === 'John' &&
//     records[1].firstname === 'Jill' &&
//     records[2].firstname === 'Jake',
//     'Indexed records retrieved successfully.'
//   )
//
//   Store.removeIndex('firstname')
//   t.ok(Store.indexedFieldNames[0] === 'lastname', 'Remove index by name.')
//
//   Store.removeIndex()
//   t.ok(Store.indexedFieldNames.length === 0, 'Remove all indexes.')
//
//   // Use BTree index for numeric fields
//   Store.createIndex('val')
//   t.ok(
//     Store.indexedFieldNames.length === 1 &&
//     Store.indexedFieldNames[0] === 'val' &&
//     Store.METADATA.INDEX.val.isBTree &&
//     Store.getIndexRecords('val', 14).length === 2 &&
//     Store.METADATA.INDEX.val.BTREE.get(13) === 1,
//     'Add B-Tree index on numeric field.'
//   )
//
//   t.end()
// })
//
// // test('NGN.DATA.Relationship (Multi-Model)', function (t) {
// //   var Model = new NGN.DATA.Model(Meta())
// //   var field = new NGN.DATA.Relationship({
// //     audit: true,
// //     name: 'test',
// //     join: [Model]
// //   })
// //
// //   t.ok(field.value instanceof NGN.DATA.Store, 'Correctly returns the nested store.')
// //
// //   field.value.add([{
// //     firstname: 'John',
// //     lastname: 'Doe'
// //   }, {
// //     firstname: 'Jill',
// //     lastname: 'Doe'
// //   }])
// // console.log(field.value.first.firstname)
// // console.log('>>', field.value.last)
// // console.log('>>', field.value.first)
// //   t.ok(
// //     field.value.first.firstname === 'John' &&
// //     field.value.last.firstname === 'Jill',
// //     'Added multiple records to relationship field.'
// //   )
// //
// //   // field.value.firstname = 'John'
// //   // field.value.lastname = 'Doe'
// //   // field.value.firstname = 'Jill'
// //   //
// //   // field.undo()
// //   // t.ok(field.value.firstname === 'John' && field.value.lastname === 'Doe', 'Undo operation yields prior value.')
// //   //
// //   // field.redo()
// //   // t.ok(field.value.firstname === 'Jill' && field.value.lastname === 'Doe', 'Redo operation yields next value.')
// //   //
// //   // field.undo(2)
// //   // t.ok(field.value.firstname === 'John' && field.value.lastname === null, 'Multiple undo operation yields appropriate value.')
// //   //
// //   // field.redo(2)
// //   // t.ok(field.value.firstname === 'Jill' && field.value.lastname === 'Doe', 'Multiple redo operation yields appropriate value.')
// //   //
// //   // t.ok(field.value.changelog.length === 3, 'Proper changelog length.')
// //
// //   t.end()
// // })
//
// // TODO: Store-level Validation Rules
// // TODO: Filters
// // TODO: Proxy
