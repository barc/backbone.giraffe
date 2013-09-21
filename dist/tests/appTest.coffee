{assert} = chai


$newEl = ->
  $('<div class="test-div"></div>').appendTo('body')


assertNested = (child, parent) ->
  assert.ok _.contains(parent.children, child)
  assert.equal parent, child.parent

assertNotNested = (child, parent) ->
  assert.ok !_.contains(parent.children, child)
  assert.notEqual parent, child.parent

assertAttached = (child, parent) ->
  assert.ok child.isAttached(parent)

assertNotAttached = (child, parent) ->
  assert.ok !child.isAttached(parent)

assertDisposed = (view) ->
  assert.ok !view.$el

assertNotDisposed = (view) ->
  assert.ok !!view.$el


describe 'Giraffe.View', ->

  it 'should be OK', ->
    view = new Giraffe.View
    assert.ok view

  it 'should attach a view to the DOM', ->
    a = new Giraffe.View
    $el = $newEl()
    a.attachTo $el
    assert.ok a.isAttached()

  it 'should insert a view before another with method "before"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    b.attachTo $newEl()
    a.attachTo b, method: 'before'
    assert.equal a.$el.next()[0], b.$el[0]

  it 'should insert a view after another with method "after"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    a.attachTo $newEl()
    b.attachTo a, method: 'after'
    assert.equal a.$el.next()[0], b.$el[0]

  it 'should insert a view and replace the current contents with method "html"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = $newEl()
    a.attachTo $el
    b.attachTo $el, method: 'html'
    assert.ok !a.isAttached()

  it 'should insert a view at the end of the target\'s children with "append"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = $newEl()
    a.attachTo $el
    b.attachTo $el, method: 'append'
    assert.ok a.$el.next().is(b.$el)

  it 'should insert a view at the beginning of the target\'s children with "prepend"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = $newEl()
    b.attachTo $el
    a.attachTo $el, method: 'prepend'
    assert.ok a.$el.next().is(b.$el)

  it 'should render a view when attached', (done) ->
    a = new Giraffe.View
      afterRender: -> done()
    a.attachTo $newEl()

  it 'should suppress render on a view when attached using `attachTo`', ->
    a = new Giraffe.View
      afterRender: -> assert.fail()
    a.attachTo $newEl(), suppressRender: true

  it 'should suppress render on a view when attached using `attach`', ->
    a = new Giraffe.View
      afterRender: -> assert.fail()
    b = new Giraffe.View
    b.attach a, suppressRender: true

  it 'should dispose of a view', ->
    a = new Giraffe.View
    a.dispose()
    assertDisposed a

  it 'should remove the view from the DOM on dispose', ->
    a = new Giraffe.View
    $el = $newEl()
    a.attachTo $el
    assertAttached a, $el
    a.dispose()
    assertDisposed a
    assert.ok !a.isAttached()

  it 'should fire the event "disposed" when disposed', (done) ->
    a = new Giraffe.View
    a.on "disposed", -> done()
    a.dispose()

  it 'should detach a view, disposing of it', ->
    a = new Giraffe.View
    a.attachTo $newEl()
    a.detach()
    assertDisposed a

  it 'should detach a view and not dispose it due to passing `true` to `detach`', ->
    a = new Giraffe.View
    a.attachTo $newEl()
    a.detach true
    assertNotDisposed a

  it 'should detach a view and not dispose due to passing `disposeOnDetach` to the view', ->
    a = new Giraffe.View(disposeOnDetach: false)
    a.attachTo $newEl()
    a.detach()
    assertNotDisposed a

  it 'should nest a view with attach', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    parent.attach child
    assertNested child, parent
    assertAttached child, parent

  it 'should nest a view with attachTo', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    child.attachTo parent
    assertNested child, parent
    assertAttached child, parent

  it 'should dispose the child views when the parent removes them', ->
    parent = new Giraffe.View
    child1 = new Giraffe.View
    child2 = new Giraffe.View(disposeOnDetach: false) # should still be disposed
    parent.attach child1
    parent.attach child2
    parent.removeChildren()
    assertDisposed child1
    assertDisposed child2
    assert.equal 0, parent.children.length

  it 'should remove children but not dispose them when preserved', ->
    parent = new Giraffe.View
    child1 = new Giraffe.View
    child2 = new Giraffe.View
    parent.attach child1
    parent.attach child2
    parent.removeChildren true
    assertNotDisposed child1
    assertNotDisposed child2
    assert.equal 0, parent.children.length

  it 'should dispose the child view when the parent renders', (done) ->
    parent = new Giraffe.View
    child = new Giraffe.View
    parent.attach child
    child.on 'disposed', -> done()
    parent.render()
    assertNotNested child, parent
    assertDisposed child

  it 'should not dispose of a cached view', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View(disposeOnDetach: false)
    parent.attach child
    child.attach grandchild
    child.render()
    assertNested child, parent
    assertNested grandchild, child
    assertNotDisposed grandchild

  it 'should add and remove some children', ->
    parent = new Giraffe.View
    a = new Giraffe.View
    b = new Giraffe.View
    c = new Giraffe.View

    parent.attach a
    parent.attach b
    parent.attach c

    assertNested a, parent
    assertNested b, parent
    assertNested c, parent
    assert.equal 3, parent.children.length

    c.dispose()
    assertNotNested c, parent
    assertDisposed c
    assert.equal 2, parent.children.length

    parent.removeChild a
    assertNotNested a, parent
    assertDisposed a
    assert.equal 1, parent.children.length

    parent.removeChild b, true
    assertNotNested b, parent
    assertNotDisposed b
    assert.equal 0, parent.children.length

  it 'should invoke a method up the view hierarchy', (done) ->
    parent = new Giraffe.View({done})
    child = new Giraffe.View
    grandchild = new Giraffe.View
    child.attachTo parent
    grandchild.attachTo child
    grandchild.invoke 'done'

  it 'should listen for data events', (done) ->
    parent = new Giraffe.View
      view: new Giraffe.View
      dataEvents:
        'done view': -> done()
    parent.view.trigger 'done'


