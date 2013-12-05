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
          return callback();
        });
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {},
            trigger: function() {
              var appEvent, args, route, _i;
              appEvent = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), route = arguments[_i++];
              assert(appEvent === 'app:event', "expected appEvent to be 'app:event', got '" + appEvent + "'");
              assert(route === 'route', "expected route to be 'route', got '" + route + "'");
              return done();
            }
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
      var e, router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          return callback(1, 2, 3, 4);
        });
      });
      try {
        router = new Giraffe.Router({
          app: {
            addChild: function() {},
            trigger: function() {
              var appEvent, args, route, _i;
              appEvent = arguments[0], args = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), route = arguments[_i++];
              assert(_.isEqual(args, [1, 2, 3, 4]), "expected args to be [1,2,3,4] , got '" + (args.toString()) + "'");
              return done();
            }
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
      var e, router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          return callback();
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
      sinon.stub(router, 'navigate', function(route, trigger) {
        assert(route === 'redirect', "expected route to be 'route', got '" + route + "'");
        assert(trigger);
        return done();
      });
      return Giraffe.Router.prototype.route.restore();
    });
    it('should redirect on relative redirect routes', function(done) {
      var e, router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          return callback();
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
      sinon.stub(router, 'navigate', function(route, trigger) {
        assert(route === 'namespace/redirect', "expected route to be 'namespace/redirect', got '" + route + "'");
        assert(trigger, trigger, "expected trigger to be true");
        return done();
      });
      return Giraffe.Router.prototype.route.restore();
    });
    it('should cause a history naviagation on matched routes', function() {
      var e, navigate, router;
      navigate = sinon.stub(Backbone.history, 'navigate', function(route, trigger) {
        assert(route === 'route', "expected route to be 'route', got '" + route + "'");
        return assert(trigger, "expected trigger to be true");
      });
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {}
      });
      sinon.stub(router, 'getRoute', function() {
        return 'route';
      });
      try {
        router.cause('app:event');
      } catch (_error) {
        e = _error;
        Backbone.history.navigate.restore();
        throw e;
      }
      Backbone.history.navigate.restore();
      return assert(navigate.calledOnce, "expected Backbone.history.navigate to be called");
    });
    return it('should trigger app events on unmatched routes', function() {
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
  });

}).call(this);


/*
//@ sourceMappingURL=routerTest.map
*/