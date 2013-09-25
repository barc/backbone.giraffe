{assert} = chai


describe 'Giraffe.Model', ->

  it 'should be OK', ->
    assert.ok new Giraffe.Model

  it 'should accept `appEvents` as an option', ->
    ut.assertAppEventsOption Giraffe.Model, 1