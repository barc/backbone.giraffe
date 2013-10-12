(function() {
  var Foo, assert, ut;

  assert = chai.assert;

  ut = window.ut;

  Foo = function(options) {
    return Giraffe.configure(this, options);
  };

  describe('Giraffe.plugins.Extendable', function() {
    it('should extend a configured pojo', function() {
      var foo;
      foo = {};
      Giraffe.configure(foo, {
        bar: 'baz'
      });
      return assert.equal('baz', foo.bar);
    });
    it('should override pojo properties with options', function() {
      var foo;
      foo = {
        bar: 'boo'
      };
      Giraffe.configure(foo, {
        bar: 'baz'
      });
      return assert.equal('baz', foo.bar);
    });
    it('should extend a configured object with `options`', function() {
      var foo;
      foo = new Foo({
        bar: 'baz'
      });
      return assert.equal('baz', foo.bar);
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
    describe('Extendable Giraffe.Model', function() {
      it('should omit the \'parse\' option by default', function() {
        var model;
        model = new Giraffe.Model({}, {
          parse: 'foo',
          bar: 'baz'
        });
        assert.notEqual('foo', model.parse);
        return assert.equal('baz', model.bar);
      });
      it('should allow the \'parse\' option when configured as an option', function() {
        var model, parse;
        parse = function() {};
        model = new Giraffe.Model({}, {
          parse: parse,
          bar: 'baz',
          omittedOptions: null
        });
        return assert.equal(parse, model.parse);
      });
      return it('should allow the \'parse\' option when configured on the class constructor', function() {
        var model, opts, parse;
        opts = Giraffe.Model.defaultOptions.omittedOptions;
        Giraffe.Model.defaultOptions.omittedOptions = null;
        parse = function() {};
        model = new Giraffe.Model({}, {
          parse: parse,
          bar: 'baz'
        });
        assert.equal(parse, model.parse);
        return Giraffe.Model.defaultOptions.omittedOptions = opts;
      });
    });
    return describe('Extendable Giraffe.Collection', function() {
      return it('should omit the \'parse\' option by default', function() {
        var collection;
        collection = new Giraffe.Collection([], {
          parse: 'foo',
          bar: 'baz'
        });
        assert.notEqual('foo', collection.parse);
        return assert.equal('baz', collection.bar);
      });
    });
  });

}).call(this);
