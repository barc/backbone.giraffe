(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  describe('Giraffe.Model', function() {
    return it('should be OK', function() {
      return assert.ok(new Giraffe.Model);
    });
  });

}).call(this);
