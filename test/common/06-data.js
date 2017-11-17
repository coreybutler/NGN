const test = require('tape')
const TaskRunner = require('shortbus')

// Remember to run `npm run test:build` before executing,
// otherwise the lib directory will not exist.

require('../lib/core')
require('../lib/eventemitter')
require('../lib/tasks/bootstrap')
require('../lib/data/DATA')

test('Data Sanity Checks', function (t) {
  t.ok(typeof NGN.DATA === 'object', 'NGN.DATA exists as an object/namespace.')
  t.ok(typeof NGN.DATA.UTILITY === 'function', 'NGN.DATA.UTILITY exists as singleton class.')
  t.ok(typeof NGN.DATA.TransactionLog === 'function', 'NGN.DATA.TransactionLog exists as a class.')
  t.ok(typeof NGN.DATA.Rule === 'function', 'NGN.DATA.Rule exists as a class.')
  t.ok(typeof NGN.DATA.RangeRule === 'function', 'NGN.DATA.RangeRule exists as a class.')
  t.ok(typeof NGN.DATA.Field === 'function', 'NGN.DATA.Field exists as a class.')
  t.ok(typeof NGN.DATA.VirtualField === 'function', 'NGN.DATA.VirtualField exists as a class.')
  t.ok(typeof NGN.DATA.Relationship === 'function', 'NGN.DATA.Relationship exists as a class.')
  t.ok(typeof NGN.DATA.Entity === 'function', 'NGN.DATA.Entity exists as a class.')
  t.ok(typeof NGN.DATA.Model === 'function', 'NGN.DATA.Model exists as a class.')
  t.ok(typeof NGN.DATA.Index === 'function', 'NGN.DATA.Index exists as a class.')
  t.ok(typeof NGN.DATA.Store === 'function', 'NGN.DATA.Store exists as a class.')
  t.end()
})

test('NGN.DATA.UTILITY', function (t) {
  var data = {
    a: 1,
    b: true,
    c: 'three'
  }

  var originalData = Object.assign({}, data)

  data[Symbol('test')] = 'symbol'
  data.fn = function () {}
  data = NGN.DATA.UTILITY.serialize(data)

  t.ok(JSON.stringify(data) === JSON.stringify(originalData), 'Serialization returns an object stripped of functions.')

  data.d = /^s.*/
  originalData.d = '/^s.*/'

  t.ok(JSON.stringify(NGN.DATA.UTILITY.serialize(data)) === JSON.stringify(originalData), 'Serialization returns an object with proper RegEx conversion (to string).')

  var dt = new Date(2000, 0, 1, 0, 0, 0)

  data.d = dt
  originalData.d = dt.toISOString()
  t.ok(JSON.stringify(NGN.DATA.UTILITY.serialize(data)) === JSON.stringify(originalData), 'Serialization returns an object with proper date conversion (to ISO string).')

  delete data.d

  t.ok(NGN.DATA.UTILITY.checksum(data) === 1627578237, 'Checksum calculates for an object.')

  var uuid = NGN.DATA.UTILITY.UUID()
  t.ok(/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}/i.test(uuid), 'UUID() returns a properly formatted identifier.')

  var guid = NGN.DATA.UTILITY.GUID()
  t.ok(/[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{4}-[0-9A-Za-z]{12}/i.test(guid), 'GUID() returns a properly formatted identifier.')

  t.end()
})

