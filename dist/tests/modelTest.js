(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  describe('Giraffe.Model', function() {
    it('should be OK', function() {
      return assert.ok(new Giraffe.Model);
    });
    return it('should accept `appEvents` as an option', function() {
      return ut.assert.appEventsOption(Giraffe.Model, 1);
    });
  });

}).call(this);


/*
//@ sourceMappingURL=modelTest.map
*/