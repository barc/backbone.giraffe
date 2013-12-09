(function() {
  var $, assert, sinon, ut, _,
    __slice = [].slice;

  assert = chai.assert;

  ut = window.ut, sinon = window.sinon, _ = window._, $ = window.$;

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
    it('should pass query parameters on successful routes with query parameters', function(done) {
      var e, router, testArgs, testParams;
      testParams = {
        num: 2,
        string: 'foo',
        bool: true,
        obj: {
          num: 3,
          string: 'bar',
          arr: ['baz', 4]
        },
        arr: [
          'qux', 5, {
            string: 'quux',
            num: 6
          }
        ]
      };
      testArgs = [1, 'string', "?" + ($.param(testParams))];
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
              var appEvent, args, params, route, _i;
              appEvent = arguments[0], args = 4 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 2) : (_i = 1, []), route = arguments[_i++], params = arguments[_i++];
              assert(_.isEqual(params, testParams), "expected args to be " + (JSON.stringify(testParams)) + "\ngot '" + (JSON.stringify(params)) + "'");
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
    it('should redirect and pass query parameters on absolute redirect routes', function(done) {
      var e, navigate, router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          callback('?param=value');
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
        assert(route === 'redirect?param=value', "expected route to be 'route?param=value', got '" + route + "'");
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
    it('should redirect and pass query parameters on relative redirect routes', function(done) {
      var e, navigate, router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          callback('?param=value');
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
        assert(route === 'namespace/redirect?param=value', "expected route to be 'namespace/redirect?param=value', got '" + route + "'");
        assert(trigger, trigger, "expected trigger to be true");
        return done();
      });
      return Giraffe.Router.prototype.route.restore();
    });
    it('should register a regex that matches routes with method "route"', function() {
      var e, route, router;
      route = sinon.stub(Backbone.history, 'route', function(regex) {
        return assert(regex.test('route'), "expected route for 'route' to match 'route', regex is " + regex);
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {}
        });
        router.route('route', 'app:event', function() {});
      } catch (_error) {
        e = _error;
        Backbone.history.route.restore();
        throw e;
      }
      Backbone.history.route.restore();
      return assert(route.calledOnce, "expected Backbone.history.route to be called");
    });
    it('should register a regex that matches routes with arguments with method "route"', function() {
      var e, route, router;
      route = sinon.stub(Backbone.history, 'route', function(regex) {
        var matches;
        matches = 'route/1/string/2'.match(regex);
        assert(matches != null, "expected route for 'route/:foo/:bar/*baz' to match 'route/1/string/2', regex is " + regex);
        assert(matches[1] === '1', "expected first subexpression match to be 1, got " + matches[1]);
        assert(matches[2] === 'string', "expected second subexpression match to be 'string', got " + matches[2]);
        return assert(matches[3] === '2', "expected third subexpression match to be 2, got " + matches[3]);
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {}
        });
        router.route('route/:foo/:bar/*baz', 'app:event', function() {});
      } catch (_error) {
        e = _error;
        Backbone.history.route.restore();
        throw e;
      }
      Backbone.history.route.restore();
      return assert(route.calledOnce, "expected Backbone.history.route to be called");
    });
    it('should register a regex that matches routes with query parameters with method "route"', function() {
      var e, route, router;
      route = sinon.stub(Backbone.history, 'route', function(regex) {
        var matches;
        matches = 'route?param1=value&param2=3'.match(regex);
        assert(matches != null, "expected route for 'route/:foo/:bar/*baz' to match 'route?param1=value&param2=3', regex is " + regex);
        return assert(matches[1] === '?param1=value&param2=3', "expected first subexpression match to be '?param1=value&param2=3', got " + matches[1]);
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {}
        });
        router.route('route', 'app:event', function() {});
      } catch (_error) {
        e = _error;
        Backbone.history.route.restore();
        throw e;
      }
      Backbone.history.route.restore();
      return assert(route.calledOnce, "expected Backbone.history.route to be called");
    });
    it('should register a regex that matches routes with arguments and query parameters with method "route"', function() {
      var e, route, router;
      route = sinon.stub(Backbone.history, 'route', function(regex) {
        var matches;
        matches = 'route/1/string/2?param1=value&param2=3'.match(regex);
        assert(matches != null, "expected route for 'route/:foo/:bar/*baz' to match 'route/1/string/2?param1=value&param2=3', regex is " + regex);
        assert(matches[1] === '1', "expected first subexpression match to be 1, got " + matches[1]);
        assert(matches[2] === 'string', "expected second subexpression match to be 'string', got " + matches[2]);
        assert(matches[3] === '2', "expected third subexpression match to be 2, got " + matches[3]);
        return assert(matches[4] === '?param1=value&param2=3', "expected fourth subexpression match to be '?param1=value&param2=3', got " + matches[4]);
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {}
          },
          triggers: {}
        });
        router.route('route/:foo/:bar/*baz', 'app:event', function() {});
      } catch (_error) {
        e = _error;
        Backbone.history.route.restore();
        throw e;
      }
      Backbone.history.route.restore();
      return assert(route.calledOnce, "expected Backbone.history.route to be called");
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
      return assert(isCaused, "expected router.isCaused to return true with route 'route' and location 'route'");
    });
    it('should return true if route is caused and location has query parameters with method "isCaused"', function() {
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
        return 'route?param1=value&param2=1';
      });
      isCaused = router.isCaused('app:event');
      assert(router.getRoute.calledOnce, "expected router.getRoute to be called");
      assert(router._getLocation.calledOnce, "expected router._getLocation to be called");
      return assert(isCaused, "expected router.isCaused to return true with route 'route' and location 'route?param1=value&param2=1'");
    });
    it('should return true if route is caused with query parameters and location has same query parameters with method "isCaused"', function() {
      var isCaused, router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {}
      });
      sinon.stub(router, 'getRoute', function() {
        return 'route?param1=value&param2=1';
      });
      sinon.stub(router, '_getLocation', function() {
        return 'route?param2=1&param1=value';
      });
      isCaused = router.isCaused('app:event');
      assert(router.getRoute.calledOnce, "expected router.getRoute to be called");
      assert(router._getLocation.calledOnce, "expected router._getLocation to be called");
      return assert(isCaused, "expected router.isCaused to return true with route 'route?param1=value&param2=1' and location 'route?param2=1&param1=value'");
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
      return assert(!isCaused, "expected router.isCaused to return false with route 'route1' and location 'route2'");
    });
    it('should return false if route is caused with query parameters and location has different query parameters with method "isCaused"', function() {
      var isCaused, router;
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {}
      });
      sinon.stub(router, 'getRoute', function() {
        return 'route?param1=value&param2=1';
      });
      sinon.stub(router, '_getLocation', function() {
        return 'route?param1=othervalue&param2=2';
      });
      isCaused = router.isCaused('app:event');
      assert(router.getRoute.calledOnce, "expected router.getRoute to be called");
      assert(router._getLocation.calledOnce, "expected router._getLocation to be called");
      return assert(isCaused, "expected router.isCaused to return true");
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