{assert} = chai
{ut} = window


describe 'Giraffe.Model', ->

  it 'should be OK', ->
    assert.ok new Giraffe.Model

  it 'should accept `appEvents` as an option', ->
    ut.assert.appEventsOption Giraffe.Model, 1

  it 'should omit the \'parse\' option by default', ->
    model = new Giraffe.Model({}, parse: 'foo', bar: 'baz')
    assert.notEqual 'foo', model.parse
    assert.equal 'baz', model.bar

  it 'should allow the \'parse\' option when configured as an option', ->
    parse = ->
    model = new Giraffe.Model({}, {parse, bar: 'baz', omittedOptions: null})
    assert.equal parse, model.parse

  it 'should allow the \'parse\' option when configured on the class constructor', ->
    Giraffe.Model.defaultOptions.omittedOptions = null
    parse = ->
    model = new Giraffe.Model({}, {parse, bar: 'baz'})
    assert.equal parse, model.parse