{assert} = chai
{ut, sinon, _, $} = window


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

  it 'should pass query parameters on successful routes with query parameters', (done) ->
    testParams = 
      num: 2
      string: 'foo'
      bool : true
      obj:
        num: 3
        string: 'bar'
        arr : ['baz', 4]
      arr : ['qux', 5, {string:'quux', num:6}]
    testArgs = [1, 'string', "?#{$.param testParams}"]
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback testArgs...
        assert router.app.trigger.calledOnce, "expected app event to be triggered"
    try
      router = new Giraffe.Router
        app: 
          addChild: ->
          trigger: sinon.spy (appEvent, args..., route, params) ->
            assert _.isEqual(params, testParams), """
            expected args to be #{JSON.stringify testParams}
            got '#{JSON.stringify params}'
            """
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

  it 'should redirect and pass query parameters on absolute redirect routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback('?param=value')
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
      assert route is 'redirect?param=value', "expected route to be 'route?param=value', got '#{route}'"
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

  it 'should redirect and pass query parameters on relative redirect routes', (done) ->
    sinon.stub Giraffe.Router::, 'route', (route, appEvent, callback) ->
      _.delay ->
        callback('?param=value')
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
      assert route is 'namespace/redirect?param=value', "expected route to be 'namespace/redirect?param=value', got '#{route}'"
      assert trigger, trigger, "expected trigger to be true"
      done()
    Giraffe.Router::route.restore()

  it 'should register a regex that matches routes with method "route"', ->
    route = sinon.stub Backbone.history, 'route', (regex) ->
      assert regex.test('route'), "expected route for 'route' to match 'route', regex is #{regex}"
    try
      router = new Giraffe.Router
        app:
          addChild: ->
        triggers : {}
      router.route 'route', 'app:event', ->
    catch e
      Backbone.history.route.restore()
      throw e
    Backbone.history.route.restore()
    assert route.calledOnce, "expected Backbone.history.route to be called"

  it 'should register a regex that matches routes with arguments with method "route"', ->
    route = sinon.stub Backbone.history, 'route', (regex) ->
      matches = 'route/1/string/2'.match(regex)
      assert matches?, "expected route for 'route/:foo/:bar/*baz' to match 'route/1/string/2', regex is #{regex}"
      assert matches[1] is '1', "expected first subexpression match to be 1, got #{matches[1]}"
      assert matches[2] is 'string', "expected second subexpression match to be 'string', got #{matches[2]}"
      assert matches[3] is '2', "expected third subexpression match to be 2, got #{matches[3]}"
    try
      router = new Giraffe.Router
        app:
          addChild: ->
        triggers : {}
      router.route 'route/:foo/:bar/*baz', 'app:event', ->
    catch e
      Backbone.history.route.restore()
      throw e
    Backbone.history.route.restore()
    assert route.calledOnce, "expected Backbone.history.route to be called"

  it 'should register a regex that matches routes with query parameters with method "route"', ->
    route = sinon.stub Backbone.history, 'route', (regex) ->
      matches = 'route?param1=value&param2=3'.match(regex)
      assert matches?, "expected route for 'route/:foo/:bar/*baz' to match 'route?param1=value&param2=3', regex is #{regex}"
      assert matches[1] is '?param1=value&param2=3', "expected first subexpression match to be '?param1=value&param2=3', got #{matches[1]}"
    try
      router = new Giraffe.Router
        app:
          addChild: ->
        triggers : {}
      router.route 'route', 'app:event', ->
    catch e
      Backbone.history.route.restore()
      throw e
    Backbone.history.route.restore()
    assert route.calledOnce, "expected Backbone.history.route to be called"


  it 'should register a regex that matches routes with arguments and query parameters with method "route"', ->
    route = sinon.stub Backbone.history, 'route', (regex) ->
      matches = 'route/1/string/2?param1=value&param2=3'.match(regex)
      assert matches?, "expected route for 'route/:foo/:bar/*baz' to match 'route/1/string/2?param1=value&param2=3', regex is #{regex}"
      assert matches[1] is '1', "expected first subexpression match to be 1, got #{matches[1]}"
      assert matches[2] is 'string', "expected second subexpression match to be 'string', got #{matches[2]}"
      assert matches[3] is '2', "expected third subexpression match to be 2, got #{matches[3]}"
      assert matches[4] is '?param1=value&param2=3', "expected fourth subexpression match to be '?param1=value&param2=3', got #{matches[4]}"
    try
      router = new Giraffe.Router
        app:
          addChild: ->
        triggers : {}
      router.route 'route/:foo/:bar/*baz', 'app:event', ->
    catch e
      Backbone.history.route.restore()
      throw e
    Backbone.history.route.restore()
    assert route.calledOnce, "expected Backbone.history.route to be called"


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
    assert isCaused, "expected router.isCaused to return true with route 'route' and location 'route'"

  it 'should return true if route is caused and location has query parameters with method "isCaused"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers: {}
    sinon.stub router, 'getRoute', -> 'route'
    sinon.stub router, '_getLocation', -> 'route?param1=value&param2=1'
    isCaused = router.isCaused 'app:event'
    assert router.getRoute.calledOnce, "expected router.getRoute to be called"
    assert router._getLocation.calledOnce, "expected router._getLocation to be called"
    assert isCaused, "expected router.isCaused to return true with route 'route' and location 'route?param1=value&param2=1'"

  it 'should return true if route is caused with query parameters and location has same query parameters with method "isCaused"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers: {}
    sinon.stub router, 'getRoute', -> 'route?param1=value&param2=1'
    sinon.stub router, '_getLocation', -> 'route?param2=1&param1=value'
    isCaused = router.isCaused 'app:event'
    assert router.getRoute.calledOnce, "expected router.getRoute to be called"
    assert router._getLocation.calledOnce, "expected router._getLocation to be called"
    assert isCaused, "expected router.isCaused to return true with route 'route?param1=value&param2=1' and location 'route?param2=1&param1=value'"

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
    assert not isCaused, "expected router.isCaused to return false with route 'route1' and location 'route2'"
  
  it 'should return false if route is caused with query parameters and location has different query parameters with method "isCaused"', ->
    router = new Giraffe.Router
      app:
        addChild: ->
      triggers: {}
    sinon.stub router, 'getRoute', -> 'route?param1=value&param2=1'
    sinon.stub router, '_getLocation', -> 'route?param1=othervalue&param2=2'
    isCaused = router.isCaused 'app:event'
    assert router.getRoute.calledOnce, "expected router.getRoute to be called"
    assert router._getLocation.calledOnce, "expected router._getLocation to be called"
    assert isCaused, "expected router.isCaused to return true"
  
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
