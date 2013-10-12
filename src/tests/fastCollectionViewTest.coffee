{assert} = chai
{ut} = window


describe 'Giraffe.Contrib.FastCollectionView', ->

  FastCollectionView = Giraffe.Contrib.FastCollectionView

  fcvDefaults =
    modelTemplate: '<li></li>'
    modelTemplateStrategy: 'underscore-template'

  it 'should be OK', ->
    assert.ok new FastCollectionView(fcvDefaults)

  it 'should be OK with a `modelTemplateStrategy` function', ->
    assert.ok new FastCollectionView(modelTemplateStrategy: -> '')

  it 'should not be OK without a `modelTemplate` or `modelTemplateStrategy` function', (done) ->
    try
      new FastCollectionView
    catch error
      done()

  it 'should render els for a collection passed to the constructor', ->
    collection = new Giraffe.Collection([{}, {}])
    a = new FastCollectionView(_.defaults({collection}, fcvDefaults))
    assert.lengthOf a.$el.children(), 0
    a.render()
    assert.lengthOf a.children, 0
    assert.lengthOf a.$el.children(), 2

  it 'should render els for a plain array passed to the constructor', ->
    collection = [{}, {}]
    a = new FastCollectionView(_.defaults({collection}, fcvDefaults))
    assert.lengthOf a.$el.children(), 0
    a.render()
    assert.lengthOf a.children, 0
    assert.lengthOf a.$el.children(), 2

  it 'should render models views when extended', ->
    collection = new Giraffe.Collection([{}, {}])
    A = FastCollectionView.extend(_.defaults({collection}, fcvDefaults))
    a = new A
    a.attachTo ut.getEl()
    assert.lengthOf a.$el.children(), 2

  it 'should sync when the collection is reset', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo ut.getEl()
    a.addOne {}
    assert.lengthOf a.$el.children(), 1
    a.collection.reset [{}, {}]
    assert.lengthOf a.$el.children(), 2

  it 'should sync when models are added to the collection', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo ut.getEl()
    assert.lengthOf a.$el.children(), 0
    a.collection.add {}
    assert.lengthOf a.$el.children(), 1
    a.collection.add [{}, {}]
    assert.lengthOf a.$el.children(), 3

  it 'should sync when models are added via `addOne`', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo ut.getEl()
    a.addOne {}
    assert.lengthOf a.$el.children(), 1
    a.addOne {}
    assert.lengthOf a.$el.children(), 2
    a.addOne {}
    assert.lengthOf a.$el.children(), 3

  it 'should sync when models are removed from the collection', ->
    a = new FastCollectionView(fcvDefaults)
    a.attachTo ut.getEl()
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
    a.attachTo ut.getEl()
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
    a.attachTo ut.getEl()
    [model1, model2] = a.collection.models
    assert.equal 0, model1.get('foo')
    assert.equal 1, model2.get('foo')
    el1 = a.findElByModel(model1)
    el2 = a.findElByModel(model2)
    ut.assert.siblings el1, el2
    model1.set 'foo', 2
    collection.sort() # TODO should this be automated from the comparator?
    [model1, model2] = a.collection.models
    assert.equal 1, model1.get('foo')
    assert.equal 2, model2.get('foo')
    el1 = a.findElByModel(model1)
    el2 = a.findElByModel(model2)
    ut.assert.siblings el1, el2

  it 'should keep model views sorted when a new model is added', ->
    collection = new Giraffe.Collection([{foo: 0}, {foo: 2}], comparator: 'foo')
    a = new FastCollectionView(_.defaults({collection}, fcvDefaults))
    a.addOne foo: 1
    [model1, model2, model3] = collection.models
    el1 = a.findElByModel(model1)
    el2 = a.findElByModel(model2)
    el3 = a.findElByModel(model3)
    ut.assert.siblings el1, el2
    ut.assert.siblings el2, el3

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
    ut.assert.hasText a, 'bar', className

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
    ut.assert.hasText a, 'bar', className

  it 'should re-render when a model changes by default', ->
    model = new Giraffe.Model(foo: 'bar')
    a = new FastCollectionView
      collection: [model]
      modelTemplateStrategy: -> "<div class='test'>#{model.get("foo")}</div>"
    a.render()
    ut.assert.hasText a, 'bar'
    model.set 'foo', 'baz'
    ut.assert.hasText a, 'baz'

  it 'should not re-render when a model changes if `renderOnChange` is false', ->
    model = new Giraffe.Model(foo: 'bar')
    a = new FastCollectionView
      collection: [model]
      modelTemplateStrategy: -> "<div class='test'>#{model.get("foo")}</div>"
      renderOnChange: false
    a.render()
    ut.assert.hasText a, 'bar'
    model.set 'foo', 'baz'
    ut.assert.hasText a, 'bar'