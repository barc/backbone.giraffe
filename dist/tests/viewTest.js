(function() {
  var areSiblings, assert, assertAttached, assertDisposed, assertHasText, assertNested, assertNotAttached, assertNotDisposed, assertNotNested, assertNotRendered, assertRendered, assertSiblings, getEl, hasText;

  assert = chai.assert;

  getEl = ut.getEl, areSiblings = ut.areSiblings, hasText = ut.hasText, assertNested = ut.assertNested, assertNotNested = ut.assertNotNested, assertAttached = ut.assertAttached, assertNotAttached = ut.assertNotAttached, assertDisposed = ut.assertDisposed, assertNotDisposed = ut.assertNotDisposed, assertSiblings = ut.assertSiblings, assertRendered = ut.assertRendered, assertNotRendered = ut.assertNotRendered, assertHasText = ut.assertHasText;

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
    it('should dispose of objects added to the view via `addChild`', function(done) {
      var collection, view;
      collection = new Giraffe.Collection;
      view = new Giraffe.View;
      view.addChild(collection);
      collection.on("disposed", function() {
        return done();
      });
      return view.dispose();
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
    it('should accept `appEvents` as an option', function() {
      return ut.assertAppEventsOption(Giraffe.View);
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

}).call(this);


/*
//@ sourceMappingURL=viewTest.map
*/