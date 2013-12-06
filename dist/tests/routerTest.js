(function() {
  var assert, sinon, ut, _,
    __slice = [].slice;

  assert = chai.assert;

  ut = window.ut, sinon = window.sinon, _ = window._;

  describe('Giraffe.Router', function() {
    it('should be OK', function() {
      var router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {}
      });
      return assert.ok(router);
    });
    it('should call Giraffe.configure on itself on startup', function() {
      var configure, e, router;
      configure = sinon.stub(Giraffe, 'configure');
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {}
        });
      } catch (_error) {
        e = _error;
        Giraffe.configure.restore();
        throw e;
      }
      Giraffe.configure.restore();
      assert(configure.calledOnce, "Giraffe.configure was not called");
      return assert(configure.calledWith(router), "Giraffe.configure was not called with the router");
    });
    it('should add itself as a child to the app on startup', function() {
      var router;
      router = new Giraffe.Router({
        app: {
          addChild: sinon.spy(function() {})
        },
        triggers: {}
      });
      assert(router.app.addChild.calledOnce, "app.addChild was not called");
      return assert(router.app.addChild.calledWith(router), "app.addChild was not called with the router");
    });
    it('should register routes on startup', function() {
      var e, route, router;
      route = sinon.stub(Giraffe.Router.prototype, 'route', function(rt, appEvent, callback) {
        assert(rt === 'route', "expected route to be 'route', got '" + rt + "'");
        return assert(appEvent === 'app:event', "expected appEvent to be 'app:event', got '" + appEvent + "'");
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {
            'route': 'app:event'
          }
        });
      } catch (_error) {
        e = _error;
        Giraffe.Router.prototype.route.restore();
        throw e;
      }
      Giraffe.Router.prototype.route.restore();
      return assert(route.calledOnce, "expected router.route to be called");
    });
    it('should trigger app events on successful routes', function(done) {
      var e, router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          callback();
          return assert(router.app.trigger.calledOnce, "expected app event to be triggered");
        });
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {},
            trigger: sinon.spy(function() {
              var appEvent, args, route, _i;
              appEvent = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), route = arguments[_i++];
              assert(appEvent === 'app:event', "expected appEvent to be 'app:event', got '" + appEvent + "'");
              assert(route === 'route', "expected route to be 'route', got '" + route + "'");
              return done();
            })
          },
          triggers: {
            'route': 'app:event'
          }
        });
      } catch (_error) {
        e = _error;
        Giraffe.Router.prototype.route.restore();
        throw e;
      }
      return Giraffe.Router.prototype.route.restore();
    });
    it('should pass route arguments on successful routes', function(done) {
      var e, router, testArgs;
      testArgs = [1, 'string'];
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          callback.apply(null, testArgs);
          return assert(router.app.trigger.calledOnce, "expected app event to be triggered");
        });
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {},
            trigger: sinon.spy(function() {
              var appEvent, args, route, _i;
              appEvent = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), route = arguments[_i++];
              assert(_.isEqual(args, testArgs), "expected args to be " + (testArgs.toString()) + " , got '" + (args.toString()) + "'");
              return done();
            })
          },
          triggers: {
            'route': 'app:event'
          }
        });
      } catch (_error) {
        e = _error;
        Giraffe.Router.route.restore();
        throw e;
      }
      return Giraffe.Router.prototype.route.restore();
    });
    it('should redirect on absolute redirect routes', function(done) {
      var e, navigate, router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          callback();
          return assert(navigate.calledOnce, "expected route.navigate to be called");
        });
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {
            'route': '-> redirect'
          }
        });
      } catch (_error) {
        e = _error;
        Giraffe.Router.prototype.route.restore();
        throw e;
      }
      navigate = sinon.stub(router, 'navigate', function(route, trigger) {
        assert(route === 'redirect', "expected route to be 'route', got '" + route + "'");
        assert(trigger, "expected trigger to be true");
        return done();
      });
      return Giraffe.Router.prototype.route.restore();
    });
    it('should redirect on relative redirect routes', function(done) {
      var e, navigate, router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          callback();
          return assert(navigate.calledOnce, "expected route.navigate to be called");
        });
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {
            'route': '=> redirect'
          },
          namespace: 'namespace'
        });
      } catch (_error) {
        e = _error;
        Giraffe.Router.prototype.route.restore();
        throw e;
      }
      navigate = sinon.stub(router, 'navigate', function(route, trigger) {
        assert(route === 'namespace/redirect', "expected route to be 'namespace/redirect', got '" + route + "'");
        assert(trigger, trigger, "expected trigger to be true");
        return done();
      });
      return Giraffe.Router.prototype.route.restore();
    });
    it('should cause a history navigation on matched routes with method "cause"', function() {
      var e, navigate, router;
      navigate = sinon.stub(Backbone.history, 'navigate', function(route, trigger) {
        assert(route === 'route', "expected route to be 'route', got '" + route + "'");
        return assert(trigger, "expected trigger to be true");
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {}
        });
        sinon.stub(router, 'getRoute', function() {
          return 'route';
        });
        router.cause('app:event');
      } catch (_error) {
        e = _error;
        Backbone.history.navigate.restore();
        throw e;
      }
      Backbone.history.navigate.restore();
      return assert(navigate.calledOnce, "expected Backbone.history.navigate to be called");
    });
    it('should trigger app events on unmatched routes with method "cause"', function() {
      var router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {},
          trigger: sinon.spy(function() {
            var appEvent, args, route, _i;
            appEvent = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), route = arguments[_i++];
            return assert(appEvent === 'app:event', "expected appEvent to be 'app:event', got " + appEvent);
          })
        },
        triggers: {}
      });
      sinon.stub(router, 'getRoute', function() {
        return void 0;
      });
      router.cause('app:event');
      return assert(router.app.trigger.calledOnce, "expected app event to be triggered");
    });
    it('should return matched routes with method "getRoute"', function() {
      var route, router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {
          'route': 'app:event'
        }
      });
      route = router.getRoute('app:event');
      return assert(route === '#route', "expected returned route to be '#route', got '" + route + "'");
    });
    it('should return null for unmatched routes with method "getRoute"', function() {
      var route, router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {}
      });
      route = router.getRoute('app:event');
      return assert(route === null, "expected route to be null, got '" + route + "'");
    });
    it('should replace parameters in routes with passed arguments with method "getRoute"', function() {
      var route, router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {
          'route/:a/*b': 'app:event'
        }
      });
      route = router.getRoute('app:event', 1, 'string');
      return assert(route === '#route/1/string', "expected route to be '#route/1/string', got '" + route + "'");
    });
    it('should return true if route is caused with method "isCaused"', function() {
      var isCaused, router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {}
      });
      sinon.stub(router, 'getRoute', function() {
        return 'route';
      });
      sinon.stub(router, '_getLocation', function() {
        return 'route';
      });
      isCaused = router.isCaused('app:event');
      assert(router.getRoute.calledOnce, "expected router.getRoute to be called");
      assert(router._getLocation.calledOnce, "expected router._getLocation to be called");
      return assert(isCaused, "expected router.isCaused to return true");
    });
    it('should return false if route is not caused with method "isCaused"', function() {
      var isCaused, router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {}
      });
      sinon.stub(router, 'getRoute', function() {
        return 'route1';
      });
      sinon.stub(router, '_getLocation', function() {
        return 'route2';
      });
      isCaused = router.isCaused('app:event');
      assert(router.getRoute.calledOnce, "expected router.getRoute to be called");
      assert(router._getLocation.calledOnce, "expected router._getLocation to be called");
      return assert(!isCaused, "expected router.isCaused to return false");
    });
    return it('should return false if route is null with method "isCaused"', function() {
      var isCaused, router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {}
      });
      sinon.stub(router, 'getRoute', function() {
        return null;
      });
      sinon.stub(router, '_getLocation', function() {
        return 'route';
      });
      isCaused = router.isCaused('app:event');
      assert(router.getRoute.calledOnce, "expected router.getRoute to be called");
      return assert(!isCaused, "expected router.isCaused to return false");
    });
  });

}).call(this);


/*
//@ sourceMappingURL=routerTest.map
*/