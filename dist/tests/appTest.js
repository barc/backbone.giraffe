(function() {
  var assert, assertAttached, assertDisposed, assertHasText, assertNested, assertNotAttached, assertNotDisposed, assertNotNested, assertNotRendered, assertRendered, assertSiblings, getEl;

  assert = chai.assert;

  getEl = function() {
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
    if (parent instanceof $) {
      return assert.lengthOf(parent.find(child.$el || child), 1);
    } else if (_.isArray(child)) {
      return assert.ok(_.every(child.children, function(v) {
        return v.isAttached(parent);
      }));
    } else {
      return assert.ok(child.isAttached(parent));
    }
  };

  assertNotAttached = function(child, parent) {
    return assert.ok(!child.isAttached(parent));
  };

  assertDisposed = function(view) {
    assert.ok(!view.$el);
    return assert.ok(!view.isAttached());
  };

  assertNotDisposed = function(view) {
    return assert.ok(!!view.$el);
  };

  assertSiblings = function(a, b) {
    var bEl;
    bEl = b.$el[0];
    if (!bEl) {
      assert.fail();
    }
    return assert.equal(a.$el.next()[0], bEl);
  };

  assertRendered = function(view) {
    return assert.ok(view._renderedOnce);
  };

  assertNotRendered = function(view) {
    return assert.ok(!view._renderedOnce);
  };

  assertHasText = function(view, text, className) {
    var $content;
    $content = view.$('.' + className);
    assert.lengthOf($content, 1);
    return assert.equal(text, $content.text().trim());
  };

  describe('Giraffe.View', function() {
    it('should be OK', function() {
      var view;
      view = new Giraffe.View;
      return assert.ok(view);
    });
    it('should render a view', function() {
      var a;
      a = new Giraffe.View;
      a.render();
      return assertRendered(a);
    });
    it('should attach a view to the DOM', function() {
      var $el, a;
      a = new Giraffe.View;
      $el = getEl();
      a.attachTo($el);
      assert.ok(a.isAttached());
      return assertAttached(a, $el);
    });
    it('should insert a view and replace the current contents with method "html"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = getEl();
      a.attachTo($el);
      b.attachTo($el, {
        method: 'html'
      });
      assert.ok(!a.isAttached());
      return assert.ok(b.isAttached());
    });
    it('should insert a view before another with method "before"', function() {
      var a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      b.attachTo(getEl());
      a.attachTo(b, {
        method: 'before'
      });
      return assertSiblings(a, b);
    });
    it('should insert a view after another with method "after"', function() {
      var a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      a.attachTo(getEl());
      b.attachTo(a, {
        method: 'after'
      });
      return assertSiblings(a, b);
    });
    it('should insert a view at the end of the target\'s children with "append"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = getEl();
      a.attachTo($el);
      b.attachTo($el, {
        method: 'append'
      });
      return assertSiblings(a, b);
    });
    it('should insert a view at the beginning of the target\'s children with "prepend"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = getEl();
      b.attachTo($el);
      a.attachTo($el, {
        method: 'prepend'
      });
      return assertSiblings(a, b);
    });
    it('should render a view when attached and call `afterRender`', function(done) {
      var a;
      a = new Giraffe.View({
        afterRender: function() {
          return done();
        }
      });
      a.attachTo(getEl());
      return assertRendered(a);
    });
    it('should suppress render on a view when attached', function() {
      var a;
      a = new Giraffe.View({
        afterRender: function() {
          return assert.fail();
        }
      });
      a.attachTo(getEl(), {
        suppressRender: true
      });
      return assertNotRendered(a);
    });
    it('should render content into a view using the default "underscore-template-selector" strategy', function() {
      var $el, a, className, templateId, text;
      $el = getEl();
      templateId = 'my-render-test-template';
      className = 'render-test';
      text = 'hello world';
      $el.append("<script type='text/template' id='" + templateId + "'>\n  <div class='" + className + "'><%= text %></div>\n</script>");
      a = new Giraffe.View({
        template: '#' + templateId,
        text: text
      });
      a.render();
      return assertHasText(a, text, className);
    });
    it('should render content into a view by overriding `templateStrategy`', function() {
      var $el, a, className, text;
      $el = getEl();
      className = 'render-test';
      text = 'hello world';
      a = new Giraffe.View({
        templateStrategy: function() {
          return "<div class='" + className + "'>" + this.text + "</div>";
        },
        text: text
      });
      a.render();
      return assertHasText(a, text, className);
    });
    it('should render content into a view using the "jst" strategy', function() {
      var $el, a, className, text;
      $el = getEl();
      className = 'render-test';
      text = 'hello world';
      a = new Giraffe.View({
        template: function() {
          return "<div class='" + className + "'>" + this.text + "</div>";
        },
        templateStrategy: 'jst',
        text: text
      });
      a.render();
      return assertHasText(a, text, className);
    });
    it('should render content into a view using the "underscore-template" strategy', function() {
      var $el, a, className, text;
      $el = getEl();
      className = 'render-test';
      text = 'hello world';
      a = new Giraffe.View({
        template: function() {
          return "<div class='" + className + "'><%= text %></div>";
        },
        templateStrategy: 'underscore-template',
        text: text
      });
      a.render();
      return assertHasText(a, text, className);
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
      $el = getEl();
      a.attachTo($el);
      assertAttached(a, $el);
      a.dispose();
      return assertDisposed(a);
    });
    it('should fire the event "disposed" when disposed', function(done) {
      var a;
      a = new Giraffe.View;
      a.on('disposed', function() {
        return done();
      });
      return a.dispose();
    });
    it('should detach a view, removing it from the DOM and disposing of it', function() {
      var a;
      a = new Giraffe.View;
      a.attachTo(getEl());
      a.detach();
      assert.ok(!a.isAttached());
      return assertDisposed(a);
    });
    it('should detach a view and not dispose it due to passing `true` to `detach`', function() {
      var a;
      a = new Giraffe.View;
      a.attachTo(getEl());
      a.detach(true);
      assert.ok(!a.isAttached());
      return assertNotDisposed(a);
    });
    it('should detach a view and not dispose due to passing `disposeOnDetach` to the view', function() {
      var a;
      a = new Giraffe.View({
        disposeOnDetach: false
      });
      a.attachTo(getEl());
      a.detach();
      assert.ok(!a.isAttached());
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
      return assert.lengthOf(parent.children, 0);
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
      return assert.lengthOf(parent.children, 0);
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
      assert.lengthOf(parent.children, 3);
      c.dispose();
      assertNotNested(c, parent);
      assertDisposed(c);
      assert.lengthOf(parent.children, 2);
      parent.removeChild(a);
      assertNotNested(a, parent);
      assertDisposed(a);
      assert.lengthOf(parent.children, 1);
      parent.removeChild(b, true);
      assertNotNested(b, parent);
      assertNotDisposed(b);
      return assert.lengthOf(parent.children, 0);
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
      return assert.ok(new Giraffe.App);
    });
    it('should add an initializer and call it on `start`', function(done) {
      var a;
      a = new Giraffe.App;
      a.addInitializer(function() {
        return done();
      });
      return a.start();
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
      return assert.ok(new Giraffe.Contrib.CollectionView);
    });
    it('should render model views passed to the constructor', function() {
      var a, child1, child2, collection, _ref;
      collection = new Giraffe.Collection([{}, {}]);
      a = new Giraffe.Contrib.CollectionView({
        collection: collection
      });
      a.attachTo(getEl());
      assert.lengthOf(a.children, 2);
      _ref = a.children, child1 = _ref[0], child2 = _ref[1];
      assertAttached(child1, a.$el);
      assertAttached(child2, a.$el);
      assertRendered(child1);
      assertRendered(child2);
      return assertSiblings(child1, child2);
    });
    it('should render model views added after initialization', function() {
      var a, child, collection;
      collection = new Giraffe.Collection;
      a = new Giraffe.Contrib.CollectionView({
        collection: collection
      });
      a.attachTo(getEl());
      assert.lengthOf(a.children, 0);
      a.addOne({});
      assert.lengthOf(a.children, 1);
      child = a.children[0];
      assertAttached(child, a.$el);
      return assertRendered(child);
    });
    it('should render models views when extended', function() {
      var A, a, collection;
      collection = new Giraffe.Collection([{}, {}]);
      A = Giraffe.Contrib.CollectionView.extend({
        collection: collection
      });
      a = new A;
      a.attachTo(getEl());
      assert.lengthOf(a.children, 2);
      assertAttached(a.children[0], a.$el);
      return assertAttached(a.children[1], a.$el);
    });
    it('should sync when the collection is reset', function() {
      var a, collection, modelView;
      collection = new Giraffe.Collection([{}]);
      a = new Giraffe.Contrib.CollectionView({
        collection: collection
      });
      a.attachTo(getEl());
      assert.lengthOf(a.children, 1);
      modelView = a.children[0];
      assertAttached(modelView, a.$el);
      collection.reset([{}, {}]);
      assertDisposed(modelView);
      return assert.lengthOf(a.children, 2);
    });
    it('should sync when a model is added to the collection', function() {
      var a;
      a = new Giraffe.Contrib.CollectionView;
      a.attachTo(getEl());
      a.collection.add({});
      assert.lengthOf(a.children, 1);
      return assertAttached(a.children);
    });
    it('should sync when a model is added via addOne', function() {
      var a;
      a = new Giraffe.Contrib.CollectionView;
      a.attachTo(getEl());
      a.collection.add({});
      assert.lengthOf(a.children, 1);
      return assertAttached(a.children);
    });
    it('should sync when a model is removed', function() {
      var a, modelView;
      a = new Giraffe.Contrib.CollectionView;
      a.attachTo(getEl());
      a.collection.add({});
      assert.lengthOf(a.children, 1);
      modelView = a.children[0];
      assert.ok(modelView);
      assert.ok(modelView.isAttached());
      a.collection.remove(a.collection.at(0));
      assert.lengthOf(a.children, 0);
      return assertDisposed(modelView);
    });
    it('should keep model views sorted when a value changes', function() {
      var a, child1, child2, collection, _ref, _ref1;
      collection = new Giraffe.Collection([
        {
          foo: 1
        }, {
          foo: 0
        }
      ], {
        comparator: 'foo'
      });
      a = new Giraffe.Contrib.CollectionView({
        collection: collection
      });
      a.attachTo(getEl());
      _ref = a.children, child1 = _ref[0], child2 = _ref[1];
      assert.equal(0, child1.model.get('foo'));
      assert.equal(1, child2.model.get('foo'));
      assertSiblings(child1, child2);
      a.children[0].model.set('foo', 2);
      collection.sort();
      _ref1 = a.children, child1 = _ref1[0], child2 = _ref1[1];
      assert.equal(1, child1.model.get('foo'));
      assert.equal(2, child2.model.get('foo'));
      assertSiblings(child1, child2);
      return assertAttached(a.children);
    });
    it('should keep model views sorted when a new model is added', function() {
      var a, child1, child2, child3, collection, _ref;
      collection = new Giraffe.Collection([
        {
          foo: 0
        }, {
          foo: 2
        }
      ], {
        comparator: 'foo'
      });
      a = new Giraffe.Contrib.CollectionView({
        collection: collection
      });
      a.addOne({
        foo: 1
      });
      _ref = a.children, child1 = _ref[0], child2 = _ref[1], child3 = _ref[2];
      assertSiblings(child1, child2);
      assertSiblings(child2, child3);
      return assertAttached(a.children);
    });
    it('should use the `modelView` option to construct the views', function() {
      var MyModelView, a, child;
      MyModelView = Giraffe.View.extend({
        foo: 'bar'
      });
      a = new Giraffe.Contrib.CollectionView({
        modelView: MyModelView
      });
      a.addOne({});
      child = a.children[0];
      assert.ok(child instanceof MyModelView);
      return assert.equal('bar', child.foo);
    });
    it('should pass `modelViewArgs` to the model views', function() {
      var a, child;
      a = new Giraffe.Contrib.CollectionView({
        modelViewArgs: [
          {
            foo: 'bar'
          }
        ]
      });
      a.addOne({});
      child = a.children[0];
      return assert.equal('bar', child.foo);
    });
    return it('should insert the model views in `modelViewEl` if provided', function() {
      var a, child, className;
      className = 'my-model-view-container';
      a = new Giraffe.Contrib.CollectionView({
        modelViewEl: '.' + className,
        templateStrategy: function() {
          return "<div class='" + className + "'></div>";
        }
      });
      a.addOne({});
      child = a.children[0];
      return assertAttached(child, a.$('.' + className));
    });
  });

}).call(this);


/*
//@ sourceMappingURL=appTest.map
*/