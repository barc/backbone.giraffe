(function() {
  var areSiblings, assert, assertAttached, assertDisposed, assertHasText, assertNested, assertNotAttached, assertNotDisposed, assertNotNested, assertNotRendered, assertRendered, assertSiblings, getEl, hasText;

  assert = chai.assert;

  getEl = function(el) {
    return $('<div class="test-div"></div>').appendTo(el || 'body');
  };

  areSiblings = function(a, b) {
    var $a, bEl, _ref;
    $a = a.$el || (a instanceof $ ? a : $(a));
    bEl = ((_ref = b.$el) != null ? _ref[0] : void 0) || (b instanceof $ ? b[0] : b);
    return $a.next()[0] === bEl && !!bEl;
  };

  hasText = function($el, text) {
    return text === $el.text().trim();
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
    return assert.ok(areSiblings(a, b));
  };

  assertRendered = function(view) {
    return assert.ok(view._renderedOnce);
  };

  assertNotRendered = function(view) {
    return assert.ok(!view._renderedOnce);
  };

  assertHasText = function(view, text, className) {
    var $el;
    if (className) {
      $el = view.$('.' + className);
    } else {
      $el = view.$el;
    }
    assert.ok($el.length);
    return assert.ok(hasText($el, text));
  };

  describe('Assert Helpers', function() {
    it('should get a new element', function() {
      var $el1, $el2;
      $el1 = getEl();
      $el2 = getEl();
      assert.notEqual($el1[0], $el2[0]);
      assert.lengthOf($el1, 1);
      return assert.lengthOf($el2, 1);
    });
    it('should test a nested relationship', function() {
      var child1, child2, parent;
      parent = {};
      child1 = {
        parent: parent
      };
      child2 = {
        parent: parent
      };
      parent.children = [child1, child2];
      assertNested(child1, parent);
      assertNested(child2, parent);
      assertNotNested(parent, child1);
      return assertNotNested(child1, child2);
    });
    it('should test an ordered sibling relationship', function() {
      var $a, $b, $c, $el;
      $el = getEl();
      $a = getEl($el);
      $b = getEl($el);
      $c = getEl($el);
      assertSiblings($a, $b);
      assertSiblings($b, $c);
      assertSiblings($a[0], $b[0]);
      assertSiblings($b[0], $c[0]);
      assert.ok(areSiblings($a, $b));
      assert.ok(!areSiblings($b, $a));
      assert.ok(!areSiblings($c, $a));
      assert.ok(!areSiblings($c, $b));
      return assert.ok(!areSiblings($a, $a));
    });
    return it('should detect if a view or el contains text', function() {
      var a;
      a = new Giraffe.View;
      a.$el.append('<div class="my-class">;)</div>');
      assertHasText(a, ';)', 'my-class');
      assert.ok(hasText(a.$el.find('.my-class'), ';)'));
      assert.ok(hasText(a.$el, ';)'));
      return assert.ok(!hasText(a.$el, ';('));
    });
  });

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
    it('should dispose the replaced view when using method "html"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = getEl();
      a.attachTo($el);
      b.attachTo($el, {
        method: 'html'
      });
      assert.ok(!a.isAttached());
      assert.ok(b.isAttached());
      assertDisposed(a);
      return assertNotDisposed(b);
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
    it('should propagate dispose to deeply nested views', function() {
      var child, grandchild, greatgrandchild, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      grandchild = new Giraffe.View;
      greatgrandchild = new Giraffe.View;
      parent.attach(child);
      child.attach(grandchild);
      grandchild.attach(greatgrandchild);
      assertNotDisposed(parent);
      assertNotDisposed(child);
      assertNotDisposed(grandchild);
      assertNotDisposed(greatgrandchild);
      parent.dispose();
      assertDisposed(parent);
      assertDisposed(child);
      assertDisposed(grandchild);
      return assertDisposed(greatgrandchild);
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
    it('should not dispose of a cached child view when the parent renders', function() {
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
      assertAttached(child, parent.$el);
      assertNotAttached(grandchild, child.$el);
      return assertNotDisposed(grandchild);
    });
    it('should not dispose of a child view when the parent renders if `preserve` is `true`', function() {
      var child, grandchild, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      grandchild = new Giraffe.View;
      parent.attach(child);
      child.attach(grandchild);
      child.render({
        preserve: true
      });
      assertNested(child, parent);
      assertNested(grandchild, child);
      assertAttached(child, parent.$el);
      assertNotAttached(grandchild, child.$el);
      return assertNotDisposed(grandchild);
    });
    it('should add and remove several children as siblings', function() {
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
    var CollectionView;
    CollectionView = Giraffe.Contrib.CollectionView;
    it('should be OK', function() {
      return assert.ok(new CollectionView);
    });
    it('should render model views passed to the constructor', function() {
      var a, child1, child2, collection, _ref;
      collection = new Giraffe.Collection([{}, {}]);
      a = new CollectionView({
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
      a = new CollectionView({
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
      A = CollectionView.extend({
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
      a = new CollectionView({
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
    it('should sync when models are added to the collection', function() {
      var a;
      a = new CollectionView;
      a.attachTo(getEl());
      a.collection.add({});
      assert.lengthOf(a.children, 1);
      a.collection.add({});
      assert.lengthOf(a.children, 2);
      return assertAttached(a.children);
    });
    it('should sync when models are added via `addOne`', function() {
      var a;
      a = new CollectionView;
      a.attachTo(getEl());
      a.addOne({});
      assert.lengthOf(a.children, 1);
      a.addOne({});
      assert.lengthOf(a.children, 2);
      return assertAttached(a.children);
    });
    it('should sync when models are removed from the collection', function() {
      var a, modelView1, modelView2, _ref;
      a = new CollectionView;
      a.attachTo(getEl());
      a.collection.add([{}, {}]);
      assert.lengthOf(a.children, 2);
      _ref = a.children, modelView1 = _ref[0], modelView2 = _ref[1];
      assert.ok(modelView1 && modelView2);
      assert.ok(modelView1.isAttached());
      assert.ok(modelView2.isAttached());
      a.collection.remove(a.collection.at(0));
      assert.lengthOf(a.children, 1);
      assertDisposed(modelView1);
      assertNotDisposed(modelView2);
      a.collection.remove(a.collection.at(0));
      assert.lengthOf(a.children, 0);
      return assertDisposed(modelView2);
    });
    it('should sync when models are removed via `removeOne`', function() {
      var a, modelView1, modelView2, _ref;
      a = new CollectionView;
      a.attachTo(getEl());
      a.collection.add([{}, {}]);
      assert.lengthOf(a.children, 2);
      _ref = a.children, modelView1 = _ref[0], modelView2 = _ref[1];
      assert.ok(modelView1 && modelView2);
      assert.ok(modelView1.isAttached());
      assert.ok(modelView2.isAttached());
      a.removeOne(a.collection.at(0));
      assert.lengthOf(a.children, 1);
      assertDisposed(modelView1);
      assertNotDisposed(modelView2);
      a.removeOne(a.collection.at(0));
      assert.lengthOf(a.children, 0);
      return assertDisposed(modelView2);
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
      a = new CollectionView({
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
      a = new CollectionView({
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
      a = new CollectionView({
        modelView: MyModelView
      });
      a.addOne({});
      child = a.children[0];
      assert.ok(child instanceof MyModelView);
      return assert.equal('bar', child.foo);
    });
    it('should pass `modelViewArgs` to the model views', function() {
      var a, child;
      a = new CollectionView({
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
    it('should insert the model views in `modelViewEl` if provided', function() {
      var a, child1, child2, className;
      className = 'my-model-view-el';
      a = new CollectionView({
        modelViewEl: '.' + className,
        templateStrategy: function() {
          return "<div class='" + className + "'></div>";
        }
      });
      a.addOne({});
      child1 = a.children[0];
      assertAttached(child1, a.$('.' + className));
      a.addOne({});
      child2 = a.children[1];
      assertAttached(child2, a.$('.' + className));
      return assertSiblings(child1, child2);
    });
    return it('should accept View#ui names for `modelViewEl`', function() {
      var a, child, className;
      className = 'my-model-view-el';
      a = new CollectionView({
        ui: {
          $myModelViewEl: '.' + className
        },
        modelViewEl: '$myModelViewEl',
        templateStrategy: function() {
          return "<div class='" + className + "'></div>";
        }
      });
      a.addOne({});
      child = a.children[0];
      return assertAttached(child, a.$myModelViewEl);
    });
  });

  describe('Giraffe.Contrib.FastCollectionView', function() {
    var FastCollectionView, fcvDefaults;
    FastCollectionView = Giraffe.Contrib.FastCollectionView;
    fcvDefaults = {
      modelTemplate: '<li data-model-cid="<%= cid %>"></li>',
      modelTemplateStrategy: 'underscore-template'
    };
    it('should be OK', function() {
      return assert.ok(new FastCollectionView(fcvDefaults));
    });
    it('should render els for models passed to the constructor', function() {
      var a, collection;
      collection = new Giraffe.Collection([{}, {}]);
      a = new FastCollectionView(_.defaults({
        collection: collection
      }, fcvDefaults));
      assert.lengthOf(a.$el.children(), 0);
      a.render();
      assert.lengthOf(a.children, 0);
      return assert.lengthOf(a.$el.children(), 2);
    });
    it('should render models views when extended', function() {
      var A, a, collection;
      collection = new Giraffe.Collection([{}, {}]);
      A = FastCollectionView.extend(_.defaults({
        collection: collection
      }, fcvDefaults));
      a = new A;
      a.attachTo(getEl());
      return assert.lengthOf(a.$el.children(), 2);
    });
    it('should sync when the collection is reset', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(getEl());
      a.addOne({});
      assert.lengthOf(a.$el.children(), 1);
      a.collection.reset([{}, {}]);
      return assert.lengthOf(a.$el.children(), 2);
    });
    it('should sync when models are added to the collection', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(getEl());
      assert.lengthOf(a.$el.children(), 0);
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 1);
      a.collection.add([{}, {}]);
      return assert.lengthOf(a.$el.children(), 3);
    });
    it('should sync when models are added via `addOne`', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(getEl());
      a.addOne({});
      assert.lengthOf(a.$el.children(), 1);
      a.addOne({});
      assert.lengthOf(a.$el.children(), 2);
      a.addOne({});
      return assert.lengthOf(a.$el.children(), 3);
    });
    it('should sync when models are removed from the collection', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(getEl());
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 1);
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 2);
      a.collection.remove(a.collection.at(1));
      assert.lengthOf(a.$el.children(), 1);
      a.collection.remove(a.collection.at(0));
      return assert.lengthOf(a.$el.children(), 0);
    });
    it('should sync when models are removed via `removeOne`', function() {
      var a;
      a = new FastCollectionView(fcvDefaults);
      a.attachTo(getEl());
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 1);
      a.collection.add({});
      assert.lengthOf(a.$el.children(), 2);
      a.removeOne(a.collection.at(1));
      assert.lengthOf(a.$el.children(), 1);
      a.removeOne(a.collection.at(0));
      return assert.lengthOf(a.$el.children(), 0);
    });
    it('should keep model views sorted when a value changes', function() {
      var a, collection, el1, el2, model1, model2, _ref, _ref1;
      collection = new Giraffe.Collection([
        {
          foo: 1
        }, {
          foo: 0
        }
      ], {
        comparator: 'foo'
      });
      a = new FastCollectionView(_.defaults({
        collection: collection
      }, fcvDefaults));
      a.attachTo(getEl());
      _ref = a.collection.models, model1 = _ref[0], model2 = _ref[1];
      assert.equal(0, model1.get('foo'));
      assert.equal(1, model2.get('foo'));
      el1 = a.getElByCid(model1.cid);
      el2 = a.getElByCid(model2.cid);
      assertSiblings(el1, el2);
      model1.set('foo', 2);
      collection.sort();
      _ref1 = a.collection.models, model1 = _ref1[0], model2 = _ref1[1];
      assert.equal(1, model1.get('foo'));
      assert.equal(2, model2.get('foo'));
      el1 = a.getElByCid(model1.cid);
      el2 = a.getElByCid(model2.cid);
      return assertSiblings(el1, el2);
    });
    it('should keep model views sorted when a new model is added', function() {
      var a, collection, el1, el2, el3, model1, model2, model3, _ref;
      collection = new Giraffe.Collection([
        {
          foo: 0
        }, {
          foo: 2
        }
      ], {
        comparator: 'foo'
      });
      a = new FastCollectionView(_.defaults({
        collection: collection
      }, fcvDefaults));
      a.addOne({
        foo: 1
      });
      _ref = collection.models, model1 = _ref[0], model2 = _ref[1], model3 = _ref[2];
      el1 = a.getElByCid(model1.cid);
      el2 = a.getElByCid(model2.cid);
      el3 = a.getElByCid(model3.cid);
      assertSiblings(el1, el2);
      return assertSiblings(el2, el3);
    });
    it('should use the `modelTemplate` option to construct the DOM', function() {
      var $children, a;
      a = new FastCollectionView({
        collection: new Giraffe.Collection({
          foo: 'bar'
        }),
        modelTemplate: '<li data-model-cid="<%= cid %>"><%= attributes.foo %></li>',
        modelTemplateStrategy: 'underscore-template'
      });
      $children = a.$el.children();
      assert.lengthOf($children, 0);
      a.render();
      $children = a.$el.children();
      assert.lengthOf($children, 1);
      a.addOne({
        foo: 'baz'
      });
      $children = a.$el.children();
      assert.lengthOf($children, 2);
      assert.equal('bar', $children.first().text());
      return assert.equal('baz', $children.last().text());
    });
    it('should use `modelSerialize` to send custom data to the template', function() {
      var a;
      a = new FastCollectionView({
        collection: new Giraffe.Collection({
          foo: 'bar'
        }),
        modelTemplate: '<li data-model-cid="<%= cid %>"><%= foo %></li>',
        modelTemplateStrategy: 'underscore-template',
        modelSerialize: function() {
          var data;
          data = this.model.toJSON();
          data.cid = this.model.cid;
          return data;
        }
      });
      assert.ok(!a.$el.text());
      a.render();
      return assert.equal('bar', a.$el.text());
    });
    it('should insert the model views in `modelEl` if provided', function() {
      var a, className;
      className = 'my-model-view-el';
      a = new FastCollectionView({
        modelEl: '.' + className,
        templateStrategy: function() {
          return "<ul class='" + className + "'></ul>";
        },
        modelTemplate: '<li data-model-cid="<%= cid %>"><%= attributes.foo %></li>',
        modelTemplateStrategy: 'underscore-template'
      });
      a.addOne({
        foo: 'bar'
      });
      return assertHasText(a, 'bar', className);
    });
    return it('should accept View#ui names for `modelEl`', function() {
      var a, className;
      className = 'my-model-view-el';
      a = new FastCollectionView({
        ui: {
          $myModelEl: '.' + className
        },
        modelEl: '$myModelEl',
        templateStrategy: function() {
          return "<div class='" + className + "'></div>";
        },
        modelTemplate: '<li data-model-cid="<%= cid %>"><%= attributes.foo %></li>',
        modelTemplateStrategy: 'underscore-template'
      });
      a.addOne({
        foo: 'bar'
      });
      return assertHasText(a, 'bar', className);
    });
  });

}).call(this);


/*
//@ sourceMappingURL=appTest.map
*/