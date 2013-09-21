(function() {
  var $newEl, assert, assertAttached, assertDisposed, assertNested, assertNotAttached, assertNotDisposed, assertNotNested;

  assert = chai.assert;

  $newEl = function() {
    return $('<div class="test-div"></div>').appendTo('body');
  };

  assertNested = function(child, parent) {
    assert.ok(_.contains(parent.children, child));
    return assert.equal(parent, child.parent);
  };

  assertNotNested = function(child, parent) {
    assert.ok(!_.contains(parent.children, child));
    return assert.notEqual(parent, child.parent);
  };

  assertAttached = function(child, parent) {
    return assert.ok(child.isAttached(parent));
  };

  assertNotAttached = function(child, parent) {
    return assert.ok(!child.isAttached(parent));
  };

  assertDisposed = function(view) {
    return assert.ok(!view.$el);
  };

  assertNotDisposed = function(view) {
    return assert.ok(!!view.$el);
  };

  describe('Giraffe.View', function() {
    it('should be OK', function() {
      var view;
      view = new Giraffe.View;
      return assert.ok(view);
    });
    it('should attach a view to the DOM', function() {
      var $el, a;
      a = new Giraffe.View;
      $el = $newEl();
      a.attachTo($el);
      return assert.ok(a.isAttached());
    });
    it('should insert a view before another with method "before"', function() {
      var a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      b.attachTo($newEl());
      a.attachTo(b, {
        method: 'before'
      });
      return assert.equal(a.$el.next()[0], b.$el[0]);
    });
    it('should insert a view after another with method "after"', function() {
      var a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      a.attachTo($newEl());
      b.attachTo(a, {
        method: 'after'
      });
      return assert.equal(a.$el.next()[0], b.$el[0]);
    });
    it('should insert a view and replace the current contents with method "html"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = $newEl();
      a.attachTo($el);
      b.attachTo($el, {
        method: 'html'
      });
      return assert.ok(!a.isAttached());
    });
    it('should insert a view at the end of the target\'s children with "append"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = $newEl();
      a.attachTo($el);
      b.attachTo($el, {
        method: 'append'
      });
      return assert.ok(a.$el.next().is(b.$el));
    });
    it('should insert a view at the beginning of the target\'s children with "prepend"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = $newEl();
      b.attachTo($el);
      a.attachTo($el, {
        method: 'prepend'
      });
      return assert.ok(a.$el.next().is(b.$el));
    });
    it('should render a view when attached', function(done) {
      var a;
      a = new Giraffe.View({
        afterRender: function() {
          return done();
        }
      });
      return a.attachTo($newEl());
    });
    it('should suppress render on a view when attached using `attachTo`', function() {
      var a;
      a = new Giraffe.View({
        afterRender: function() {
          return assert.fail();
        }
      });
      return a.attachTo($newEl(), {
        suppressRender: true
      });
    });
    it('should suppress render on a view when attached using `attach`', function() {
      var a, b;
      a = new Giraffe.View({
        afterRender: function() {
          return assert.fail();
        }
      });
      b = new Giraffe.View;
      return b.attach(a, {
        suppressRender: true
      });
    });
    it('should dispose of a view', function() {
      var a;
      a = new Giraffe.View;
      a.dispose();
      return assertDisposed(a);
    });
    it('should remove the view from the DOM on dispose', function() {
      var $el, a;
      a = new Giraffe.View;
      $el = $newEl();
      a.attachTo($el);
      assertAttached(a, $el);
      a.dispose();
      assertDisposed(a);
      return assert.ok(!a.isAttached());
    });
    it('should fire the event "disposed" when disposed', function(done) {
      var a;
      a = new Giraffe.View;
      a.on("disposed", function() {
        return done();
      });
      return a.dispose();
    });
    it('should detach a view, disposing of it', function() {
      var a;
      a = new Giraffe.View;
      a.attachTo($newEl());
      a.detach();
      return assertDisposed(a);
    });
    it('should detach a view and not dispose it due to passing `true` to `detach`', function() {
      var a;
      a = new Giraffe.View;
      a.attachTo($newEl());
      a.detach(true);
      return assertNotDisposed(a);
    });
    it('should detach a view and not dispose due to passing `disposeOnDetach` to the view', function() {
      var a;
      a = new Giraffe.View({
        disposeOnDetach: false
      });
      a.attachTo($newEl());
      a.detach();
      return assertNotDisposed(a);
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
    it('should dispose the child views when the parent removes them', function() {
      var child1, child2, parent;
      parent = new Giraffe.View;
      child1 = new Giraffe.View;
      child2 = new Giraffe.View({
        disposeOnDetach: false
      });
      parent.attach(child1);
      parent.attach(child2);
      parent.removeChildren();
      assertDisposed(child1);
      assertDisposed(child2);
      return assert.equal(0, parent.children.length);
    });
    it('should remove children but not dispose them when preserved', function() {
      var child1, child2, parent;
      parent = new Giraffe.View;
      child1 = new Giraffe.View;
      child2 = new Giraffe.View;
      parent.attach(child1);
      parent.attach(child2);
      parent.removeChildren(true);
      assertNotDisposed(child1);
      assertNotDisposed(child2);
      return assert.equal(0, parent.children.length);
    });
    it('should dispose the child view when the parent renders', function(done) {
      var child, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      parent.attach(child);
      child.on('disposed', function() {
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
      assertNotNested(c, parent);
      assertDisposed(c);
      assert.equal(2, parent.children.length);
      parent.removeChild(a);
      assertNotNested(a, parent);
      assertDisposed(a);
      assert.equal(1, parent.children.length);
      parent.removeChild(b, true);
      assertNotNested(b, parent);
      assertNotDisposed(b);
      return assert.equal(0, parent.children.length);
    });
    it('should invoke a method up the view hierarchy', function(done) {
      var child, grandchild, parent;
      parent = new Giraffe.View({
        done: done
      });
      child = new Giraffe.View;
      grandchild = new Giraffe.View;
      child.attachTo(parent);
      grandchild.attachTo(child);
      return grandchild.invoke('done');
    });
    return it('should listen for data events', function(done) {
      var parent;
      parent = new Giraffe.View({
        view: new Giraffe.View,
        dataEvents: {
          'done view': function() {
            return done();
          }
        }
      });
      return parent.view.trigger('done');
    });
  });

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
    return it('should accept appEvents as an option', function(done) {
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
  });

  describe('Giraffe.Contrib.CollectionView', function() {
    it('should be OK', function() {
      var a;
      a = new Giraffe.Contrib.CollectionView;
      return assert.ok(!!a);
    });
    it('should render child views', function() {
      var a, collection;
      collection = new Giraffe.Collection([{}, {}]);
      a = new Giraffe.Contrib.CollectionView({
        collection: collection
      });
      a.attachTo($newEl());
      assert.equal(2, a.children.length);
      assertAttached(a.children[0], a);
      return assertAttached(a.children[1], a);
    });
    return it('should keep child views sorted', function() {
      var a, collection;
      collection = new Giraffe.Collection([
        {
          foo: 1
        }, {
          foo: 0
        }
      ], {
        comparator: "foo"
      });
      a = new Giraffe.Contrib.CollectionView({
        collection: collection
      });
      a.attachTo($newEl());
      assert.equal(0, a.children[0].model.get("foo"));
      assert.equal(1, a.children[1].model.get("foo"));
      assert.ok(a.children[0].$el.next().is(a.children[1].$el));
      a.children[0].model.set("foo", 2);
      collection.sort();
      assert.equal(1, a.children[0].model.get("foo"));
      assert.equal(2, a.children[1].model.get("foo"));
      return assert.ok(a.children[0].$el.next().is(a.children[1].$el));
    });
  });

}).call(this);


/*
//@ sourceMappingURL=appTest.map
*/