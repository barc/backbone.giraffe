{assert} = chai


getEl = ->
  $('<div class="test-div"></div>').appendTo('body')


assertNested = (child, parent) ->
  assert.ok _.contains(parent.children, child)
  assert.equal parent, child.parent

assertNotNested = (child, parent) ->
  assert.ok !_.contains(parent.children, child)
  assert.notEqual parent, child.parent

assertAttached = (child, parent) ->
  if parent instanceof $
    assert.lengthOf parent.find(child.$el or child), 1
  else if _.isArray(child)
    assert.ok _.every(child.children, (v) -> v.isAttached(parent))
  else
    assert.ok child.isAttached(parent)

assertNotAttached = (child, parent) ->
  assert.ok !child.isAttached(parent)

assertDisposed = (view) ->
  assert.ok !view.$el
  assert.ok !view.isAttached()

assertNotDisposed = (view) ->
  assert.ok !!view.$el

assertSiblings = (a, b) ->
  bEl = b.$el[0]
  assert.fail() if !bEl
  assert.equal a.$el.next()[0], bEl

assertRendered = (view) ->
  assert.ok view._renderedOnce

assertNotRendered = (view) ->
  assert.ok !view._renderedOnce

assertHasText = (view, text, className) ->
  $content = view.$('.' + className)
  assert.lengthOf $content, 1
  assert.equal text, $content.text().trim()


