:::BEGIN Example

# Lifecycle Management

This example demonstrates the lifecycle management features in __Giraffe__.

All __Giraffe__ objects implement a `dispose` method. When a __Giraffe.View__ is
disposed, it calls `dispose` on all of its `children` that have the method. In
this example we'll create a __Giraffe.App__, give it some children, `dispose` of
it, and see the results.

```js
var app = new Giraffe.App();
app.attachTo('body');
```

<div class="note">
__Giraffe.App__, which is a special __Giraffe.View__, is designed to encapsulate
an entire application, but for the purposes of this example we're using no
features specific to it - a __Giraffe.View__ would have worked too.
</div>

Let's listen to the built-in disposal events and write out what's happening.

```js
app.once('disposing', function() {
  $('body').append('<p>app is disposing</p>');
});

app.once('disposed', function() {
  $('body').append('<p>app is disposed</p>');
});
```

<div class='note'>
The `Giraffe.View#dispose` method overrides the behavior of
`Backbone.View#remove` function. We didn't want to rename it, but because we
want __Giraffe__ to manage the lifecycle of any object, and `remove` means
something different for collections, we opted to use the method name `dispose`.
</div>

Now that the app is ready, let's give it some children.

```js
var childModel = new Giraffe.Model();
app.addChild(childModel);

var childCollection = new Giraffe.Collection([{'name': 'a model!'}]);
app.addChild(childCollection);

var childView = new Giraffe.View();
app.attach(childView);
// `app.addChild(childView)` also works, but doesn't put childView.$el in app.$el
```

To help us follow the action of `dispose`, we'll listen for the events signaling
when these objects are disposed and write out what's happening.

```js
childModel.once('disposed', function() {
  $('body').append('<p>model is disposed</p>');
});

childCollection.once('disposed', function() {
  $('body').append('<p>collection has ' + this.length + ' models</p>');
  $('body').append('<p>collection is disposed</p>');
});

childCollection.models[0].once('disposed', function() {
  $('body').append('<p>collection\'s model is disposed</p>');
});

childView.once('disposed', function() {
  $('body').append('<p>view is disposed</p>');
});
```

<div class='note'>
__Giraffe.Collection__ and __Giraffe.Model__ are very thin wrappers over their
__Backbone__ counterparts, adding only `dispose` and `appEvents` support. They
are by no means required, and you can have __Giraffe__ manage the lifecycles of
any objects with a `dispose` method. If you want to reuse the same `dispose`
method __Giraffe__'s classes use, it's available at `Giraffe.dispose`. It calls
`stopListening`, triggers the `'disposing'` and `'disposed'` events, and sets
`this.app` to `null`. It also accepts a function argument to do additional work.
</div>

Any object with a `dispose` method can be added to a view's `children` to be
cleaned up.

```js
var someObject = {
  dispose: function() {
    $('body').append('<p>someObject is disposed</p>');
  }
};
app.addChild(someObject);
```

Let's call `dispose` on the app and see what happens!

```js
app.dispose();
```

:::< common.md --raw

Here's what happened:

{{{EXAMPLE style='height: 129px;'}}}


:::END
