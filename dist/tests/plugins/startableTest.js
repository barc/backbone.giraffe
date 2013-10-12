(function() {
  var assert, ut;

  assert = chai.assert;

  ut = window.ut;

  describe('Giraffe.plugins.Startable', function() {
    it('should be OK', function() {
      return assert.ok(new Giraffe.App);
    });
    it('should add an initializer and call it on `start`', function(done) {
      var a;
      a = new Giraffe.App;
      a.addInitializer(function() {
        return done();
      });
      return a.start();
    });
    it('should call an initializer even when started', function(done) {
      var a;
      a = new Giraffe.App;
      a.start();
      return a.addInitializer(function() {
        return done();
      });
    });
    it('should set `started` to `true` when started', function() {
      var a;
      a = new Giraffe.App;
      a.start();
      return assert.ok(a.started);
    });
    it('should extend with options passed to `start`', function(done) {
      var a;
      a = new Giraffe.App;
      a.start({
        done: done
      });
      return a.done();
    });
    it('should extend options to the instance after muting them in an initializer', function() {
      var a;
      a = new Giraffe.App;
      a.addInitializer(function(options) {
        return options.foo = 'bar';
      });
      a.start();
      return assert.equal('bar', a.foo);
    });
    it('should extend options to the instance after muting them in an initializer even if already started', function() {
      var a;
      a = new Giraffe.App;
      a.start();
      a.addInitializer(function(options) {
        return options.foo = 'bar';
      });
      return assert.equal('bar', a.foo);
    });
    it('should cascade options in order', function() {
      var a;
      a = new Giraffe.App;
      a.addInitializer(function(options) {
        return options.foo = 'bar';
      });
      a.addInitializer(function(options) {
        return options.foo = 'baz';
      });
      a.start();
      return assert.equal('baz', a.foo);
    });
    it('should call `beforeStart` before starting', function(done) {
      var a;
      a = new Giraffe.App({
        beforeStart: function() {
          assert.ok(!this.started);
          return done();
        }
      });
      return a.start();
    });
    return it('should call `afterStart` after asynchronously starting', function(done) {
      var a;
      a = new Giraffe.App({
        afterStart: function() {
          assert.ok(this.started);
          return done();
        }
      });
      return setTimeout((function() {
        return a.start();
      }), 1);
    });
  });

}).call(this);
