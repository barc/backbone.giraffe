{assert} = chai
{ut} = window


Foo = (options) ->
  Giraffe.configure @, options


describe 'Giraffe.plugins.Extendable', ->

  it 'should extend a configured pojo', ->
    foo = {}
    Giraffe.configure foo, bar: 'baz'
    assert.equal 'baz', foo.bar

  it 'should override pojo properties with options', ->
    foo = bar: 'boo'
    Giraffe.configure foo, bar: 'baz'
    assert.equal 'baz', foo.bar

  it 'should extend a configured object with `options`', ->
    foo = new Foo(bar: 'baz')
    assert.equal 'baz', foo.bar

  it 'should not extend the object with `options` if `options.omittedOptions` is `true`', ->
    foo = new Foo(bar: 'baz', omittedOptions: true)
    assert.notEqual 'baz', foo.bar

  it 'should not extend the object with `options` if `obj.omittedOptions` is `true`', ->
    class F
      omittedOptions: true
    f = new F(bar: 'baz')
    assert.notEqual 'baz', f.bar

  it 'should not extend the object with `omittedOptions`', ->
    foo = new Foo(bar: 'baz', omittedOptions: 'bar')
    assert.equal undefined, foo.bar
    assert.equal 'bar', foo.omittedOptions

  it 'should extend the object with the global `defaultOptions`', ->
    Giraffe.defaultOptions.globalOption = 42
    foo = new Foo
    assert.equal 42, foo.globalOption
    delete Giraffe.defaultOptions.globalOption

  it 'should extend the object with the constuctor\'s `defaultOptions`', ->
    Foo.defaultOptions = ctorOption: 42
    foo = new Foo
    assert.equal 42, foo.ctorOption
    delete Foo.defaultOptions

  it 'should extend the object with the object\'s `defaultOptions`', ->
    Foo::defaultOptions = protoOption: 42
    foo = new Foo
    assert.equal 42, foo.protoOption
    delete Foo::defaultOptions

  describe 'Extendable Giraffe.Model', ->

    it 'should omit the \'parse\' option by default', ->
      model = new Giraffe.Model({}, parse: 'foo', bar: 'baz')
      assert.notEqual 'foo', model.parse
      assert.equal 'baz', model.bar

    it 'should allow the \'parse\' option when configured as an option', ->
      parse = ->
      model = new Giraffe.Model({}, {parse, bar: 'baz', omittedOptions: null})
      assert.equal parse, model.parse

    it 'should allow the \'parse\' option when configured on the class constructor', ->
      opts = Giraffe.Model.defaultOptions.omittedOptions
      Giraffe.Model.defaultOptions.omittedOptions = null
      parse = ->
      model = new Giraffe.Model({}, {parse, bar: 'baz'})
      assert.equal parse, model.parse
      Giraffe.Model.defaultOptions.omittedOptions = opts

  describe 'Extendable Giraffe.Collection', ->

    it 'should omit the \'parse\' option by default', ->
      collection = new Giraffe.Collection([], parse: 'foo', bar: 'baz')
      assert.notEqual 'foo', collection.parse
      assert.equal 'baz', collection.bar