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
      Giraffe.defaultOptions.globalOption = true;
      foo = new Foo;
      return assert.ok(foo.globalOption);
    });
    it('should extend the object with the constuctor\'s `defaultOptions`', function() {
      var foo;
      Foo.defaultOptions = {
        ctorOption: true
      };
      foo = new Foo;
      return assert.ok(foo.ctorOption);
    });
    it('should extend the object with the object\'s `defaultOptions`', function() {
      var foo;
      Foo.prototype.defaultOptions = {
        protoOption: true
      };
      foo = new Foo;
      return assert.ok(foo.protoOption);
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
      return assert.equal(3, foo.option);
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


/*
//@ sourceMappingURL=configureTest.map
*/