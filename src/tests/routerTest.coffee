{assert} = chai
{ut, sinon, _} = window


describe 'Giraffe.Router', ->

  it 'should be OK', ->
    router = new Giraffe.Router
      app : 
        addChild : ->
      triggers : {}
    assert.ok router

  it 'should trigger app events on successful routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback()
    router = new Giraffe.Router
      app : 
        addChild : ->
        trigger : (appEvent, args..., route) ->
          assert appEvent is 'app:event', "expected appEvent to be 'app:event', got '#{appEvent}'"
          assert route is 'route', "expected route to be 'route', got '#{route}'"
          done()
      triggers :
        'route' : 'app:event'
    Giraffe.Router::route.restore()

  it 'should pass route arguments on successful routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback(1, 2, 3, 4)
    router = new Giraffe.Router
      app : 
        addChild : ->
        trigger : (appEvent, args..., route) ->
          assert _.isEqual(args, [1,2,3,4]), "expected args to be [1,2,3,4] , got '#{args.toString()}'"
          done()
      triggers :
        'route' : 'app:event'
    Giraffe.Router::route.restore()

  it 'should redirect on absolute redirect routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback()
    router = new Giraffe.Router
      app : 
        addChild : ->
      triggers :
        'route' : '-> redirect'
    sinon.stub router, 'navigate', (route, trigger) ->
      assert route is 'redirect', "expected route to be 'route', got '#{route}'"
      assert trigger
      done()
    Giraffe.Router::route.restore()

  it 'should redirect on relative redirect routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback()
    router = new Giraffe.Router
      app : 
        addChild : ->
      triggers :
        'route' : '=> redirect'
      namespace : 'namespace'
    sinon.stub router, 'navigate', (route, trigger) ->
      assert route is 'namespace/redirect', "expected route to be 'namespace/redirect', got '#{route}'"
      assert trigger, trigger, "expected trigger to be true"
      done()
    Giraffe.Router::route.restore()


    
