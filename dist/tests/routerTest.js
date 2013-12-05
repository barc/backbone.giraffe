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
    it('should trigger app events on successful routes', function(done) {
      var router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          return callback();
        });
      });
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
      return Giraffe.Router.prototype.route.restore();
    });
    it('should pass route arguments on successful routes', function(done) {
      var router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          return callback(1, 2, 3, 4);
        });
      });
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
      return Giraffe.Router.prototype.route.restore();
    });
    it('should redirect on absolute redirect routes', function(done) {
      var router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          return callback();
        });
      });
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {
          'route': '-> redirect'
        }
      });
      sinon.stub(router, 'navigate', function(route, trigger) {
        assert(route === 'redirect', "expected route to be 'route', got '" + route + "'");
        assert(trigger);
        return done();
      });
      return Giraffe.Router.prototype.route.restore();
    });
    return it('should redirect on relative redirect routes', function(done) {
      var router;
      sinon.stub(Giraffe.Router.prototype, 'route', function(route, appEvent, callback) {
        return _.delay(function() {
          return callback();
        });
      });
      router = new Giraffe.Router({
        app: {
          addChild: function() {}
        },
        triggers: {
          'route': '=> redirect'
        },
        namespace: 'namespace'
      });
      sinon.stub(router, 'navigate', function(route, trigger) {
        assert(route === 'namespace/redirect', "expected route to be 'namespace/redirect', got '" + route + "'");
        assert(trigger, trigger, "expected trigger to be true");
        return done();
      });
      return Giraffe.Router.prototype.route.restore();
    });
  });

}).call(this);


/*
//@ sourceMappingURL=routerTest.map
*/