{assert} = chai
{ut} = window


describe 'Giraffe.Model', ->

  it 'should be OK', ->
    assert.ok new Giraffe.Model

  it 'should accept `appEvents` as an option', ->
    ut.assert.appEventsOption Giraffe.Model, 1