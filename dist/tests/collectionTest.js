(function() {
  var assert;

  assert = chai.assert;

  describe('Giraffe.Collection', function() {
    it('should be OK', function() {
      return assert.ok(new Giraffe.Collection);
    });
    it('should accept `appEvents` as an option', function() {
      return ut.assertAppEventsOption(Giraffe.Collection, 1);
    });
    it('should create instances of `Giraffe.Model` from a plain array passed to the constructor', function() {
      var collection;
      collection = new Giraffe.Collection([{}, {}]);
      collection.each(function(model) {
        return assert.ok(model instanceof Giraffe.Model);
      });
      return assert.lengthOf(collection, 2);
    });
    return it('should propagate `dispose` to all models', function() {
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
  });

}).call(this);


/*
//@ sourceMappingURL=collectionTest.map
*/