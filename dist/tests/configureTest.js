(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  describe('Giraffe.configure', function() {
    var Foo;
    Foo = function(options) {
      return Giraffe.configure(this, options);
    };
    _.extend(Foo.prototype, Backbone.Events);
    it('should be OK', function() {
      return assert.ok(Giraffe.configure);
    });
    it('should extend the object with `options`', function() {
      var foo;
      foo = new Foo({
        bar: 'baz'
      });
      return assert.equal('baz', foo.bar);
    });
    it('should extend the class with `options`', function() {
      var F, f;
      F = (function() {
        function F() {}

        F.prototype.bar = 'baz';

        return F;

      })();
      f = new F;
      return assert.equal('baz', f.bar);
    });
    it('should not extend the object with `options` if `options.omittedOptions` is `true`', function() {
      var foo;
      foo = new Foo({
        bar: 'baz',
        omittedOptions: true
      });
      return assert.notEqual('baz', foo.bar);
    });
    it('should not extend the object with `options` if `obj.omittedOptions` is `true`', function() {
      var F, f;
      F = (function() {
        function F() {}

        F.prototype.omittedOptions = true;

        return F;

      })();
      f = new F({
        bar: 'baz'
      });
      return assert.notEqual('baz', f.bar);
    });
    it('should not extend the object with `omittedOptions`', function() {
      var foo;
      foo = new Foo({
        bar: 'baz',
        omittedOptions: 'bar'
      });
      assert.equal(void 0, foo.bar);
      return assert.equal('bar', foo.omittedOptions);
    });
    it('should extend the object with the global `defaultOptions`', function() {
      var foo;
      Giraffe.defaultOptions.globalOption = 42;
      foo = new Foo;
      assert.equal(42, foo.globalOption);
      return delete Giraffe.defaultOptions.globalOption;
    });
    it('should extend the object with the constuctor\'s `defaultOptions`', function() {
      var foo;
      Foo.defaultOptions = {
        ctorOption: 42
      };
      foo = new Foo;
      assert.equal(42, foo.ctorOption);
      return delete Foo.defaultOptions;
    });
    it('should extend the object with the object\'s `defaultOptions`', function() {
      var foo;
      Foo.prototype.defaultOptions = {
        protoOption: 42
      };
      foo = new Foo;
      assert.equal(42, foo.protoOption);
      return delete Foo.prototype.defaultOptions;
    });
    it('should give proper precedence to the instance\'s `defaultOptions`', function() {
      var foo;
      Giraffe.defaultOptions.option = 1;
      Foo.defaultOptions = {
        option: 2
      };
      foo = new Foo;
      assert.equal(2, foo.option);
      Foo.prototype.defaultOptions = {
        option: 3
      };
      foo = new Foo;
      assert.equal(3, foo.option);
      return delete Giraffe.defaultOptions.option;
    });
    it('should wrap a function with `before` and `after` calls', function() {
      var count, foo;
      count = 0;
      foo = new Foo({
        bar: function() {},
        beforeBar: function() {
          return count += 1;
        },
        afterBar: function() {
          return count += 1;
        }
      });
      Giraffe.wrapFn(foo, 'bar');
      foo.bar();
      return assert.equal(2, count);
    });
    it('should call `beforeInitialize` if `initialize` is defined', function(done) {
      var foo;
      foo = new Foo({
        initialize: function() {},
        beforeInitialize: function() {
          return done();
        }
      });
      return foo.initialize();
    });
    it('should call `afterInitialize` if `initialize` is defined', function(done) {
      var foo;
      foo = new Foo({
        initialize: function() {},
        afterInitialize: function() {
          return done();
        }
      });
      return foo.initialize();
    });
    it('should listen for data events', function(done) {
      var foo;
      foo = new Foo({
        model: new Backbone.Model,
        dataEvents: {
          'done model': function() {
            return done();
          }
        }
      });
      return foo.model.trigger('done');
    });
    it('should listen for data events on an object with `Backbone.Events`', function(done) {
      var foo;
      foo = {
        model: new Backbone.Model,
        dataEvents: {
          'done model': function() {
            return done();
          }
        }
      };
      _.extend(foo, Backbone.Events);
      Giraffe.configure(foo);
      return foo.model.trigger('done');
    });
    it('should listen for data events on self', function() {
      var count, foo;
      count = 0;
      foo = new Foo({
        dataEvents: {
          'done this': function() {
            return count += 1;
          },
          'done @': function() {
            return count += 1;
          }
        }
      });
      foo.trigger('done');
      return assert.equal(2, count);
    });
    it('should listen for data events on objects created during `initialize`', function(done) {
      var foo;
      foo = new Giraffe.Model({}, {
        initialize: function() {
          return this.model = new Backbone.Model;
        },
        dataEvents: {
          'done model': function() {
            return done();
          }
        }
      });
      return foo.model.trigger('done');
    });
    it('should configure a POJO', function() {
      var foo;
      foo = {};
      Giraffe.configure(foo, {
        bar: 'baz'
      });
      return assert.equal('baz', foo.bar);
    });
    return it('should override POJO properties with options', function() {
      var foo;
      foo = {
        bar: 'boo'
      };
      Giraffe.configure(foo, {
        bar: 'baz'
      });
      return assert.equal('baz', foo.bar);
    });
  });

}).call(this);


/*
//@ sourceMappingURL=configureTest.map
*/