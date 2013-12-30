(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  describe('Giraffe.Collection', function() {
    it('should be OK', function() {
      return assert.ok(new Giraffe.Collection);
    });
    it('should accept `appEvents` as an option', function() {
      return ut.assert.appEventsOption(Giraffe.Collection, 1);
    });
    it('should create instances of `Giraffe.Model` from a plain array passed to the constructor', function() {
      var collection;
      collection = new Giraffe.Collection([{}, {}]);
      collection.each(function(model) {
        return assert.ok(model instanceof Giraffe.Model);
      });
      return assert.lengthOf(collection, 2);
    });
    it('should propagate `dispose` to all models', function() {
      var collection, disposeCount;
      collection = new Giraffe.Collection([{}, {}, {}]);
      disposeCount = 0;
      collection.each(function(model) {
        return model.on("disposed", function() {
          return disposeCount += 1;
        });
      });
      collection.dispose();
      return assert.equal(3, disposeCount);
    });
    it('should omit the \'parse\' option by default', function() {
      var collection;
      collection = new Giraffe.Collection([], {
        parse: 'foo',
        bar: 'baz'
      });
      assert.notEqual('foo', collection.parse);
      return assert.equal('baz', collection.bar);
    });
    return it('should dispose of models when the collection is reset', function(done) {
      var collection, model;
      model = new Giraffe.Model;
      model.dispose = done;
      collection = new Giraffe.Collection([model]);
      return collection.reset();
    });
  });

}).call(this);


/*
//@ sourceMappingURL=collectionTest.map
*/