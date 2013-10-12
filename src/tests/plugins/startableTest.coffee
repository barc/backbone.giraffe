{assert} = chai
{ut} = window


describe 'Giraffe.plugins.Startable', ->

  it 'should be OK', ->
    assert.ok new Giraffe.App

  it 'should add an initializer and call it on `start`', (done) ->
    a = new Giraffe.App
    a.addInitializer -> done()
    a.start()

  it 'should call an initializer even when started', (done) ->
    a = new Giraffe.App
    a.start()
    a.addInitializer -> done()

  it 'should set `started` to `true` when started', ->
    a = new Giraffe.App
    a.start()
    assert.ok a.started

  it 'should extend with options passed to `start`', (done) ->
    a = new Giraffe.App
    a.start {done}
    a.done()

  it 'should extend options to the instance after muting them in an initializer', ->
    a = new Giraffe.App
    a.addInitializer (options) -> options.foo = 'bar'
    a.start()
    assert.equal 'bar', a.foo

  it 'should extend options to the instance after muting them in an initializer even if already started', ->
    a = new Giraffe.App
    a.start()
    a.addInitializer (options) -> options.foo = 'bar'
    assert.equal 'bar', a.foo

  it 'should cascade options in order', ->
    a = new Giraffe.App
    a.addInitializer (options) -> options.foo = 'bar'
    a.addInitializer (options) -> options.foo = 'baz'
    a.start()
    assert.equal 'baz', a.foo

  it 'should call `beforeStart` before starting', (done) ->
    a = new Giraffe.App
      beforeStart: ->
        assert.ok !@started
        done()
    a.start()

  it 'should call `afterStart` after asynchronously starting', (done) ->
    a = new Giraffe.App
      afterStart: ->
        assert.ok @started
        done()
    setTimeout (-> a.start()), 1