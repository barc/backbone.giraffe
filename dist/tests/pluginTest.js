(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  describe('Giraffe.plugins', function() {
    it('should be OK', function() {
      return assert.ok(Giraffe.plugins);
    });
    it('should add a plugin', function() {
      var count;
      count = Giraffe.plugins.plugins.length;
      Giraffe.plugins.add({});
      return assert.lengthOf(Giraffe.plugins.plugins, count + 1);
    });
    return it('should copy properties to the target functions\' prototypes', function() {
      var Foo;
      Foo = (function() {
        function Foo() {}

        return Foo;

      })();
      Giraffe.plugins.add({
        targetFns: [Foo],
        extendPrototype: {
          bar: 'baz'
        }
      });
      assert.equal('baz', Foo.prototype.bar);
      return assert.notEqual('baz', Giraffe.View.prototype.bar);
    });
  });

}).call(this);
