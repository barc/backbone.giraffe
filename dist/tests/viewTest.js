(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

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
      return ut.assert.rendered(a);
    });
    it('should attach a view to the DOM', function() {
      var $el, a;
      a = new Giraffe.View;
      $el = ut.getEl();
      a.attachTo($el);
      assert.ok(a.isAttached());
      return ut.assert.attached(a, $el);
    });
    it('should insert a view and replace the current contents with method "html"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = ut.getEl();
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
      b.attachTo(ut.getEl());
      a.attachTo(b, {
        method: 'before'
      });
      return ut.assert.siblings(a, b);
    });
    it('should insert a view after another with method "after"', function() {
      var a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      a.attachTo(ut.getEl());
      b.attachTo(a, {
        method: 'after'
      });
      return ut.assert.siblings(a, b);
    });
    it('should insert a view at the end of the target\'s children with "append"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = ut.getEl();
      a.attachTo($el);
      b.attachTo($el, {
        method: 'append'
      });
      return ut.assert.siblings(a, b);
    });
    it('should insert a view at the beginning of the target\'s children with "prepend"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = ut.getEl();
      b.attachTo($el);
      a.attachTo($el, {
        method: 'prepend'
      });
      return ut.assert.siblings(a, b);
    });
    it('should render a view when attached and call `afterRender`', function(done) {
      var a;
      a = new Giraffe.View({
        afterRender: function() {
          return done();
        }
      });
      a.attachTo(ut.getEl());
      return ut.assert.rendered(a);
    });
    it('should suppress render on a view when attached', function() {
      var a;
      a = new Giraffe.View({
        afterRender: function() {
          return assert.fail();
        }
      });
      a.attachTo(ut.getEl(), {
        suppressRender: true
      });
      return ut.assert.notRendered(a);
    });
    it('should render content into a view using the default "underscore-template-selector" strategy', function() {
      var $el, a, className, templateId, text;
      $el = ut.getEl();
      templateId = 'my-render-test-template';
      className = 'render-test';
      text = 'hello world';
      $el.append("<script type='text/template' id='" + templateId + "'>\n  <div class='" + className + "'><%= text %></div>\n</script>");
      a = new Giraffe.View({
        template: '#' + templateId,
        text: text
      });
      a.render();
      return ut.assert.hasText(a, text, className);
    });
    it('should render content into a view by overriding `templateStrategy`', function() {
      var $el, a, className, text;
      $el = ut.getEl();
      className = 'render-test';
      text = 'hello world';
      a = new Giraffe.View({
        templateStrategy: function() {
          return "<div class='" + className + "'>" + this.text + "</div>";
        },
        text: text
      });
      a.render();
      return ut.assert.hasText(a, text, className);
    });
    it('should render content into a view using the "jst" strategy', function() {
      var $el, a, className, text;
      $el = ut.getEl();
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
      return ut.assert.hasText(a, text, className);
    });
    it('should render content into a view using the "underscore-template" strategy', function() {
      var $el, a, className, text;
      $el = ut.getEl();
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
      return ut.assert.hasText(a, text, className);
    });
    it('should dispose of a view', function() {
      var a;
      a = new Giraffe.View;
      a.dispose();
      return ut.assert.disposed(a);
    });
    it('should remove the view from the DOM on dispose', function() {
      var $el, a;
      a = new Giraffe.View;
      $el = ut.getEl();
      a.attachTo($el);
      ut.assert.attached(a, $el);
      a.dispose();
      return ut.assert.disposed(a);
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
      a.attachTo(ut.getEl());
      a.detach();
      assert.ok(!a.isAttached());
      return ut.assert.disposed(a);
    });
    it('should detach a view and not dispose it due to passing `true` to `detach`', function() {
      var a;
      a = new Giraffe.View;
      a.attachTo(ut.getEl());
      a.detach(true);
      assert.ok(!a.isAttached());
      return ut.assert.notDisposed(a);
    });
    it('should detach a view and not dispose due to passing `disposeOnDetach` to the view', function() {
      var a;
      a = new Giraffe.View({
        disposeOnDetach: false
      });
      a.attachTo(ut.getEl());
      a.detach();
      assert.ok(!a.isAttached());
      return ut.assert.notDisposed(a);
    });
    it('should dispose the replaced view when using method "html"', function() {
      var $el, a, b;
      a = new Giraffe.View;
      b = new Giraffe.View;
      $el = ut.getEl();
      a.attachTo($el);
      b.attachTo($el, {
        method: 'html'
      });
      assert.ok(!a.isAttached());
      assert.ok(b.isAttached());
      ut.assert.disposed(a);
      return ut.assert.notDisposed(b);
    });
    it('should nest a view with attach', function() {
      var child, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      parent.attach(child);
      ut.assert.nested(child, parent);
      return ut.assert.attached(child, parent);
    });
    it('should nest a view with attachTo', function() {
      var child, parent;
      parent = new Giraffe.View;
      child = new Giraffe.View;
      child.attachTo(parent);
      ut.assert.nested(child, parent);
      return ut.assert.attached(child, parent);
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
      ut.assert.notDisposed(parent);
      ut.assert.notDisposed(child);
      ut.assert.notDisposed(grandchild);
      ut.assert.notDisposed(greatgrandchild);
      parent.dispose();
      ut.assert.disposed(parent);
      ut.assert.disposed(child);
      ut.assert.disposed(grandchild);
      return ut.assert.disposed(greatgrandchild);
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
      ut.assert.disposed(child1);
      ut.assert.disposed(child2);
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
      ut.assert.notDisposed(child1);
      ut.assert.notDisposed(child2);
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
      ut.assert.notNested(child, parent);
      return ut.assert.disposed(child);
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
      ut.assert.nested(child, parent);
      ut.assert.nested(grandchild, child);
      ut.assert.attached(child, parent.$el);
      ut.assert.notAttached(grandchild, child.$el);
      return ut.assert.notDisposed(grandchild);
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
      ut.assert.nested(child, parent);
      ut.assert.nested(grandchild, child);
      ut.assert.attached(child, parent.$el);
      ut.assert.notAttached(grandchild, child.$el);
      return ut.assert.notDisposed(grandchild);
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
      ut.assert.nested(a, parent);
      ut.assert.nested(b, parent);
      ut.assert.nested(c, parent);
      assert.lengthOf(parent.children, 3);
      c.dispose();
      ut.assert.notNested(c, parent);
      ut.assert.disposed(c);
      assert.lengthOf(parent.children, 2);
      parent.removeChild(a);
      ut.assert.notNested(a, parent);
      ut.assert.disposed(a);
      assert.lengthOf(parent.children, 1);
      parent.removeChild(b, true);
      ut.assert.notNested(b, parent);
      ut.assert.notDisposed(b);
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
    it('should listen for document events', function(done) {
      var a;
      a = new Giraffe.View({
        templateStrategy: function() {
          return "<div data-gf-click='onClick'></div>";
        },
        onClick: function() {
          return done();
        }
      });
      a.attachTo(ut.getEl());
      return a.$('div').click();
    });
    it('should remove document events', function() {
      var a;
      Giraffe.View.removeDocumentEvents();
      a = new Giraffe.View({
        templateStrategy: function() {
          return "<div data-gf-click='onClick'></div>";
        },
        onClick: function() {
          return fail();
        }
      });
      a.attachTo(ut.getEl());
      return a.$('div').click();
    });
    it('should set custom document events', function(done) {
      var a;
      Giraffe.View.setDocumentEvents(['wat']);
      a = new Giraffe.View({
        templateStrategy: function() {
          return "<div data-gf-wat='onWat'></div>";
        },
        onWat: function() {
          return done();
        }
      });
      a.attachTo(ut.getEl());
      return a.$('div').trigger('wat');
    });
    it('should set a custom document event prefix', function(done) {
      var a;
      Giraffe.View.setDocumentEvents('click');
      Giraffe.View.setDocumentEventPrefix('test-on-');
      a = new Giraffe.View({
        templateStrategy: function() {
          return "<div test-on-click='onClick'></div>";
        },
        onClick: function() {
          return done();
        }
      });
      a.attachTo(ut.getEl());
      return a.$('div').click();
    });
    it('should use the custom prefix from the function parameter to `setDocumentEvents`', function(done) {
      var a;
      Giraffe.View.setDocumentEvents('click', 'test-on-');
      a = new Giraffe.View({
        templateStrategy: function() {
          return "<div test-on-click='onClick'></div>";
        },
        onClick: function() {
          return done();
        }
      });
      a.attachTo(ut.getEl());
      return a.$('div').click();
    });
    return it('should allow a blank prefix', function(done) {
      var a;
      Giraffe.View.setDocumentEvents('click');
      Giraffe.View.setDocumentEventPrefix('');
      a = new Giraffe.View({
        templateStrategy: function() {
          return "<div click='onClick'></div>";
        },
        onClick: function() {
          return done();
        }
      });
      a.attachTo(ut.getEl());
      return a.$('div').click();
    });
  });

}).call(this);
