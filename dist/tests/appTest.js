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
    it('should not dispose of a cached view', function() {
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
    it('should add and remove some children', function() {
      var a, b, c, parent;
      parent = new Giraffe.View;
      a = new Giraffe.View;
      b = new Giraffe.View;
      c = new Giraffe.View;
      parent.attach(a);
      parent.attach(b);
      parent.attach(c);
      assertNested(a, parent);
      assertNested(b, parent);
      assertNested(c, parent);
      assert.equal(3, parent.children.length);
      c.dispose();
      assertDisposed(c);
      assert.equal(2, parent.children.length);
      parent.removeChild(a);
      assertNotNested(a, parent);
      assertNotDisposed(a, parent);
      assert.equal(1, parent.children.length);
      parent.render();
      assertNotNested(c, parent);
      assertDisposed(c, parent);
      return assert.equal(0, parent.children.length);
    });
    it('should invoke a method up the view hierarchy', function(done) {
      var child, parent;
      parent = new Giraffe.View({
        done: done
      });
      child = new Giraffe.View;
      child.attachTo(parent);
      return child.invoke("done");
    });
    return it('should listen for data events', function(done) {
      var parent;
      parent = new Giraffe.View({
        view: new Giraffe.View,
        dataEvents: {
          "disposed view": function() {
            return done();
          }
        }
      });
      return parent.view.dispose();
    });
  });

}).call(this);


/*
//@ sourceMappingURL=appTest.map
*/