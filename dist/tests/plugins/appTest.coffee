{assert} = chai
{ut} = window


assertAppEventsOption = (ctor, optionsArgIndex, args) ->
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


describe 'Giraffe.plugins.App', ->

  it 'should be OK', ->
    assert.ok new Giraffe.App

  it 'should attach the global Giraffe.app instance', ->
    Giraffe.app?.dispose()
    app = new Giraffe.App
    assert.equal Giraffe.app, app

  it 'should clear the global Giraffe.app instance when disposed', ->
    Giraffe.app?.dispose()
    app = new Giraffe.App
    app.dispose()
    assert.notEqual Giraffe.app, app

  it 'should not override the global Giraffe.app instance', ->
    Giraffe.app?.dispose()
    app1 = new Giraffe.App
    app2 = new Giraffe.App
    assert.equal Giraffe.app, app1

  it 'should add `this.app` to an automatically configured Giraffe object', ->
    Giraffe.app?.dispose()
    app = new Giraffe.App
    view = new Giraffe.View
    assert.equal Giraffe.app, view.app

  it 'should clear `this.app` on an automatically configured Giraffe object when disposed', ->
    Giraffe.app?.dispose()
    app = new Giraffe.App
    view = new Giraffe.View
    view.dispose()
    assert.equal null, view.app

  it 'should add `this.app` to a manually configured pojo', ->
    Giraffe.app?.dispose()
    app = new Giraffe.App
    obj = {}
    Giraffe.configure obj
    assert.equal app, obj.app

  it 'should clear `this.app` on a manually configured pojo when disposed', ->
    Giraffe.app?.dispose()
    app = new Giraffe.App
    obj = {}
    Giraffe.configure obj
    obj.dispose()
    assert.equal null, obj.app

  it 'should listen to `appEvents` on a configured instance of Backbone.Events', (done) ->
    Giraffe.app?.dispose()
    app = new Giraffe.App
    obj = appEvents: 'foo': -> done()
    _.extend obj, Backbone.Events
    Giraffe.configure obj
    app.trigger 'foo'

  it 'should enable `appEvents` from an option passed to Giraffe.View', ->
    assertAppEventsOption Giraffe.View

  it 'should enable `appEvents` from an option passed to Giraffe.Model', ->
    assertAppEventsOption Giraffe.Model, 1

  it 'should enable `appEvents` from an option passed to Giraffe.Collection', ->
    assertAppEventsOption Giraffe.Collection, 1

  it 'should enable `appEvents` from an option passed to Giraffe.Contrib.CollectionView', ->
    assertAppEventsOption Giraffe.Contrib.CollectionView

  it 'should enable `appEvents` from an option passed to Giraffe.Contrib.FastCollectionView', ->
    assertAppEventsOption Giraffe.Contrib.FastCollectionView, 0,
      modelTemplate: '<li></li>'
      modelTemplateStrategy: 'underscore-template'