(function() {
  var assert, assertAttached, assertDisposed, assertNested, assertNotDisposed, assertNotNested;

  assert = chai.assert;

  assertNested = function(child, parent) {
    assert.ok(_.contains(parent.children, child));
    return assert.equal(parent, child.parent);
  };

  assertNotNested = function(child, parent) {
    assert.ok(!_.contains(parent.children, child));
    return assert.notEqual(parent, child.parent);
  };

  assertAttached = function(child, parent) {
    return assert.equal(1, parent.$el.children(child.$el).length);
  };

  assertDisposed = function(obj) {
    return obj.app === null;
  };

  assertNotDisposed = function(obj) {
    return !!obj.app;
  };

  describe('Giraffe.App', function() {
    it('should be OK', function() {
      var app;
      app = new Giraffe.App;
      return assert.ok(app);
    });
    it('should accept appEvents on extended class', function(done) {
      var MyApp, app;
      MyApp = Giraffe.App.extend({
        appEvents: {
          'app:initialized': function() {
            return done();
          }
        }
      });
      app = new MyApp;
      return app.start();
    });
    it('should accept appEvents as an option', function(done) {
      var app;
      app = new Giraffe.App({
        appEvents: {
          'app:initialized': function() {
            return done();
          }
        }
      });
      return app.start();
    });
    it('should nest a view with attach', function() {
      var child, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      parent.attach(child);
      assertNested(child, parent);
      return assertAttached(child, parent);
    });
    it('should nest a view with attachTo', function() {
      var child, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      child.attachTo(parent);
      assertNested(child, parent);
      return assertAttached(child, parent);
    });
    it('should dispose the child view when the parent renders', function(done) {
      var child, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      parent.attach(child);
      child.on("disposed", function() {
        return done();
      });
      parent.render();
      assertNotNested(child, parent);
      return assertDisposed(child);
    });
    return it('should not dispose of a cached view', function() {
      var child, grandchild, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      grandchild = new Giraffe.View({
        disposeOnDetach: false
      });
      parent.attach(child);
      child.attach(grandchild);
      child.render();
      assertNested(child, parent);
      assertNested(grandchild, child);
      return assertNotDisposed(grandchild);
    });
  });

}).call(this);


/*
//@ sourceMappingURL=appTest.map
*/