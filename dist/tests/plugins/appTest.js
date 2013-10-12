(function() {
  var assert, assertAppEventsOption, ut;

  assert = chai.assert;

  ut = window.ut;

  assertAppEventsOption = function(ctor, optionsArgIndex, args) {
    var arg, i, obj, worked, _i;
    worked = false;
    if (optionsArgIndex == null) {
      optionsArgIndex = 0;
    }
    for (i = _i = 0; 0 <= optionsArgIndex ? _i <= optionsArgIndex : _i >= optionsArgIndex; i = 0 <= optionsArgIndex ? ++_i : --_i) {
      if (args == null) {
        args = void 0;
      }
    }
    if (!_.isArray(args)) {
      args = [args];
    }
    arg = args[optionsArgIndex] != null ? args[optionsArgIndex] : args[optionsArgIndex] = {};
    if (arg.app == null) {
      arg.app = new Giraffe.App;
    }
    if (arg.appEvents == null) {
      arg.appEvents = {
        'foo': function() {
          return worked = true;
        }
      };
    }
    obj = (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(ctor, args, function(){});
    obj.app.trigger('foo');
    return assert.ok(worked);
  };

  describe('Giraffe.plugins.App', function() {
    it('should be OK', function() {
      return assert.ok(new Giraffe.App);
    });
    it('should attach the global Giraffe.app instance', function() {
      var app, _ref;
      if ((_ref = Giraffe.app) != null) {
        _ref.dispose();
      }
      app = new Giraffe.App;
      return assert.equal(Giraffe.app, app);
    });
    it('should clear the global Giraffe.app instance when disposed', function() {
      var app, _ref;
      if ((_ref = Giraffe.app) != null) {
        _ref.dispose();
      }
      app = new Giraffe.App;
      app.dispose();
      return assert.notEqual(Giraffe.app, app);
    });
    it('should not override the global Giraffe.app instance', function() {
      var app1, app2, _ref;
      if ((_ref = Giraffe.app) != null) {
        _ref.dispose();
      }
      app1 = new Giraffe.App;
      app2 = new Giraffe.App;
      return assert.equal(Giraffe.app, app1);
    });
    it('should add `this.app` to an automatically configured Giraffe object', function() {
      var app, view, _ref;
      if ((_ref = Giraffe.app) != null) {
        _ref.dispose();
      }
      app = new Giraffe.App;
      view = new Giraffe.View;
      return assert.equal(Giraffe.app, view.app);
    });
    it('should clear `this.app` on an automatically configured Giraffe object when disposed', function() {
      var app, view, _ref;
      if ((_ref = Giraffe.app) != null) {
        _ref.dispose();
      }
      app = new Giraffe.App;
      view = new Giraffe.View;
      view.dispose();
      return assert.equal(null, view.app);
    });
    it('should add `this.app` to a manually configured pojo', function() {
      var app, obj, _ref;
      if ((_ref = Giraffe.app) != null) {
        _ref.dispose();
      }
      app = new Giraffe.App;
      obj = {};
      Giraffe.configure(obj);
      return assert.equal(app, obj.app);
    });
    it('should clear `this.app` on a manually configured pojo when disposed', function() {
      var app, obj, _ref;
      if ((_ref = Giraffe.app) != null) {
        _ref.dispose();
      }
      app = new Giraffe.App;
      obj = {};
      Giraffe.configure(obj);
      obj.dispose();
      return assert.equal(null, obj.app);
    });
    it('should listen to `appEvents` on a configured instance of Backbone.Events', function(done) {
      var app, obj, _ref;
      if ((_ref = Giraffe.app) != null) {
        _ref.dispose();
      }
      app = new Giraffe.App;
      obj = {
        appEvents: {
          'foo': function() {
            return done();
          }
        }
      };
      _.extend(obj, Backbone.Events);
      Giraffe.configure(obj);
      return app.trigger('foo');
    });
    it('should enable `appEvents` from an option passed to Giraffe.View', function() {
      return assertAppEventsOption(Giraffe.View);
    });
    it('should enable `appEvents` from an option passed to Giraffe.Model', function() {
      return assertAppEventsOption(Giraffe.Model, 1);
    });
    it('should enable `appEvents` from an option passed to Giraffe.Collection', function() {
      return assertAppEventsOption(Giraffe.Collection, 1);
    });
    it('should enable `appEvents` from an option passed to Giraffe.Contrib.CollectionView', function() {
      return assertAppEventsOption(Giraffe.Contrib.CollectionView);
    });
    return it('should enable `appEvents` from an option passed to Giraffe.Contrib.FastCollectionView', function() {
      return assertAppEventsOption(Giraffe.Contrib.FastCollectionView, 0, {
        modelTemplate: '<li></li>',
        modelTemplateStrategy: 'underscore-template'
      });
    });
  });

}).call(this);