test('NGN.DATA.TransactionLog', function (t) {
  var log = new NGN.DATA.TransactionLog()

  log.funnel(['advance', 'rollback', 'reset', 'commit'], 'done')

  t.ok(log.cursor === null, 'Initialize with null cursor.')
  t.ok(log.getCommit() === undefined, 'Fails to return a commit when none exist.')

  log.advance()
  log.rollback()
  t.ok(log.cursor === null, 'Advancing and rolling back on an empty log does nothing.')

  var ida = log.commit('a')
  t.ok(typeof ida === 'symbol', 'Committing an entry generates an ID.')
  t.ok(log.getCommit(ida).value === 'a', 'Retrieving a record by ID returns a transaction object.')

  var idb = log.commit('b')
  var idc = log.commit('c')
  var idd = log.commit('d')
  var ide = log.commit('e')

  t.ok(log.length === 5, 'Correct number of logs committed.')
  t.ok(log.cursor === ide, 'Cursor successfully advances with each commit.')

  log.rollback()
  t.ok(log.cursor === idd, 'Default rollback moves cursor back one index.')
  t.ok(log.cursorIndex === 3, 'Proper cursor index number retrieved.')
  t.ok(log.currentValue === 'd', 'Proper cursor value returned for currentValue.')

  log.rollback(2)
  t.ok(log.cursor === idb, 'Multistep rollback moves cursor back appropriately.')

  log.once('advance', function (data) {
    t.ok(typeof data === 'symbol', 'Advance event triggered with ID.')
  })

  log.once('commit', function (data) {
    t.ok(typeof data === 'symbol', 'Log event triggered with ID.')
  })

  log.once('rollback', function (data) {
    t.ok(typeof data === 'symbol', 'Rollback event triggered with ID.')
  })

  log.advance()
  t.ok(log.cursor === idc, 'Default advance moves cursor forward one index.')

  log.advance(2)
  t.ok(log.cursor === ide, 'Multistep advance moves cursor forward appropriately.')

  log.rollback(-1)
  t.ok(log.cursor === ide, 'Negative rollback ignored.')

  log.advance(-1)
  t.ok(log.cursor === ide, 'Negative advance ignored.')

  log.rollback(10)
  t.ok(log.cursor === ida, 'Rollback limited to beginning of log.')

  log.advance(100)
  t.ok(log.cursor === ide, 'Advance limited to end of log.')

  log.rollback(2)
  var idf = log.commit('f')

  t.ok(log.length === 4, 'Committing after rollback contains correct number of entries.')
  t.ok(log.cursor === idf, 'Commit returns latest cursor.')

  log.rollback()
  log.flush()
  log.advance()
  t.ok(log.length === 3 && log.cursor === idc, 'Flush removes correct entries.')

  t.ok(log.log.length === 3, 'Correctly generates an array-based log/report.')

  log.once('done', function () {
    t.ok(log.length === 0, 'Reset clears the log.')

    log = new NGN.DATA.TransactionLog(3)

    log.commit('aa')
    log.commit('bb')
    let idcc = log.commit('cc')
    log.commit('dd')
    log.commit('ee')
    log.rollback(10)

    t.ok(log.cursor === idcc, 'Max entries supported with LIFO pattern.')

    t.end()
  })

  log.reset()
})

test('NGN.DATA.Rule', function (t) {
  var rule = new NGN.DATA.Rule('test')

  t.ok(rule.type === 'string', 'Correctly identifies a string-based exact-match rule.')
  t.ok(rule.test('test'), 'Exact match string passes string validation.')
  t.ok(!rule.test('testing'), 'Different text fails exact match string validation.')

  rule = new NGN.DATA.Rule(10)

  t.ok(rule.type === 'number', 'Correctly identifies a number-based exact-match rule.')
  t.ok(rule.test(10), 'Exact match number passes string validation.')
  t.ok(!rule.test(11), 'Different number fails exact match number validation.')

  rule = new NGN.DATA.Rule(true)

  t.ok(rule.type === 'boolean', 'Correctly identifies a boolean-based exact-match rule.')
  t.ok(rule.test(true), 'Exact match value passes boolean validation.')
  t.ok(!rule.test(false), 'Different value fails exact match boolean validation.')

  rule = new NGN.DATA.Rule(/^a.*/gi)

  t.ok(rule.type === 'regexp', 'Correctly identifies a regular express-based rule.')
  t.ok(rule.test('alpha'), 'Pattern match passes RegEx validation.')
  t.ok(!rule.test('beta'), 'Different pattern fails RegeEx validation.')

  rule = new NGN.DATA.Rule(['a', 1, true])

  t.ok(rule.type === 'array', 'Correctly identifies enumeration rule.')
  t.ok(rule.test(1), 'Included value match passes enumeration validation.')
  t.ok(!rule.test(false), 'Different value fails enumeration validation.')

  rule = new NGN.DATA.Rule((value) => {
    return value === 'another test'
  })

  t.ok(rule.type === 'function', 'Correctly identifies custom function rule.')
  t.ok(rule.test('another test'), 'Valid value passes custom validation.')
  t.ok(!rule.test('bob'), 'Invalid value fails custom validation.')

  t.end()
})

