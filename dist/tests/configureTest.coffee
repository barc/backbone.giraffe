{assert} = chai
{ut} = window


Foo = (options) ->
  Giraffe.configure @, options


describe 'Giraffe.configure', ->

  _.extend Foo::, Backbone.Events # to enable `dataEvents` and `appEvents`

  it 'should be OK', ->
    assert.ok Giraffe.configure

  it 'should give proper precedence to the instance\'s `defaultOptions`', ->
    debugger # how can a new class/obj be configured? Giraffe.configureClass? are all targetted?
      # can it specifically include plugins if they're otherwise locked out by the `target` prop?
      # fundamental tension between wanting to make the plugins "plug and play" for everything
      # and not wanting to apply every plugin to every configured object
      # one possible solution is to let plugins specify a whitelist and blacklist
      # Giraffe.configureClass could also take the plugins you want to attach
        # but then new plugins wouldn't be able to be added to this call list ...
      # the API should expose the ability to directly add a plugin to a class
    Giraffe.defaultOptions.option = 1
    Foo.defaultOptions = option: 2
    foo = new Foo
    assert.equal 2, foo.option
    Foo::defaultOptions = option: 3
    foo = new Foo
    assert.equal 3, foo.option
    delete Giraffe.defaultOptions.option

  it 'should wrap a function with `before` and `after` calls', ->
    count = 0
    foo = new Foo
      bar: ->
      beforeBar: -> count += 1
      afterBar: -> count += 1
    Giraffe.wrapFn foo, 'bar'
    foo.bar()
    assert.equal 2, count

  it 'should call `beforeInitialize` if `initialize` is defined', (done) ->
    foo = new Foo
      initialize: ->
      beforeInitialize: -> done()
    foo.initialize()

  it 'should call `afterInitialize` if `initialize` is defined', (done) ->
    foo = new Foo
      initialize: ->
      afterInitialize: -> done()
    foo.initialize()

  it 'should listen for data events', (done) ->
    foo = new Foo
      model: new Backbone.Model
      dataEvents:
        'done model': -> done()
    foo.model.trigger 'done'

  it 'should listen for data events on an object with `Backbone.Events`', (done) ->
    foo =
      model: new Backbone.Model
      dataEvents:
        'done model': -> done()
    _.extend foo, Backbone.Events
    Giraffe.configure foo
    foo.model.trigger 'done'

  it 'should listen for data events on self', ->
    count = 0
    foo = new Foo
      dataEvents:
        'done this': -> count += 1
        'done @': -> count += 1
    foo.trigger 'done'
    assert.equal 2, count

  it 'should listen for data events on objects created during `initialize`', (done) ->
    foo = new Giraffe.Model {},
      initialize: ->
        @model = new Backbone.Model
      dataEvents:
        'done model': -> done()
    foo.model.trigger 'done'