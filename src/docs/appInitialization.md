:::BEGIN Example


## App Initialization

This example demonstrates to use the **Giraffe.App** initialization feature. It's a convenient way to get your app into a ready state, and it handles both synchronous and asynchronous initializers.
```js
var app = new Giraffe.App();
```

 **Giraffe.App** has two methods to help with initialization, `addInitializer` and `start`. The `addInitializer` method queues up functions that run when `start` is called. The `start` method takes some optional `options` and then passes them through each initializer, and when initialization completes, `app.options` are extended with the initialization `options`. The scope of each initializer is the app.
```js
app.addInitializer(function(options) {
  this.$el.append('<p>initializer `this` is app: ' + (this === app) + '</p>'); // => true
  options.thisWillBeAddedToOptions = 'afterInitializationCompletes';
});
```

If `addInitializer` is passed a function with 2 arguments, `fn.length === 2`, the second argument is assumed to be an asynchronous callback. Initialization will not proceed until the callback is called.
```js
app.addInitializer(function(options, cb) {
  setTimeout(cb, 100); // initialization will not proceed until `cb` is called.
});
```

The app fires events when it's initializing and initialized, `'app:initializing'` and `'app:initialized'`. Let's figure out how much time elapses between them.
```js
app.on('app:initializing', function(options) {
  this.$el.append('<p>app is initializing</p>');
  options.startTime = Date.now();
  app.started; // => false
});

app.on('app:initialized', function(options) {
  this.$el.append('<p>app is initialized</p>');
  var elapsedTime = (Date.now() - options.startTime) + 'ms';
  this.$el.append('<p>elapsed initialization time: ' + elapsedTime + '</p>'); // => ~100ms
  this.options.thisWillBeAddedToOptions === options.thisWillBeAddedToOptions; // => true
  app.started; // => true
});
```

Now that our initializers are added, let's attach and start up the app.
```js
app.attachTo('body').start();
```

{{{COMMON}}}

```css --hide
// Example
body {
  background-color: #ffffff;
  padding: 20px;
  font-size: 14px;
  font-family: Verdana, Geneva, sans-serif;
}
* {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
}
h1 {
  font-size: 42px;
}
h2 {
  font-size: 24px;
  margin-bottom: 20px;
  display: inline;
  margin-right: 10px;
}
h3 {
  font-size: 18px;
  display: inline;
  margin-right: 10px;
}
.child-view {
  position: relative;
  padding: 20px;
  margin: 20px;
  border: 1px dashed #999;
}
```
## Try It

{{{EXAMPLE}}}

:::END