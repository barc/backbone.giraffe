(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  ut = window.ut = {};

  ut.getEl = function(el) {
    return $('<div class="test-div"></div>').appendTo(el || 'body');
  };

  ut.areSiblings = function(a, b) {
    var $a, bEl, _ref;
    $a = a.$el || (a instanceof $ ? a : $(a));
    bEl = ((_ref = b.$el) != null ? _ref[0] : void 0) || (b instanceof $ ? b[0] : b);
    return $a.next()[0] === bEl && !!bEl;
  };

  ut.hasText = function($el, text) {
    return text === $el.text().trim();
  };

  ut.assert = {};

  ut.assert.nested = function(child, parent) {
    assert.ok(_.contains(parent.children, child));
    return assert.equal(parent, child.parent);
  };

  ut.assert.notNested = function(child, parent) {
    assert.ok(!_.contains(parent.children, child));
    return assert.notEqual(parent, child.parent);
  };

  ut.assert.attached = function(child, parent) {
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

  ut.assert.notAttached = function(child, parent) {
    return assert.ok(!child.isAttached(parent));
  };

  ut.assert.disposed = function(view) {
    assert.ok(!view.$el);
    return assert.ok(!view.isAttached());
  };

  ut.assert.notDisposed = function(view) {
    return assert.ok(!!view.$el);
  };

  ut.assert.siblings = function(a, b) {
    return assert.ok(ut.areSiblings(a, b));
  };

  ut.assert.rendered = function(view) {
    return assert.ok(view._renderedOnce);
  };

  ut.assert.notRendered = function(view) {
    return assert.ok(!view._renderedOnce);
  };

  ut.assert.hasText = function(view, text, className) {
    var $el;
    if (className) {
      $el = view.$('.' + className);
    } else {
      $el = view.$el;
    }
    assert.ok($el.length);
    return assert.ok(ut.hasText($el, text));
  };

  ut.assert.appEventsOption = function(ctor, optionsArgIndex, args) {
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

  describe('Test helper utils', function() {
    it('should get a new element', function() {
      var $el1, $el2;
      $el1 = ut.getEl();
      $el2 = ut.getEl();
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
      ut.assert.nested(child1, parent);
      ut.assert.nested(child2, parent);
      ut.assert.notNested(parent, child1);
      return ut.assert.notNested(child1, child2);
    });
    it('should test an ordered sibling relationship', function() {
      var $a, $b, $c, $el;
      $el = ut.getEl();
      $a = ut.getEl($el);
      $b = ut.getEl($el);
      $c = ut.getEl($el);
      ut.assert.siblings($a, $b);
      ut.assert.siblings($b, $c);
      ut.assert.siblings($a[0], $b[0]);
      ut.assert.siblings($b[0], $c[0]);
      assert.ok(ut.areSiblings($a, $b));
      assert.ok(!ut.areSiblings($b, $a));
      assert.ok(!ut.areSiblings($c, $a));
      assert.ok(!ut.areSiblings($c, $b));
      return assert.ok(!ut.areSiblings($a, $a));
    });
    return it('should detect if a view or el contains text', function() {
      var a;
      a = new Giraffe.View;
      a.$el.append('<div class="my-class">;)</div>');
      ut.assert.hasText(a, ';)', 'my-class');
      assert.ok(ut.hasText(a.$el.find('.my-class'), ';)'));
      assert.ok(ut.hasText(a.$el, ';)'));
      return assert.ok(!ut.hasText(a.$el, ';('));
    });
  });

}).call(this);


/*
//@ sourceMappingURL=utilsTest.map
*/