describe 'Giraffe.App', ->

  it 'should be OK', ->
    app = new Giraffe.App
    assert.ok app

  it 'should accept appEvents on extended class', (done) ->
    MyApp = Giraffe.App.extend
      appEvents:
        'app:initialized': -> done()
    app = new MyApp
    app.start()

  it 'should accept appEvents as an option', (done) ->
    app = new Giraffe.App
      appEvents:
        'app:initialized': -> done()
    app.start()


describe 'Giraffe.Contrib.CollectionView', ->

  it 'should be OK', ->
    a = new Giraffe.Contrib.CollectionView
    assert.ok !!a

  it 'should render child views', ->
    collection = new Giraffe.Collection([{}, {}])
    a = new Giraffe.Contrib.CollectionView({collection})
    a.attachTo $newEl()
    assert.equal 2, a.children.length
    assertAttached a.children[0], a
    assertAttached a.children[1], a

  it 'should keep child views sorted', ->
    collection = new Giraffe.Collection([{foo:1}, {foo:0}], comparator: "foo")
    a = new Giraffe.Contrib.CollectionView({collection})
    a.attachTo $newEl()
    assert.equal 0, a.children[0].model.get("foo")
    assert.equal 1, a.children[1].model.get("foo")
    assert.ok a.children[0].$el.next().is(a.children[1].$el)
    a.children[0].model.set "foo", 2
    collection.sort() # TODO should this be automated from teh comparator?
    assert.equal 1, a.children[0].model.get("foo")
    assert.equal 2, a.children[1].model.get("foo")
    assert.ok a.children[0].$el.next().is(a.children[1].$el)