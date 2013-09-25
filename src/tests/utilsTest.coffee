{assert} = chai


ut = window.ut = {} # TODO commonJS


ut.getEl = (el) ->
  $('<div class="test-div"></div>').appendTo(el or 'body')

ut.areSiblings = (a, b) ->
  $a = a.$el or if a instanceof $ then a else $(a)
  bEl = b.$el?[0] or if b instanceof $ then b[0] else b
  $a.next()[0] is bEl and !!bEl

ut.hasText = ($el, text) ->
  text is $el.text().trim()


ut.assertNested = (child, parent) ->
  assert.ok _.contains(parent.children, child)
  assert.equal parent, child.parent

ut.assertNotNested = (child, parent) ->
  assert.ok !_.contains(parent.children, child)
  assert.notEqual parent, child.parent

ut.assertAttached = (child, parent) ->
  if parent instanceof $
    assert.lengthOf parent.find(child.$el or child), 1
  else if _.isArray(child)
    assert.ok _.every(child.children, (v) -> v.isAttached(parent))
  else
    assert.ok child.isAttached(parent)

ut.assertNotAttached = (child, parent) ->
  assert.ok !child.isAttached(parent)

ut.assertDisposed = (view) ->
  assert.ok !view.$el
  assert.ok !view.isAttached()

ut.assertNotDisposed = (view) ->
  assert.ok !!view.$el

ut.assertSiblings = (a, b) ->
  assert.ok ut.areSiblings(a, b)

ut.assertRendered = (view) ->
  assert.ok view._renderedOnce

ut.assertNotRendered = (view) ->
  assert.ok !view._renderedOnce

ut.assertHasText = (view, text, className) ->
  if className
    $el = view.$('.' + className)
  else
    $el = view.$el
  assert.ok $el.length
  assert.ok ut.hasText($el, text)

ut.assertAppEventsOption = (ctor, optionsArgIndex, args) ->
  worked = false
  optionsArgIndex ?= 0
  args ?= undefined for i in [0..optionsArgIndex]
  args = [args] if !_.isArray(args)
  arg = args[optionsArgIndex] ?= {}
  arg.app ?= new Giraffe.App
  arg.appEvents ?= 'foo': -> worked = true
  obj = new ctor(args...)
  obj.app.trigger 'foo'
  assert.ok worked


describe 'Test helper utils', ->

  it 'should get a new element', ->
    $el1 = ut.getEl()
    $el2 = ut.getEl()
    assert.notEqual $el1[0], $el2[0]
    assert.lengthOf $el1, 1
    assert.lengthOf $el2, 1

  it 'should test a nested relationship', ->
    parent = {}
    child1 = {parent}
    child2 = {parent}
    parent.children = [child1, child2]
    ut.assertNested child1, parent
    ut.assertNested child2, parent
    ut.assertNotNested parent, child1
    ut.assertNotNested child1, child2

  it 'should test an ordered sibling relationship', ->
    $el = ut.getEl()
    $a = ut.getEl($el)
    $b = ut.getEl($el)
    $c = ut.getEl($el)
    ut.assertSiblings $a, $b
    ut.assertSiblings $b, $c
    ut.assertSiblings $a[0], $b[0]
    ut.assertSiblings $b[0], $c[0]
    assert.ok ut.areSiblings($a, $b)
    assert.ok !ut.areSiblings($b, $a)
    assert.ok !ut.areSiblings($c, $a)
    assert.ok !ut.areSiblings($c, $b)
    assert.ok !ut.areSiblings($a, $a)

  it 'should detect if a view or el contains text', ->
    a = new Giraffe.View
    a.$el.append '<div class="my-class">;)</div>'
    ut.assertHasText a, ';)', 'my-class'
    assert.ok ut.hasText(a.$el.find('.my-class'), ';)')
    assert.ok ut.hasText(a.$el, ';)')
    assert.ok !ut.hasText(a.$el, ';(')

