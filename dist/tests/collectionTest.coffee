{assert} = chai


describe 'Giraffe.Collection', ->

  it 'should be OK', ->
    assert.ok new Giraffe.Collection

  it 'should accept `appEvents` as an option', ->
    ut.assertAppEventsOption Giraffe.Collection, 1

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
