{assert} = chai
{ut} = window


describe 'Giraffe.configure', ->

  Foo = (options) ->
    Giraffe.configure @, options

  _.extend Foo::, Backbone.Events # to enable `dataEvents` and `appEvents`

  it 'should be OK', ->
    assert.ok Giraffe.configure

  it 'should extend the object with `options`', ->
    foo = new Foo(bar: 'baz')
    assert.equal 'baz', foo.bar

  it 'should not extend the object with `options` if `omittedOptions` is `true`', ->
    foo = new Foo(bar: 'baz', omittedOptions: true)
    assert.notEqual 'baz', foo.bar

  it 'should not extend the object with `omittedOptions`', ->
    foo = new Foo(bar: 'baz', omittedOptions: 'bar')
    assert.equal undefined, foo.bar
    assert.equal 'bar', foo.omittedOptions

  it 'should extend the object with the global `defaultOptions`', ->
    Giraffe.defaultOptions.globalOption = 42
    foo = new Foo
    assert.equal 42, foo.globalOption

  it 'should extend the object with the constuctor\'s `defaultOptions`', ->
    Foo.defaultOptions = ctorOption: 42
    foo = new Foo
    assert.equal 42, foo.ctorOption

  it 'should extend the object with the object\'s `defaultOptions`', ->
    Foo::defaultOptions = protoOption: 42
    foo = new Foo
    assert.equal 42, foo.protoOption

  it 'should give proper precedence to the instance\'s `defaultOptions`', ->
    Giraffe.defaultOptions.option = 1
    Foo.defaultOptions = option: 2
    foo = new Foo
    assert.equal 2, foo.option
    Foo::defaultOptions = option: 3
    foo = new Foo
    assert.equal 3, foo.option

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