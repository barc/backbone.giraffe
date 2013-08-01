:::BEGIN Example


# App Initialization

This example demonstrates how to use the __Giraffe.App__ initialization feature.
It's a convenient way to get your app into a ready state, and it handles both
synchronous and asynchronous initializers.

```js
var app = new Giraffe.App();
```

 __Giraffe.App__ has two methods to help with initialization, `addInitializer`
 and `start`. The `addInitializer` method queues up functions that run when
 `start` is called. The `start` method takes some optional `options` and then
 passes them through each initializer, and when initialization completes,
 `app.options` are extended with the initialization `options`. The `this` of
 each initializer is the app.

```js
app.addInitializer(function(options) {
  this.$el.append('<p>initializer `this` is app: ' + (this === app) + '</p>'); // => true
  options.thisWillBeAddedToOptions = 'afterInitializationCompletes';
});
```

If `addInitializer` is passed a function with 2 arguments, `fn.length === 2`,
the second argument is assumed to be an asynchronous callback. Initialization
will not proceed until the callback is called. Per __Node.js__ convention, if
`cb` is called with a truthy first argument, an error is thrown and
initialization halts.

```js
app.addInitializer(function(options, cb) {
  setTimeout(cb, 100); // initialization will not proceed until `cb` is called
});
```

The app fires events when it's initializing and initialized,
`'app:initializing'` and `'app:initialized'`. Let's figure out how much time
elapses between them.

```js
app.on('app:initializing', function(options) {
  this.$el.append('<p>app is initializing</p>');
  options.startTime = Date.now();
  console.log('started', app.started); // => false
});

app.on('app:initialized', function(options) {
  this.$el.append('<p>app is initialized</p>');
  var elapsedTime = (Date.now() - options.startTime) + 'ms';
  this.$el.append('<p>elapsed initialization time: ' + elapsedTime + '</p>'); // => ~100ms
  this.options.thisWillBeAddedToOptions === options.thisWillBeAddedToOptions; // => true
  console.log('started', app.started); // => true
});
```

Now that our initializers are added, let's attach and start up the app.

```js
app.attachTo('body').start();
```

:::< common.md --raw

Here's what happened:

{{{EXAMPLE style='height: 65px;'}}}

:::END
