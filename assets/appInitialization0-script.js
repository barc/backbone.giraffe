var app = new Giraffe.App();

app.addInitializer(function(options) {
  this.$el.append('<p>initializer `this` is app: ' + (this === app) + '</p>'); // => true
  options.thisWillBeAddedToTheView = 'afterInitializationCompletes';
});

app.addInitializer(function(options, cb) {
  setTimeout(cb, 100); // initialization will not proceed until `cb` is called
});

app.on('app:initializing', function(options) {
  this.$el.append('<p>app is initializing</p>');
  options.startTime = Date.now();
  console.log('started', app.started); // => false
});

app.on('app:initialized', function(options) {
  this.$el.append('<p>app is initialized</p>');
  var elapsedTime = (Date.now() - options.startTime) + 'ms';
  this.$el.append('<p>elapsed initialization time: ' + elapsedTime + '</p>'); // => ~100ms
  options.thisWillBeAddedToTheView === this.thisWillBeAddedToTheView; // => true
  console.log('started', app.started); // => true
});

app.attachTo('body').start();