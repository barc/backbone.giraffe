{assert} = chai


getEl = (el) ->
  $('<div class="test-div"></div>').appendTo(el or 'body')

areSiblings = (a, b) ->
  $a = a.$el or if a instanceof $ then a else $(a)
  bEl = b.$el?[0] or if b instanceof $ then b[0] else b
  $a.next()[0] is bEl and !!bEl

hasText = ($el, text) ->
  text is $el.text().trim()


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
  assert.ok areSiblings(a, b)

assertRendered = (view) ->
  assert.ok view._renderedOnce

assertNotRendered = (view) ->
  assert.ok !view._renderedOnce

assertHasText = (view, text, className) ->
  if className
    $el = view.$('.' + className)
  else
    $el = view.$el
  assert.ok $el.length
  assert.ok hasText($el, text)


describe 'Assert Helpers', ->

  it 'should get a new element', ->
    $el1 = getEl()
    $el2 = getEl()
    assert.notEqual $el1[0], $el2[0]
    assert.lengthOf $el1, 1
    assert.lengthOf $el2, 1

  it 'should test a nested relationship', ->
    parent = {}
    child1 = {parent}
    child2 = {parent}
    parent.children = [child1, child2]
    assertNested child1, parent
    assertNested child2, parent
    assertNotNested parent, child1
    assertNotNested child1, child2

  it 'should test an ordered sibling relationship', ->
    $el = getEl()
    $a = getEl($el)
    $b = getEl($el)
    $c = getEl($el)
    assertSiblings $a, $b
    assertSiblings $b, $c
    assertSiblings $a[0], $b[0]
    assertSiblings $b[0], $c[0]
    assert.ok areSiblings($a, $b)
    assert.ok !areSiblings($b, $a)
    assert.ok !areSiblings($c, $a)
    assert.ok !areSiblings($c, $b)
    assert.ok !areSiblings($a, $a)

  it 'should detect if a view or el contains text', ->
    a = new Giraffe.View
    a.$el.append '<div class="my-class">;)</div>'
    assertHasText a, ';)', 'my-class'
    assert.ok hasText(a.$el.find('.my-class'), ';)')
    assert.ok hasText(a.$el, ';)')
    assert.ok !hasText(a.$el, ';(')


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

  it 'should dispose the replaced view when using method "html"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    b.attachTo $el, method: 'html'
    assert.ok !a.isAttached()
    assert.ok b.isAttached()
    assertDisposed a
    assertNotDisposed b

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

  it 'should propagate dispose to deeply nested views', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View
    greatgrandchild = new Giraffe.View
    parent.attach child
    child.attach grandchild
    grandchild.attach greatgrandchild
    assertNotDisposed parent
    assertNotDisposed child
    assertNotDisposed grandchild
    assertNotDisposed greatgrandchild
    parent.dispose()
    assertDisposed parent
    assertDisposed child
    assertDisposed grandchild
    assertDisposed greatgrandchild

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

  it 'should not dispose of a cached child view when the parent renders', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View(disposeOnDetach: false)
    parent.attach child
    child.attach grandchild
    child.render()
    assertNested child, parent
    assertNested grandchild, child
    assertAttached child, parent.$el
    assertNotAttached grandchild, child.$el
    assertNotDisposed grandchild

  it 'should not dispose of a child view when the parent renders if `preserve` is `true`', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View
    parent.attach child
    child.attach grandchild
    child.render preserve: true
    assertNested child, parent
    assertNested grandchild, child
    assertAttached child, parent.$el
    assertNotAttached grandchild, child.$el
    assertNotDisposed grandchild

  it 'should add and remove several children as siblings', ->
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

  CollectionView = Giraffe.Contrib.CollectionView

  it 'should be OK', ->
    assert.ok new CollectionView

  it 'should render model views passed to the constructor', ->
    collection = new Giraffe.Collection([{}, {}])
    a = new CollectionView({collection})
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
    a = new CollectionView({collection})
    a.attachTo getEl()
    assert.lengthOf a.children, 0
    a.addOne {}
    assert.lengthOf a.children, 1
    child = a.children[0]
    assertAttached child, a.$el
    assertRendered child

  it 'should render models views when extended', ->
    collection = new Giraffe.Collection([{}, {}])
    A = CollectionView.extend({collection})
    a = new A
    a.attachTo getEl()
    assert.lengthOf a.children, 2
    assertAttached a.children[0], a.$el
    assertAttached a.children[1], a.$el

  it 'should sync when the collection is reset', ->
    collection = new Giraffe.Collection([{}])
    a = new CollectionView({collection})
    a.attachTo getEl()
    assert.lengthOf a.children, 1
    modelView = a.children[0]
    assertAttached modelView, a.$el
    collection.reset [{}, {}]
    assertDisposed modelView
    assert.lengthOf a.children, 2

  it 'should sync when models are added to the collection', ->
    a = new CollectionView
    a.attachTo getEl()
    a.collection.add {}
    assert.lengthOf a.children, 1
    a.collection.add {}
    assert.lengthOf a.children, 2
    assertAttached a.children

  it 'should sync when models are added via `addOne`', ->
    a = new CollectionView
    a.attachTo getEl()
    a.addOne {}
    assert.lengthOf a.children, 1
    a.addOne {}
    assert.lengthOf a.children, 2
    assertAttached a.children

  it 'should sync when models are removed from the collection', ->
    a = new CollectionView
    a.attachTo getEl()
    a.collection.add [{}, {}]
    assert.lengthOf a.children, 2
    [modelView1, modelView2] = a.children
    assert.ok modelView1 and modelView2
    assert.ok modelView1.isAttached()
    assert.ok modelView2.isAttached()
    a.collection.remove a.collection.at(0)
    assert.lengthOf a.children, 1
    assertDisposed modelView1
    assertNotDisposed modelView2
    a.collection.remove a.collection.at(0)
    assert.lengthOf a.children, 0
    assertDisposed modelView2

  it 'should sync when models are removed via `removeOne`', ->
    a = new CollectionView
    a.attachTo getEl()
    a.collection.add [{}, {}]
    assert.lengthOf a.children, 2
    [modelView1, modelView2] = a.children
    assert.ok modelView1 and modelView2
    assert.ok modelView1.isAttached()
    assert.ok modelView2.isAttached()
    a.removeOne a.collection.at(0)
    assert.lengthOf a.children, 1
    assertDisposed modelView1
    assertNotDisposed modelView2
    a.removeOne a.collection.at(0)
    assert.lengthOf a.children, 0
    assertDisposed modelView2

  it 'should keep model views sorted when a value changes', ->
    collection = new Giraffe.Collection([{foo: 1}, {foo: 0}], comparator: 'foo')
    a = new CollectionView({collection})
    a.attachTo getEl()
    [child1, child2] = a.children
    assert.equal 0, child1.model.get('foo')
    assert.equal 1, child2.model.get('foo')
    assertSiblings child1, child2
    a.children[0].model.set 'foo', 2
    collection.sort() # TODO should this be automated from the comparator?
    [child1, child2] = a.children
    assert.equal 1, child1.model.get('foo')
    assert.equal 2, child2.model.get('foo')
    assertSiblings child1, child2
    assertAttached a.children

  it 'should keep model views sorted when a new model is added', ->
    collection = new Giraffe.Collection([{foo: 0}, {foo: 2}], comparator: 'foo')
    a = new CollectionView({collection})
    a.addOne foo: 1
    [child1, child2, child3] = a.children
    assertSiblings child1, child2
    assertSiblings child2, child3
    assertAttached a.children

  it 'should use the `modelView` option to construct the views', ->
    MyModelView = Giraffe.View.extend(foo: 'bar')
    a = new CollectionView
      modelView: MyModelView
    a.addOne {}
    child = a.children[0]
    assert.ok child instanceof MyModelView
    assert.equal 'bar', child.foo

  it 'should pass `modelViewArgs` to the model views', ->
    a = new CollectionView
      modelViewArgs: [foo: 'bar']
    a.addOne {}
    child = a.children[0]
    assert.equal 'bar', child.foo

  it 'should insert the model views in `modelViewEl` if provided', ->
    className = 'my-model-view-el'
    a = new CollectionView
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
    a = new CollectionView
      ui:
        $myModelViewEl: '.' + className
      modelViewEl: '$myModelViewEl'
      templateStrategy: -> "<div class='#{className}'></div>"
    a.addOne {}
    child = a.children[0]
    assertAttached child, a.$myModelViewEl