describe 'Giraffe.View', ->

  it 'should be OK', ->
    view = new Giraffe.View
    assert.ok view

  it 'should render a view', ->
    a = new Giraffe.View
    a.render()
    assertRendered a

  it 'should attach a view to the DOM', ->
    a = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    assert.ok a.isAttached()
    assertAttached a, $el

  it 'should insert a view and replace the current contents with method "html"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    b.attachTo $el, method: 'html'
    assert.ok !a.isAttached()
    assert.ok b.isAttached()

  it 'should insert a view before another with method "before"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    b.attachTo getEl()
    a.attachTo b, method: 'before'
    assertSiblings a, b

  it 'should insert a view after another with method "after"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    a.attachTo getEl()
    b.attachTo a, method: 'after'
    assertSiblings a, b

  it 'should insert a view at the end of the target\'s children with "append"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    b.attachTo $el, method: 'append'
    assertSiblings a, b

  it 'should insert a view at the beginning of the target\'s children with "prepend"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = getEl()
    b.attachTo $el
    a.attachTo $el, method: 'prepend'
    assertSiblings a, b

  it 'should render a view when attached and call `afterRender`', (done) ->
    a = new Giraffe.View
      afterRender: -> done()
    a.attachTo getEl()
    assertRendered a

  it 'should suppress render on a view when attached', ->
    a = new Giraffe.View
      afterRender: -> assert.fail()
    a.attachTo getEl(), suppressRender: true
    assertNotRendered a

  it 'should render content into a view using the default "underscore-template-selector" strategy', ->
    $el = getEl()
    templateId = 'my-render-test-template'
    className = 'render-test'
    text = 'hello world'
    $el.append """
      <script type='text/template' id='#{templateId}'>
        <div class='#{className}'><%= text %></div>
      </script>
    """
    a = new Giraffe.View {
      template: '#' + templateId
      text
    }
    a.render()
    assertHasText a, text, className

  it 'should render content into a view by overriding `templateStrategy`', ->
    $el = getEl()
    className = 'render-test'
    text = 'hello world'
    a = new Giraffe.View {
      templateStrategy: -> """
        <div class='#{className}'>#{@text}</div>
      """
      text
    }
    a.render()
    assertHasText a, text, className

  it 'should render content into a view using the "jst" strategy', ->
    $el = getEl()
    className = 'render-test'
    text = 'hello world'
    a = new Giraffe.View {
      template: -> """
        <div class='#{className}'>#{@text}</div>
      """
      templateStrategy: 'jst'
      text
    }
    a.render()
    assertHasText a, text, className

  it 'should render content into a view using the "underscore-template" strategy', ->
    $el = getEl()
    className = 'render-test'
    text = 'hello world'
    a = new Giraffe.View {
      template: -> """
        <div class='#{className}'><%= text %></div>
      """
      templateStrategy: 'underscore-template'
      text
    }
    a.render()
    assertHasText a, text, className

  it 'should dispose of a view', ->
    a = new Giraffe.View
    a.dispose()
    assertDisposed a

  it 'should remove the view from the DOM on dispose', ->
    a = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    assertAttached a, $el
    a.dispose()
    assertDisposed a

  it 'should fire the event "disposed" when disposed', (done) ->
    a = new Giraffe.View
    a.on 'disposed', -> done()
    a.dispose()

  it 'should detach a view, removing it from the DOM and disposing of it', ->
    a = new Giraffe.View
    a.attachTo getEl()
    a.detach()
    assert.ok !a.isAttached()
    assertDisposed a

  it 'should detach a view and not dispose it due to passing `true` to `detach`', ->
    a = new Giraffe.View
    a.attachTo getEl()
    a.detach true
    assert.ok !a.isAttached()
    assertNotDisposed a

  it 'should detach a view and not dispose due to passing `disposeOnDetach` to the view', ->
    a = new Giraffe.View(disposeOnDetach: false)
    a.attachTo getEl()
    a.detach()
    assert.ok !a.isAttached()
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
    assert.lengthOf parent.children, 0

  it 'should remove children but not dispose them when preserved', ->
    parent = new Giraffe.View
    child1 = new Giraffe.View
    child2 = new Giraffe.View
    parent.attach child1
    parent.attach child2
    parent.removeChildren true
    assertNotDisposed child1
    assertNotDisposed child2
    assert.lengthOf parent.children, 0

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
    assert.lengthOf parent.children, 3

    c.dispose()
    assertNotNested c, parent
    assertDisposed c
    assert.lengthOf parent.children, 2

    parent.removeChild a
    assertNotNested a, parent
    assertDisposed a
    assert.lengthOf parent.children, 1

    parent.removeChild b, true
    assertNotNested b, parent
    assertNotDisposed b
    assert.lengthOf parent.children, 0

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
    assert.ok new Giraffe.App

  it 'should add an initializer and call it on `start`', (done) ->
    a = new Giraffe.App
    a.addInitializer -> done()
    a.start()

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
    assert.ok new Giraffe.Contrib.CollectionView

  it 'should render model views passed to the constructor', ->
    collection = new Giraffe.Collection([{}, {}])
    a = new Giraffe.Contrib.CollectionView({collection})
    a.attachTo getEl()
    assert.lengthOf a.children, 2
    [child1, child2] = a.children
    assertAttached child1, a.$el
    assertAttached child2, a.$el
    assertRendered child1
    assertRendered child2
    assertSiblings child1, child2

  it 'should render model views added after initialization', ->
    collection = new Giraffe.Collection
    a = new Giraffe.Contrib.CollectionView({collection})
    a.attachTo getEl()
    assert.lengthOf a.children, 0
    a.addOne {}
    assert.lengthOf a.children, 1
    child = a.children[0]
    assertAttached child, a.$el
    assertRendered child

  it 'should render models views when extended', ->
    collection = new Giraffe.Collection([{}, {}])
    A = Giraffe.Contrib.CollectionView.extend({collection})
    a = new A
    a.attachTo getEl()
    assert.lengthOf a.children, 2
    assertAttached a.children[0], a.$el
    assertAttached a.children[1], a.$el

  it 'should sync when the collection is reset', ->
    collection = new Giraffe.Collection([{}])
    a = new Giraffe.Contrib.CollectionView({collection})
    a.attachTo getEl()
    assert.lengthOf a.children, 1
    modelView = a.children[0]
    assertAttached modelView, a.$el
    collection.reset([{}, {}])
    assertDisposed modelView
    assert.lengthOf a.children, 2

  it 'should sync when a model is added to the collection', ->
    a = new Giraffe.Contrib.CollectionView
    a.attachTo getEl()
    a.collection.add {}
    assert.lengthOf a.children, 1
    assertAttached a.children

  it 'should sync when a model is added via addOne', ->
    a = new Giraffe.Contrib.CollectionView
    a.attachTo getEl()
    a.collection.add {}
    assert.lengthOf a.children, 1
    assertAttached a.children

  it 'should sync when a model is removed', ->
    a = new Giraffe.Contrib.CollectionView
    a.attachTo getEl()
    a.collection.add {}
    assert.lengthOf a.children, 1
    modelView = a.children[0]
    assert.ok modelView
    assert.ok modelView.isAttached()
    a.collection.remove a.collection.at(0)
    assert.lengthOf a.children, 0
    assertDisposed modelView

  it 'should keep model views sorted when a value changes', ->
    collection = new Giraffe.Collection([{foo: 1}, {foo: 0}], comparator: 'foo')
    a = new Giraffe.Contrib.CollectionView({collection})
    a.attachTo getEl()
    [child1, child2] = a.children
    assert.equal 0, child1.model.get('foo')
    assert.equal 1, child2.model.get('foo')
    assertSiblings child1, child2
    a.children[0].model.set 'foo', 2
    collection.sort() # TODO should this be automated from teh comparator?
    [child1, child2] = a.children
    assert.equal 1, child1.model.get('foo')
    assert.equal 2, child2.model.get('foo')
    assertSiblings child1, child2
    assertAttached a.children

  it 'should keep model views sorted when a new model is added', ->
    collection = new Giraffe.Collection([{foo: 0}, {foo: 2}], comparator: 'foo')
    a = new Giraffe.Contrib.CollectionView({collection})
    a.addOne foo: 1
    [child1, child2, child3] = a.children
    assertSiblings child1, child2
    assertSiblings child2, child3
    assertAttached a.children

  it 'should use the `modelView` option to construct the views', ->
    MyModelView = Giraffe.View.extend(foo: 'bar')
    a = new Giraffe.Contrib.CollectionView
      modelView: MyModelView
    a.addOne {}
    child = a.children[0]
    assert.ok child instanceof MyModelView
    assert.equal 'bar', child.foo
    
  it 'should pass `modelViewArgs` to the model views', ->
    a = new Giraffe.Contrib.CollectionView
      modelViewArgs: [foo: 'bar']
    a.addOne {}
    child = a.children[0]
    assert.equal 'bar', child.foo

  it 'should insert the model views in `modelViewEl` if provided', ->
    className = 'my-model-view-el'
    a = new Giraffe.Contrib.CollectionView
      modelViewEl: '.' + className
      templateStrategy: -> "<div class='#{className}'></div>"
    a.addOne {}
    child1 = a.children[0]
    assertAttached child1, a.$('.' + className)
    a.addOne {}
    child2 = a.children[1]
    assertAttached child2, a.$('.' + className)
    assertSiblings child1, child2

  it 'should accept View#ui names for `modelViewEl`', ->
    className = 'my-model-view-el'
    a = new Giraffe.Contrib.CollectionView
      ui:
        $myModelViewEl: '.' + className
      modelViewEl: '$myModelViewEl'
      templateStrategy: -> "<div class='#{className}'></div>"
    a.addOne {}
    child = a.children[0]
    assertAttached child, a.$myModelViewEl