test('NGN.DATA.RangeRule', function (t) {
  var rule = new NGN.DATA.RangeRule('rangetest', [
    [null, -50],
    [-10, -5],
    [10, 20],
    ['25->50'],
    ['100->null']
  ])

  t.ok(rule.range.length === 5, 'Correct number of ranges created.')
  t.ok(!rule.test(0), 'Number outside of range is flagged as invalid.')
  t.ok(rule.test(150), 'Number within range is flagged as valid.')

  rule.removeRange([null, -50])

  t.ok(rule.range.length === 4, 'Correct number of ranges detected after removal.')
  t.ok(!rule.test(-75), 'Test fails after validation range is removed.')

  rule.addRange([-70, -60])
  t.ok(rule.range.length === 5, 'Correct number of rules detected after adding new one.')
  t.ok(rule.test(-65), 'Validation succeeds after new range is added.')

  rule.range = [1, 5]
  t.ok(rule.range.length === 1, 'Resetting the range yields correct number of ranges.')
  t.ok(rule.test(3) && !rule.test(10), 'Correctly validates using new rule range.')

  t.end()
})

test('NGN.DATA.Field (Standard String Field)', function (t) {
  var field = new NGN.DATA.Field('testfield')

  t.ok(field.type === 'string', 'String by default.')
  t.ok(field.fieldType === 'data', 'Recognized as a standard data field.')
  t.ok(!field.required, 'Not required by default.')
  t.ok(field.value === null, 'Null by default.')
  t.ok(!field.hidden, 'Not hidden by default.')
  t.ok(!field.virtual, 'Not virtual by default.')
  t.ok(!field.identifier, 'Not an identifier by default.')
  t.ok(field.name === 'testfield', 'Recognized name of the field.')
  t.ok(field.isNew, 'Field is recognized as new by default.')

  field.required = 1
  t.ok(field.required, 'Field can be manually set to be required after initial configuration.')

  field.value = 'test value'
  t.ok(field.value === 'test value', 'Setting a value reflects the appropriate value.')
  t.ok(!field.modified, 'Field is not considered modified on the initial value set.')

  field.disallowInvalid()
  t.throws(() => { field.value = 1 }, 'Invalid value throws an error.')

  field.value = 'changed'
  t.ok(field.modified, 'Modification recognizes alterations as a change.')

  // Test events
  var tasks = new TaskRunner()

  tasks.add('Hide Field', function (next) {
    field.once('hidden', function () {
      t.ok(field.hidden, 'Hiding field triggers an event and successfully updates the "hidden" flag.')
      next()
    })

    field.hide()
  })

  tasks.add('Unhide Field', function (next) {
    field.once('unhidden', function () {
      t.ok(!field.hidden, 'Unhiding field triggers an event and successfully updates the "hidden" flag.')
      next()
    })

    field.unhide()
  })

  tasks.add('Modification triggers update event.', function (next) {
    field.once('update', function () {
      t.ok(field.modified, 'Modification reflects recognizes update.')
      next()
    })

    field.value = 'different'
  })

  tasks.add('Custom Rules', function (next) {
    field = new NGN.DATA.Field({
      name: 'testingField',
      type: String,
      rules: function (value) {
        return value === 'ok'
      },
      allowInvalid: true
    })

    field.value = 'ok'
    t.ok(field.valid, 'Configured custom rule validates correctly.')

    field.value = 'not ok'
    t.ok(!field.valid, 'Configured custom rule invalidates correctly.')

    field = new NGN.DATA.Field({
      name: 'testField',
      type: String,
      rules: [
        function (value) {
          return /^o.*/.test(value)
        },
        function (value) {
          return value === 'ok' || value === 'ok already!'
        }
      ],
      allowInvalid: true
    })

    field.value = 'ok'
    t.ok(field.valid, 'Configured custom rule set 1 validates correctly.')

    field.value = 'ok already!'
    t.ok(field.valid, 'Configured custom rule set 2 validates correctly.')

    field.value = 'not ok'
    t.ok(!field.valid, 'Configured custom rule set 1 invalidates correctly.')

    field.value = 'okie dokie'
    t.ok(!field.valid, 'Configured custom rule set 2 invalidates correctly.')

    next()
  })

  tasks.on('complete', t.end)

  tasks.run(true)
})

