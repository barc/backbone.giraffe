:::BEGIN Example


## Lifecycle Management

This example demonstrates the lifecycle management features in Giraffe.

All Giraffe objects implement a `dispose` method. When a **Giraffe.View** is disposed, it calls `dispose` on all of its `children` that have the method. In this example we'll create a **Giraffe.App**, give it some children, `dispose` of it, and see the results. **Giraffe.App**, which is a special **Giraffe.View**, is designed to encapsulate an entire application, but for the purposes of this example we're using no features specific to it - a **Giraffe.View** would have worked too.
```js
var app = new Giraffe.App();
app.attachTo('body');
```

Let's listen to the built-in disposal events and write out what's happening.
```js
app.once('disposing', function() {
  $('body').append('<p>app is disposing</p>');
});

app.once('disposed', function() {
  $('body').append('<p>app is disposed</p>');
});
```

<div class='note' markdown='1'>
The `Giraffe.View#dispose` method overrides the behavior of `Backbone.View#remove` function, but because we want Giraffe to manage the lifecycle of all objects, and `remove` means something different for collections, we opted to use the method name `dispose`.
</div>

Now that the app is ready, let's give it some children.
```js
var childModel = new Giraffe.Model();
app.addChild(childModel);

var childCollection = new Giraffe.Collection([{'name': 'a model!'}]);
app.addChild(childCollection);

var childView = new Giraffe.View();
app.attach(childView); // `addChild` would work too, but doesn't put childView.$el in app.$el
```

To help us follow the action of `dispose`, we'll listen for the events signaling when these objects are disposed and write out what's happening.
```js
childModel.once('disposed', function() {
  $('body').append('<p>model is disposed</p>');
});

childCollection.once('disposed', function() {
  $('body').append('<p>collection is disposed</p>');
});

childCollection.models[0].once('disposed', function() {
 $('body').append('<p>collection\'s model is disposed</p>');
});

childView.once('disposed', function() {
  $('body').append('<p>view is disposed</p>');
});
```

<div class='note' markdown='1'>
__Giraffe.Collection__ and __Giraffe.Model__ are very thin wrappers over their Backbone counterparts, adding only `dispose` and `appEvents` support. They are by no means required, and you can have Giraffe manage the lifecycles of any objects with a `dispose` method. If you want to reuse the same `dispose` method Giraffe's classes use, it's available at `Giraffe.dispose`. It calls `stopListening`, triggers the `disposing` and `disposed` events, and sets `this.app` to `null`. It also accepts a function argument to do additional work.
</div>

Let's call `dispose` on the app and see what happens!
```js
app.dispose();
```

{{{COMMON}}}

```css --hide
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
