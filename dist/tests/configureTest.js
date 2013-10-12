(function() {
  var Foo, assert, ut;

  assert = chai.assert;

  ut = window.ut;

  Foo = function(options) {
    return Giraffe.configure(this, options);
  };

  describe('Giraffe.configure', function() {
    _.extend(Foo.prototype, Backbone.Events);
    it('should be OK', function() {
      return assert.ok(Giraffe.configure);
    });
    it('should give proper precedence to the instance\'s `defaultOptions`', function() {
      debugger;
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
    return it('should listen for data events on objects created during `initialize`', function(done) {
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
  });

}).call(this);
