{assert} = chai
{ut} = window


ut = window.ut = {} # TODO commonJS


ut.getEl = (el) ->
  $('<div class="test-div"></div>').appendTo(el or 'body')

ut.areSiblings = (a, b) ->
  $a = a.$el or if a instanceof $ then a else $(a)
  bEl = b.$el?[0] or if b instanceof $ then b[0] else b
  $a.next()[0] is bEl and !!bEl

ut.hasText = ($el, text) ->
  text is $el.text().trim()

ut.assert = {}

ut.assert.nested = (child, parent) ->
  assert.ok _.contains(parent.children, child)
  assert.equal parent, child.parent

ut.assert.notNested = (child, parent) ->
  assert.ok !_.contains(parent.children, child)
  assert.notEqual parent, child.parent

ut.assert.attached = (child, parent) ->
  if parent instanceof $
    assert.lengthOf parent.find(child.$el or child), 1
  else if _.isArray(child)
    assert.ok _.every(child.children, (v) -> v.isAttached(parent))
  else
    assert.ok child.isAttached(parent)

ut.assert.notAttached = (child, parent) ->
  assert.ok !child.isAttached(parent)

ut.assert.disposed = (view) ->
  assert.ok !view.$el
  assert.ok !view.isAttached()

ut.assert.notDisposed = (view) ->
  assert.ok !!view.$el

ut.assert.siblings = (a, b) ->
  assert.ok ut.areSiblings(a, b)

ut.assert.rendered = (view) ->
  assert.ok view._renderedOnce

ut.assert.notRendered = (view) ->
  assert.ok !view._renderedOnce

ut.assert.hasText = (view, text, className) ->
  if className
    $el = view.$('.' + className)
  else
    $el = view?.$el or view
  assert.ok $el.length
  assert.ok ut.hasText($el, text)

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
    ut.assert.nested child1, parent
    ut.assert.nested child2, parent
    ut.assert.notNested parent, child1
    ut.assert.notNested child1, child2

  it 'should test an ordered sibling relationship', ->
    $el = ut.getEl()
    $a = ut.getEl($el)
    $b = ut.getEl($el)
    $c = ut.getEl($el)
    ut.assert.siblings $a, $b
    ut.assert.siblings $b, $c
    ut.assert.siblings $a[0], $b[0]
    ut.assert.siblings $b[0], $c[0]
    assert.ok ut.areSiblings($a, $b)
    assert.ok !ut.areSiblings($b, $a)
    assert.ok !ut.areSiblings($c, $a)
    assert.ok !ut.areSiblings($c, $b)
    assert.ok !ut.areSiblings($a, $a)

  it 'should detect if a view or el contains text', ->
    a = new Giraffe.View
    a.$el.append '<div class="my-class">;)</div>'
    ut.assert.hasText a, ';)', 'my-class'
    assert.ok ut.hasText(a.$el.find('.my-class'), ';)')
    assert.ok ut.hasText(a.$el, ';)')
    assert.ok !ut.hasText(a.$el, ';(')

