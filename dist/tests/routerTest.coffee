{assert} = chai
{ut, sinon, _} = window


describe 'Giraffe.Router', ->

  it 'should be OK', ->
    router = new Giraffe.Router
      app: 
        addChild: ->
      triggers: {}
    assert.ok router
  
  it 'should call Giraffe.configure on itself on startup', ->
    configure = sinon.spy Giraffe, 'configure'
    try
      router = new Giraffe.Router
        app:
          addChild: ->
        triggers : {}
    catch e
      Giraffe.configure.restore()
      throw e
    Giraffe.configure.restore()
    assert configure.calledOnce, "Giraffe.configure was not called"
    assert configure.calledWith(router), "Giraffe.configure was not called with the router"

  it 'should add itself as a child to the app on startup', ->
    router = new Giraffe.Router
      app:
        addChild: sinon.spy ->
      triggers : {}
    assert router.app.addChild.calledOnce, "app.addChild was not called"
    assert router.app.addChild.calledWith(router), "app.addChild was not called with the router"


  it 'should register routes on startup', ->
    route = sinon.stub Giraffe.Router::, 'route', (rt, appEvent, callback) ->
      assert rt is 'route', "expected route to be 'route', got '#{rt}'"
      assert appEvent is 'app:event', "expected appEvent to be 'app:event', got '#{appEvent}'"
    try
      router = new Giraffe.Router
        app: 
          addChild: ->
        triggers:
          'route': 'app:event'
    catch e
      Giraffe.Router::route.restore()
      throw e
    Giraffe.Router::route.restore()
    assert route.calledOnce, "expected router.route to be called"

  it 'should trigger app events on successful routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback()
        assert router.app.trigger.calledOnce, "expected app event to be triggered"
    try
      router = new Giraffe.Router
        app: 
          addChild: ->
          trigger: sinon.spy (appEvent, args..., route) ->
            assert appEvent is 'app:event', "expected appEvent to be 'app:event', got '#{appEvent}'"
            assert route is 'route', "expected route to be 'route', got '#{route}'"
            done()
        triggers:
          'route': 'app:event'
    catch e
      Giraffe.Router::route.restore()
      throw e
    Giraffe.Router::route.restore()

  it 'should pass route arguments on successful routes', (done) ->
    testArgs = [1, 'string']
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback testArgs...
        assert router.app.trigger.calledOnce, "expected app event to be triggered"
    try
      router = new Giraffe.Router
        app: 
          addChild: ->
          trigger: sinon.spy (appEvent, args..., route) ->
            assert _.isEqual(args, testArgs), "expected args to be #{testArgs.toString()} , got '#{args.toString()}'"
            done()
        triggers:
          'route': 'app:event'
     catch e
       Giraffe.Router.route.restore()
       throw e
    Giraffe.Router::route.restore()
    
  it 'should redirect on absolute redirect routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback()
        assert navigate.calledOnce, "expected route.navigate to be called"
    try
      router = new Giraffe.Router
        app: 
          addChild: ->
        triggers:
          'route': '-> redirect'
    catch e
      Giraffe.Router::route.restore()
      throw e
    navigate = sinon.stub router, 'navigate', (route, trigger) ->
      assert route is 'redirect', "expected route to be 'route', got '#{route}'"
      assert trigger, "expected trigger to be true"
      done()
    Giraffe.Router::route.restore()

  it 'should redirect on relative redirect routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback()
        assert navigate.calledOnce, "expected route.navigate to be called"
    try
      router = new Giraffe.Router
        app: 
          addChild: ->
        triggers:
          'route': '=> redirect'
        namespace: 'namespace'
    catch e
      Giraffe.Router::route.restore()
      throw e
    navigate = sinon.stub router, 'navigate', (route, trigger) ->
      assert route is 'namespace/redirect', "expected route to be 'namespace/redirect', got '#{route}'"
      assert trigger, trigger, "expected trigger to be true"
      done()
    Giraffe.Router::route.restore()

  it 'should cause a history navigation on matched routes with method "cause"', ->
    navigate = sinon.stub Backbone.history, 'navigate', (route, trigger) ->
      assert route is 'route', "expected route to be 'route', got '#{route}'"
      assert trigger, "expected trigger to be true"
    try
      router = new Giraffe.Router
        app:
          addChild: ->
        triggers: {}
      sinon.stub router, 'getRoute', ->
        'route'
      router.cause 'app:event'
    catch e
      Backbone.history.navigate.restore()
      throw e
    Backbone.history.navigate.restore()
    assert navigate.calledOnce, "expected Backbone.history.navigate to be called"

  it 'should trigger app events on unmatched routes with method "cause"', ->
    router = new Giraffe.Router
      app: 
        addChild: ->
        trigger: sinon.spy (appEvent, args..., route) ->
          assert appEvent is 'app:event', "expected appEvent to be 'app:event', got #{appEvent}"
      triggers: {}
    sinon.stub router, 'getRoute', ->
      undefined
    router.cause('app:event')
    assert router.app.trigger.calledOnce, "expected app event to be triggered"

  it 'should return matched routes with method "getRoute"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers : 
        'route' : 'app:event'
    route = router.getRoute 'app:event'
    assert route is '#route', "expected returned route to be '#route', got '#{route}'"

  it 'should return null for unmatched routes with method "getRoute"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers : {}
    route = router.getRoute 'app:event'
    assert route is null, "expected route to be null, got '#{route}'"

  it 'should replace parameters in routes with passed arguments with method "getRoute"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers: 
        'route/:a/*b' : 'app:event'
    route = router.getRoute 'app:event', 1, 'string'
    assert route is '#route/1/string', "expected route to be '#route/1/string', got '#{route}'"
  
  it 'should return true if route is caused with method "isCaused"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers: {}
    sinon.stub router, 'getRoute', -> 'route'
    sinon.stub router, '_getLocation', -> 'route'
    isCaused = router.isCaused 'app:event'
    assert router.getRoute.calledOnce, "expected router.getRoute to be called"
    assert router._getLocation.calledOnce, "expected router._getLocation to be called"
    assert isCaused, "expected router.isCaused to return true"

  it 'should return false if route is not caused with method "isCaused"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers: {}
    sinon.stub router, 'getRoute', -> 'route1'
    sinon.stub router, '_getLocation', -> 'route2'
    isCaused = router.isCaused 'app:event'
    assert router.getRoute.calledOnce, "expected router.getRoute to be called"
    assert router._getLocation.calledOnce, "expected router._getLocation to be called"
    assert not isCaused, "expected router.isCaused to return false"

  it 'should return false if route is null with method "isCaused"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers: {}
    sinon.stub router, 'getRoute', -> null
    sinon.stub router, '_getLocation', -> 'route'
    isCaused = router.isCaused 'app:event'
    assert router.getRoute.calledOnce, "expected router.getRoute to be called"
    assert not isCaused, "expected router.isCaused to return false"