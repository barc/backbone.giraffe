{assert} = chai


describe 'Giraffe.Contrib.CollectionView', ->

  CollectionView = Giraffe.Contrib.CollectionView

  it 'should be OK', ->
    assert.ok new CollectionView

  it 'should render model views for a collection passed to the constructor', ->
    collection = new Giraffe.Collection([{}, {}])
    a = new CollectionView({collection})
    a.attachTo ut.getEl()
    assert.lengthOf a.children, 2
    [child1, child2] = a.children
    ut.assertAttached child1, a.$el
    ut.assertAttached child2, a.$el
    ut.assertRendered child1
    ut.assertRendered child2
    ut.assertSiblings child1, child2

  it 'should render model views for a plain array passed to the constructor', ->
    collection = [{}, {}]
    a = new CollectionView({collection})
    a.attachTo ut.getEl()
    assert.lengthOf a.children, 2
    [child1, child2] = a.children
    ut.assertAttached child1, a.$el
    ut.assertAttached child2, a.$el
    ut.assertRendered child1
    ut.assertRendered child2
    ut.assertSiblings child1, child2

  it 'should render model views added after initialization', ->
    collection = new Giraffe.Collection
    a = new CollectionView({collection})
    a.attachTo ut.getEl()
    assert.lengthOf a.children, 0
    a.addOne {}
    assert.lengthOf a.children, 1
    child = a.children[0]
    ut.assertAttached child, a.$el
    ut.assertRendered child

  it 'should render models views when extended', ->
    collection = new Giraffe.Collection([{}, {}])
    A = CollectionView.extend({collection})
    a = new A
    a.attachTo ut.getEl()
    assert.lengthOf a.children, 2
    ut.assertAttached a.children[0], a.$el
    ut.assertAttached a.children[1], a.$el

  it 'should sync when the collection is reset', ->
    collection = new Giraffe.Collection([{}])
    a = new CollectionView({collection})
    a.attachTo ut.getEl()
    assert.lengthOf a.children, 1
    modelView = a.children[0]
    ut.assertAttached modelView, a.$el
    collection.reset [{}, {}]
    ut.assertDisposed modelView
    assert.lengthOf a.children, 2

  it 'should sync when models are added to the collection', ->
    a = new CollectionView
    a.attachTo ut.getEl()
    a.collection.add {}
    assert.lengthOf a.children, 1
    a.collection.add {}
    assert.lengthOf a.children, 2
    ut.assertAttached a.children

  it 'should sync when models are added via `addOne`', ->
    a = new CollectionView
    a.attachTo ut.getEl()
    a.addOne {}
    assert.lengthOf a.children, 1
    a.addOne {}
    assert.lengthOf a.children, 2
    ut.assertAttached a.children

  it 'should sync when models are removed from the collection', ->
    a = new CollectionView
    a.attachTo ut.getEl()
    a.collection.add [{}, {}]
    assert.lengthOf a.children, 2
    [modelView1, modelView2] = a.children
    assert.ok modelView1 and modelView2
    assert.ok modelView1.isAttached()
    assert.ok modelView2.isAttached()
    a.collection.remove a.collection.at(0)
    assert.lengthOf a.children, 1
    ut.assertDisposed modelView1
    ut.assertNotDisposed modelView2
    a.collection.remove a.collection.at(0)
    assert.lengthOf a.children, 0
    ut.assertDisposed modelView2

  it 'should sync when models are removed via `removeOne`', ->
    a = new CollectionView
    a.attachTo ut.getEl()
    a.collection.add [{}, {}]
    assert.lengthOf a.children, 2
    [modelView1, modelView2] = a.children
    assert.ok modelView1 and modelView2
    assert.ok modelView1.isAttached()
    assert.ok modelView2.isAttached()
    a.removeOne a.collection.at(0)
    assert.lengthOf a.children, 1
    ut.assertDisposed modelView1
    ut.assertNotDisposed modelView2
    a.removeOne a.collection.at(0)
    assert.lengthOf a.children, 0
    ut.assertDisposed modelView2

  it 'should keep model views sorted when a value changes', ->
    collection = new Giraffe.Collection([{foo: 1}, {foo: 0}], comparator: 'foo')
    a = new CollectionView({collection})
    a.attachTo ut.getEl()
    [child1, child2] = a.children
    assert.equal 0, child1.model.get('foo')
    assert.equal 1, child2.model.get('foo')
    ut.assertSiblings child1, child2
    a.children[0].model.set 'foo', 2
    collection.sort() # TODO should this be automated from the comparator?
    [child1, child2] = a.children
    assert.equal 1, child1.model.get('foo')
    assert.equal 2, child2.model.get('foo')
    ut.assertSiblings child1, child2
    ut.assertAttached a.children

  it 'should keep model views sorted when a new model is added', ->
    collection = new Giraffe.Collection([{foo: 0}, {foo: 2}], comparator: 'foo')
    a = new CollectionView({collection})
    a.addOne foo: 1
    [child1, child2, child3] = a.children
    ut.assertSiblings child1, child2
    ut.assertSiblings child2, child3
    ut.assertAttached a.children

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
    ut.assertAttached child1, a.$('.' + className)
    a.addOne {}
    child2 = a.children[1]
    ut.assertAttached child2, a.$('.' + className)
    ut.assertSiblings child1, child2

  it 'should accept View#ui names for `modelViewEl`', ->
    className = 'my-model-view-el'
    a = new CollectionView
      ui:
        $myModelViewEl: '.' + className
      modelViewEl: '$myModelViewEl'
      templateStrategy: -> "<div class='#{className}'></div>"
    a.addOne {}
    child = a.children[0]
    ut.assertAttached child, a.$myModelViewEl

  it 'should accept `appEvents` as an option', ->
    ut.assertAppEventsOption CollectionView