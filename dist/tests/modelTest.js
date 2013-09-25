(function() {
  var assert;

  assert = chai.assert;

  describe('Giraffe.Model', function() {
    it('should be OK', function() {
      return assert.ok(new Giraffe.Model);
    });
    return it('should accept `appEvents` as an option', function() {
      return ut.assertAppEventsOption(Giraffe.Model, 1);
    });
  });

}).call(this);


/*
//@ sourceMappingURL=modelTest.map
*/