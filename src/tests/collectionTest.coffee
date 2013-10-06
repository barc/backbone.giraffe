{assert} = chai
{ut} = window


describe 'Giraffe.Collection', ->

  it 'should be OK', ->
    assert.ok new Giraffe.Collection

  it 'should accept `appEvents` as an option', ->
    ut.assert.appEventsOption Giraffe.Collection, 1

  it 'should create instances of `Giraffe.Model` from a plain array passed to the constructor', ->
    collection = new Giraffe.Collection([{}, {}])
    collection.each (model) ->
      assert.ok model instanceof Giraffe.Model
    assert.lengthOf collection, 2

  it 'should propagate `dispose` to all models', ->
    collection = new Giraffe.Collection([{}, {}, {}])
    disposeCount = 0
    collection.each (model) ->
      model.on "disposed", -> disposeCount += 1
    collection.dispose()
    assert.equal 3, disposeCount

  it 'should omit the \'parse\' option by default', ->
    collection = new Giraffe.Collection([], parse: 'foo', bar: 'baz')
    assert.notEqual 'foo', collection.parse
    assert.equal 'baz', collection.bar