describe 'Giraffe.Contrib.FastCollectionView', ->

  FastCollectionView = Giraffe.Contrib.FastCollectionView

  fcvDefaults =
    modelTemplate: '<li></li>'
    modelTemplateStrategy: 'underscore-template'

  it 'should be OK', ->
    assert.ok new FastCollectionView(fcvDefaults)

  it 'should render els for models passed to the constructor', ->
    collection = new Giraffe.Collection([{}, {}])
    a = new FastCollectionView(_.defaults({collection}, fcvDefaults))
    assert.lengthOf a.$el.children(), 0
    a.render()
    assert.lengthOf a.children, 0
    assert.lengthOf a.$el.children(), 2

  it 'should render models views when extended', ->
    collection = new Giraffe.Collection([{}, {}])
    A = FastCollectionView.extend(_.defaults({collection}, fcvDefaults))
    a = new A
    a.attachTo getEl()
    assert.lengthOf a.$el.children(), 2

  it 'should sync when the collection is reset', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo getEl()
    a.addOne {}
    assert.lengthOf a.$el.children(), 1
    a.collection.reset [{}, {}]
    assert.lengthOf a.$el.children(), 2

  it 'should sync when models are added to the collection', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo getEl()
    assert.lengthOf a.$el.children(), 0
    a.collection.add {}
    assert.lengthOf a.$el.children(), 1
    a.collection.add [{}, {}]
    assert.lengthOf a.$el.children(), 3

  it 'should sync when models are added via `addOne`', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo getEl()
    a.addOne {}
    assert.lengthOf a.$el.children(), 1
    a.addOne {}
    assert.lengthOf a.$el.children(), 2
    a.addOne {}
    assert.lengthOf a.$el.children(), 3

  it 'should sync when models are removed from the collection', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo getEl()
    a.collection.add {}
    assert.lengthOf a.$el.children(), 1
    a.collection.add {}
    assert.lengthOf a.$el.children(), 2
    a.collection.remove a.collection.at(1)
    assert.lengthOf a.$el.children(), 1
    a.collection.remove a.collection.at(0)
    assert.lengthOf a.$el.children(), 0

  it 'should sync when models are removed via `removeOne`', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo getEl()
    a.collection.add {}
    assert.lengthOf a.$el.children(), 1
    a.collection.add {}
    assert.lengthOf a.$el.children(), 2
    a.removeOne a.collection.at(1)
    assert.lengthOf a.$el.children(), 1
    a.removeOne a.collection.at(0)
    assert.lengthOf a.$el.children(), 0

  it 'should keep model views sorted when a value changes', ->
    collection = new Giraffe.Collection([{foo: 1}, {foo: 0}], comparator: 'foo')
    a = new FastCollectionView(_.defaults({collection}, fcvDefaults))
    a.attachTo getEl()
    [model1, model2] = a.collection.models
    assert.equal 0, model1.get('foo')
    assert.equal 1, model2.get('foo')
    el1 = a.getElByModel(model1)
    el2 = a.getElByModel(model2)
    assertSiblings el1, el2
    model1.set 'foo', 2
    collection.sort() # TODO should this be automated from the comparator?
    [model1, model2] = a.collection.models
    assert.equal 1, model1.get('foo')
    assert.equal 2, model2.get('foo')
    el1 = a.getElByModel(model1)
    el2 = a.getElByModel(model2)
    assertSiblings el1, el2

  it 'should keep model views sorted when a new model is added', ->
    collection = new Giraffe.Collection([{foo: 0}, {foo: 2}], comparator: 'foo')
    a = new FastCollectionView(_.defaults({collection}, fcvDefaults))
    a.addOne foo: 1
    [model1, model2, model3] = collection.models
    el1 = a.getElByModel(model1)
    el2 = a.getElByModel(model2)
    el3 = a.getElByModel(model3)
    assertSiblings el1, el2
    assertSiblings el2, el3

  it 'should use the `modelTemplate` option to construct the DOM', ->
    a = new FastCollectionView
      collection: new Giraffe.Collection(foo: 'bar')
      modelTemplate: '<li><%= attributes.foo %></li>'
      modelTemplateStrategy: 'underscore-template'
    $children = a.$el.children()
    assert.lengthOf $children, 0
    a.render()
    $children = a.$el.children()
    assert.lengthOf $children, 1
    a.addOne foo: 'baz'
    $children = a.$el.children()
    assert.lengthOf $children, 2
    assert.equal 'bar', $children.first().text()
    assert.equal 'baz', $children.last().text()

  it 'should use `modelSerialize` to send custom data to the template', ->
    a = new FastCollectionView
      collection: new Giraffe.Collection(foo: 'bar')
      modelTemplate: '<li><%= foo %></li>'
      modelTemplateStrategy: 'underscore-template'
      modelSerialize: -> # called with this == `fcv.modelTemplateCtx`
        data = @model.toJSON()
        data.cid = @model.cid
        data
    assert.ok !a.$el.text()
    a.render()
    assert.equal 'bar', a.$el.text()

  it 'should insert the model views in `modelEl` if provided', ->
    className = 'my-model-view-el'
    a = new FastCollectionView
      modelEl: '.' + className
      templateStrategy: -> "<ul class='#{className}'></ul>"
      modelTemplate: '<li><%= attributes.foo %></li>'
      modelTemplateStrategy: 'underscore-template'
    a.addOne foo: 'bar'
    assertHasText a, 'bar', className

  it 'should accept View#ui names for `modelEl`', ->
    className = 'my-model-view-el'
    a = new FastCollectionView
      ui:
        $myModelEl: '.' + className
      modelEl: '$myModelEl'
      templateStrategy: -> "<div class='#{className}'></div>"
      modelTemplate: '<li><%= attributes.foo %></li>'
      modelTemplateStrategy: 'underscore-template'
    a.addOne foo: 'bar'
    assertHasText a, 'bar', className