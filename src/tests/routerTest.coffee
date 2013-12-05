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
    configure = sinon.stub Giraffe, 'configure'
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
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback 1, 2, 3, 4
        assert router.app.trigger.calledOnce, "expected app event to be triggered"
    try
      router = new Giraffe.Router
        app: 
          addChild: ->
          trigger: sinon.spy (appEvent, args..., route) ->
            assert _.isEqual(args, [1,2,3,4]), "expected args to be [1,2,3,4] , got '#{args.toString()}'"
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
    sinon.stub router, 'navigate', (route, trigger) ->
      assert route is 'namespace/redirect', "expected route to be 'namespace/redirect', got '#{route}'"
      assert trigger, trigger, "expected trigger to be true"
      done()
    Giraffe.Router::route.restore()

  it 'should cause a history naviagation on matched routes', ->
    navigate = sinon.stub Backbone.history, 'navigate', (route, trigger) ->
      assert route is 'route', "expected route to be 'route', got '#{route}'"
      assert trigger, "expected trigger to be true"
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers: {}
    sinon.stub router, 'getRoute', ->
      'route'
    try
      router.cause 'app:event'
    catch e
      Backbone.history.navigate.restore()
      throw e
    Backbone.history.navigate.restore()
    assert navigate.calledOnce, "expected Backbone.history.navigate to be called"

  it 'should trigger app events on unmatched routes', ->
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
