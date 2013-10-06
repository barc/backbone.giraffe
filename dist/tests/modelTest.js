(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  describe('Giraffe.Model', function() {
    it('should be OK', function() {
      return assert.ok(new Giraffe.Model);
    });
    it('should accept `appEvents` as an option', function() {
      return ut.assert.appEventsOption(Giraffe.Model, 1);
    });
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
      var model, parse;
      Giraffe.Model.defaultOptions.omittedOptions = null;
      parse = function() {};
      model = new Giraffe.Model({}, {
        parse: parse,
        bar: 'baz'
      });
      return assert.equal(parse, model.parse);
    });
  });

}).call(this);


/*
//@ sourceMappingURL=modelTest.map
*/