(function() {
  var assert;

  assert = chai.assert;

  describe('Giraffe.App', function() {
    it('should be OK', function() {
      var app;
      app = new Giraffe.App;
      return assert.ok(app);
    });
    it('should accept appEvents on extended class', function(done) {
      var MyApp, app;
      MyApp = Giraffe.App.extend({
        appEvents: {
          'app:initialized': function() {
            return done();
          }
        }
      });
      app = new MyApp;
      return app.start();
    });
    return it('should accept appEvents as an option', function(done) {
      var app;
      app = new Giraffe.App({
        appEvents: {
          'app:initialized': function() {
            return done();
          }
        }
      });
      return app.start();
    });
  });

}).call(this);


/*
//@ sourceMappingURL=appTest.map
*/