test('NGN.DATA.Field (Pattern String Field)', function (t) {
  var field = new NGN.DATA.Field({
    name: 'testfield',
    type: String,
    pattern: /^X.*/
  })

  t.ok(field.METADATA.rules.length === 2, 'Pattern match configured as part of the validation rules.')

  field.value = 'X-test'
  t.ok(field.valid, 'Proper value passes pattern match test.')

  field.value = 'problemX'
  t.ok(field.valid === false, 'Proper value fails pattern match test.')

  t.end()
})

test('NGN.DATA.Field (Enumeration)', function (t) {
  var field = new NGN.DATA.Field({
    name: 'enumfield',
    type: String,
    enum: [
      'a',
      'b'
    ],
    allowInvalid: true
  })

  t.ok(field.METADATA.rules.length === 2, 'Enumeration match configured as part of the validation rules.')

  field.value = 'b'
  t.ok(field.valid, 'A value within the enumeration set is marked as valid.')

  field.value = 'x'
  t.ok(!field.valid, 'A value outside the enumeration set is marked as invalid.')

  t.end()
})

test('NGN.DATA.Field (Number Field)', function (t) {
  var field = new NGN.DATA.Field({
    name: 'testfieldnumber',
    type: Number,
    range: [
      [null, -50],
      [-10, -5],
      [10, 20],
      ['25->50'],
      ['100->null']
    ],
    autocorrectInput: true
  })

  t.ok(field.type === 'number', 'Correctly recognized number value.')
  t.ok(field.fieldType === 'data', 'Recognized as a standard data field.')
  t.ok(!field.required, 'Not required by default.')
  t.ok(field.value === null, 'Null by default.')
  t.ok(!field.hidden, 'Not hidden by default.')
  t.ok(!field.virtual, 'Not virtual by default.')
  t.ok(!field.identifier, 'Not an identifier by default.')
  t.ok(field.name === 'testfieldnumber', 'Recognized name of the field.')
  t.ok(field.isNew, 'Field is recognized as new by default.')

  field.value = 0
  t.ok(!field.valid, 'Number outside of range is flagged as invalid.')

  field.value = 150
  t.ok(field.valid, 'Number inside range is flagged as valid.')

  field.value = '-3'
  t.ok(field.value === -3 && !field.valid, 'Autocorrected input yields appropriate result.')

  try {
    field = new NGN.DATA.Field({
      name: 'testfieldnumber',
      type: Number,
      range: [50, 10]
    })

    t.fail('Allowed to set a min/max range where max is less than min')
  } catch (e) {
    t.pass('Do not allow a min/max range where max is less than min.')
  }

  field = new NGN.DATA.Field({
    name: 'testfieldnumber',
    type: Number,
    min: 10
  })

  field.value = 5
  t.ok(!field.valid, 'Value below minimum is invalid.')

  field.value = 10
  t.ok(field.valid, 'Value at minimum is valid.')

  field = new NGN.DATA.Field({
    name: 'testfieldnumber',
    type: Number,
    max: 10
  })

  field.value = 15
  t.ok(!field.valid, 'Value above maximum is invalid.')

  field.value = 10
  t.ok(field.valid, 'Value at maximum is valid.')

  field = new NGN.DATA.Field({
    name: 'testfieldnumber',
    type: Number,
    min: 1,
    max: 10
  })

  field.value = 15
  t.ok(!field.valid, 'Value above minimum/maximum threshold is invalid.')

  field.value = 0
  t.ok(!field.valid, 'Value below minimum/maximum threshold is invalid.')

  field.value = 5
  t.ok(field.valid, 'Value in minimum/maximum threshold is valid.')

  t.end()
})

