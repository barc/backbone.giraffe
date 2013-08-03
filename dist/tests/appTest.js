(function() {
  var assert;

  assert = chai.assert;

  describe('Giraffe.App', function() {
    it('should be OK', function() {
      var app;
      app = new Giraffe.App;
      return assert.ok(app);
    });
    return it('should accept appEvents', function(done) {
      
    var MyApp = Giraffe.App.extend({
      appEvents: {
        'all': 'catchAll'
      },
      catchAll: function() {
        done()
      }
    });
    ;
      var app;
      app = new MyApp;
      return app.start();
    });
  });

}).call(this);


/*
//@ sourceMappingURL=appTest.map
*/