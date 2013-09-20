{assert} = chai


assertNested = (child, parent) ->
  assert.ok _.contains(parent.children, child)
  assert.equal parent, child.parent

assertNotNested = (child, parent) ->
  assert.ok !_.contains(parent.children, child)
  assert.notEqual parent, child.parent

assertAttached = (child, parent) ->
  assert.equal 1, parent.$el.children(child.$el).length

assertDisposed = (obj) ->
  obj.app is null

assertNotDisposed = (obj) ->
  !!obj.app


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

  it 'should dispose the child view when the parent renders', (done) ->
    parent = new Giraffe.View
    child = new Giraffe.View
    parent.attach child
    child.on "disposed", -> done()
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
    assertDisposed c
    assert.equal 2, parent.children.length
    parent.removeChild a
    assertNotNested a, parent
    assertNotDisposed a, parent
    assert.equal 1, parent.children.length
    parent.render()
    assertNotNested c, parent
    assertDisposed c, parent
    assert.equal 0, parent.children.length

  it 'should invoke a method up the view hierarchy', (done) ->
    parent = new Giraffe.View({done})
    child = new Giraffe.View
    child.attachTo parent
    child.invoke "done"

  it 'should listen for data events', (done) ->
    parent = new Giraffe.View
      view: new Giraffe.View
      dataEvents:
        "disposed view": -> done()
    parent.view.dispose()