test('NGN.DATA.Field Basic Auditing (Changelog)', function (t) {
  var field = new NGN.DATA.Field({
    name: 'test',
    audit: true
  })

  field.value = 'a'
  field.value = 'b'
  field.value = 'c'
  field.value = 'd'
  field.value = 'e'

  field.undo()
  t.ok(field.value === 'd', 'Basic undo rolls back one change.')

  field.redo()
  t.ok(field.value === 'e', 'Basic redo advances one change.')

  field.undo(3)
  t.ok(field.value === 'b', 'Multistep rollback quietly updates value.')

  field.redo(3)
  t.ok(field.value === 'e', 'Multistep redo quietly updates value.')

  field.undo(2)
  field.value = 'f'
  t.ok(field.METADATA.AUDITLOG.length === 4, 'Correctly truncated newer values.')
  t.ok(field.METADATA.AUDITLOG.currentValue === 'f', 'Correctly advanced cursor.')

  field.undo()
  t.ok(field.value === 'c', 'Correctly reverted value after committing change.')

  field.redo(10)
  t.ok(field.value === 'f', 'Correctly advanced value after committing change.')

  t.end()
})

test('NGN.DATA.VirtualField', function (t) {
  var field = new NGN.DATA.VirtualField({
    scope: {
      multiplier: 3
    },
    method: function () {
      return 5 * this.multiplier
    }
  })

  t.ok(field.value === 15, 'Generated correct value.')
  t.ok(!field.hidden, 'Not hidden by default.')

  field.value = 'nothing'
  t.ok(field.value === 15, 'Generated correct value after attempting to set value.')

  field.hidden = true
  t.ok(field.hidden, 'Hidden by request.')

  t.end()
})

// Common data
var meta = function () {
  return {
    name: 'metamodel',
    idField: 'testid',

    fields: {
      firstname: null,
      lastname: null,
      val: {
        min: 10,
        max: 20,
        default: 15
      },
      testid: null,
      virtual: function () {
        return 'test ' + this.val
      }
    }
    // , dataMap: {
    //   firstname: 'gn',
    //   lastname: 'sn'
    // }
  }
}

test('NGN.DATA.Relationship (Single Model)', function (t) {
  var Model = new NGN.DATA.Model(meta())
  var field = new NGN.DATA.Relationship({
    audit: true,
    name: 'test',
    join: Model
  })

  t.ok(field.value instanceof NGN.DATA.Entity, 'Correctly returns the nested model.')

  field.value.firstname = 'John'
  field.value.lastname = 'Doe'
  field.value.firstname = 'Jill'

  field.undo()
  t.ok(field.value.firstname === 'John' && field.value.lastname === 'Doe', 'Undo operation yields prior value.')

  field.redo()
  t.ok(field.value.firstname === 'Jill' && field.value.lastname === 'Doe', 'Redo operation yields next value.')

  field.undo(2)
  t.ok(field.value.firstname === 'John' && field.value.lastname === null, 'Multiple undo operation yields appropriate value.')

  field.redo(2)
  t.ok(field.value.firstname === 'Jill' && field.value.lastname === 'Doe', 'Multiple redo operation yields appropriate value.')

  t.ok(field.value.changelog.length === 3, 'Proper changelog length.')

  t.end()
})

test('NGN.DATA.Model', function (t) {
  var tasks = new TaskRunner()
  var Person
  var p

  tasks.add('Create model', function (next) {
    Person = new NGN.DATA.Model(meta())
    t.ok(typeof Person === 'function', 'Model creation works.')
    next()
  })

  tasks.add('Create record', function (next) {
    p = new Person()

    t.ok(p !== undefined, 'Model instantiation works.')
    t.ok(p.METADATA.name === 'metamodel', 'Model has a custom name.')

    t.ok(
      p.METADATA.knownFieldNames.has('firstname') &&
      p.METADATA.knownFieldNames.has('lastname') &&
      p.METADATA.knownFieldNames.has('val') &&
      p.METADATA.knownFieldNames.has('testid') &&
      p.METADATA.knownFieldNames.has('virtual') &&
      !p.METADATA.knownFieldNames.has('not_a_field'),
      'Recognized all field names'
    )

    t.ok(p.getField('firstname').type === 'string', 'Properly unconfigured field as string.')
    t.ok(p.getField('val').type === 'number', 'Autoidentify data type.')

    t.ok(p.virtual === 'test 15', 'Virtual field successfully generated value.')

    next()
  })

  tasks.add('Modify Record', function (next) {
    p.once('field.update', function (change) {
      t.ok(change.field.name === 'firstname', 'Event fired for data change.')
      t.ok(!change.old, 'Old value recognized.')
      t.ok(change.new === 'Corey', 'New value recognized.')

      next()
    })

    p.firstname = 'Corey'
  })

  tasks.add('Field Creation', function (next) {
    p.once('field.create', function (field) {
      t.ok(field instanceof NGN.DATA.Field, 'Emitted the field in the payload.')
      t.ok(field.name === 'middle', 'Proper field name recognized in emitted payload.')
      t.ok(p.hasOwnProperty('middle'), 'Model contains new field as a getter/setter.')

      next()
    })

    p.addField('middle')
  })

  tasks.add('Field Removal', function (next) {
    p.once('field.remove', function (field) {
      t.ok(field instanceof NGN.DATA.Field, 'Emitted the field in the payload.')
      t.ok(field.name === 'middle', 'Proper field name recognized in emitted payload.')
      t.ok(!p.hasOwnProperty('middle'), 'Model no longer contains field as a getter/setter.')

      next()
    })

    p.removeField('middle')
  })

  tasks.add('Data Serialization', function (next) {
    console.log(p.data)
    console.log(p.representation)
    next()
  })

  // tasks.add(function (next) {
  //   // Need to implement undo.
  // })
  //
  // tasks.add(function (next) {
  //
  // })
  //
  // tasks.add(function (next) {
  //
  // })
  //
  // tasks.add(function (next) {
  //
  // })

  tasks.on('complete', t.end)

  tasks.run(true)
})

test('NGN.DATA.Model Data Field Auditing (Changelog)', function (t) {
  var config = meta()
  config.audit = true

  var Model = new NGN.DATA.Model(config)
  var m = new Model()

  m.firstname = 'John'
  m.lastname = 'Doe'
  m.val = 17
  m.id = '12345'

  m.firstname = 'Jill'
  m.lastname = 'Rey'

  m.undo()
  t.ok(m.firstname === 'Jill' && m.lastname === 'Doe', 'Undo rolls back a single change.')

  m.undo()
  t.ok(m.firstname === 'John' && m.lastname === 'Doe', 'Second undo rolls back another change (different fields).')

  m.redo(2)
  t.ok(m.firstname === 'Jill' && m.lastname === 'Rey', 'Redo advances the transaction log forward.')

  m.undo(2)
  m.firstname = 'Billy'
  m.lastname = 'Bob'
  m.undo(2)
  t.ok(m.firstname === 'John' && m.lastname === 'Doe', 'Rollback limited to start of transaction log.')

  m.redo(10)
  t.ok(m.firstname === 'Billy' && m.lastname === 'Bob', 'Transaction log rewritten at appropriate location.')

  t.end()
})

test('NGN.DATA.Model Virtual Field Caching', function (t) {
  var Model = new NGN.DATA.Model(meta())
  var model = new Model()

  t.ok(model.METADATA.fields.virtual.METADATA.caching === true, 'Caching enabled by default.')
  t.ok(model.METADATA.fields.virtual.METADATA.cachedValue === model.METADATA.fields.virtual.METADATA.CACHEKEY, 'Cache is empty before first reference to virtual field.')

  var throwAway = model.virtual
  t.ok(throwAway === 'test 15' && model.METADATA.fields.virtual.METADATA.cachedValue === 'test 15', 'Cache is set after first reference to virtual field.')

  // Wait for cache.clear event to complete the test.
  model.funnelOnce(['field.cache.clear', 'done'], 'end.test')
  model.once('end.test', function () {
    t.pass('cache.clear event triggered.')
    t.end()
  })

  model.val = 11
  t.ok(model.virtual === 'test 11', 'Successfully cleared cache and returned updated value.')
  t.ok(model.METADATA.fields.virtual.METADATA.cachedValue === 'test 11', 'Updated cache value.')

  model.emit('done')
})