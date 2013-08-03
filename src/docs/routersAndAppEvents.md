:::BEGIN Example

# Routers and App Events

This example demonstrates how __Giraffe.Router__ ties into the `appEvents`
described in the [App Events](appEvents.html) example.

```js
var App, ChildView;
```

## The App

__Giraffe.App__ is a __Giraffe.View__ that encapsulates an app and its routes.
In this example, clicking some links will change the window location hash. The
__Giraffe.Router__ responds to this hash change and triggers an event on the app
which shows a child view with a specific name.

```js
App = Giraffe.App.extend({
  template: '#app-template',
```

The `Giraffe.App#routes` property maps URL routes to `appEvents`, and as a result of
defining `routes` on the app, it will automatically create an instance of
__Giraffe.Router__ at `app.router`. __Giraffe.Router__ is dependent on
__Giraffe.App__ because it uses `appEvents` to communicate with your objects.

```js
  routes: {
    'childView/:name': 'route:childView'
    // 'someHashLocation/:andItsParams': 'some:appEvent'
  },
```

<div class="note">
For convenience, **Giraffe.App** creates a router if it has a `routes` hash, but
you can create any number of routers. They do require that a **Giraffe.App**
exists on the page, and instead of defining `routes` on an **Giraffe.Router**,
you define `triggers`, which avoids conflict with `Backbone.Router#routes`.
</div>

When a route is triggered, its corresponding `appEvent` is called. Any
__Giraffe__  object, including the app, can listen for `appEvents`. In this
example the app listens to itself for the app event `'route:childView'`, which
is defined in the `routes` above, and the `'all'` event, so we can log
everything that happens to `appEvents`.

```js
  appEvents: {
    'route:childView': 'showChildView',
    'all': function() { console.log('app event', arguments); }
    // 'some:otherRoute': 'someMethodName'
    // 'some:otherAppEvent': 'someOtherMethodName'
  },
```

<div class="note">
The `route:` prefix is just a naming convention and is not required.
</div>

The handler for `'route:childView'` creates a child view named with the route
parameter, and inserts it into the DOM using the `attachTo` method `'html'`,
which replaces anything inside `'#child-view-container'`.

```js
  showChildView: function(name) {
    var childView = new ChildView({name: name});
    this.attach(childView, {el: '#child-view-container', method: 'html'});
  }
});

```

Here's the app's template. It has three links to the three child views and a
container for the active child view.

```html
<script id="app-template" type="text/template">
  <p><a href="#childView/1">show child view 1</a></p>
  <p><a href="#childView/2">show child view 2</a></p>
  <p><a href="#childView/3">show child view 3</a></p>
  <div id="child-view-container"></div>
</script>
```

## The Child View

In this example, we're going to create a child view that simply displays its
name and a color.

```js
ChildView = Giraffe.View.extend({
  className: 'child-view',
  template: '#child-template',
  initialize: function(options) {
    var color;
    if (options.name === '1')
      color = '#e99';
    else if (options.name === '2')
      color = '#9e9';
    else
      color = '#99e';
    this.$el.css('background-color', color);
  }
});
```

```html
<script id="child-template" type="text/template">
  <h2>child view <%= name %></h2>
</script>
```

## Loading the App

It's time to create and attach the app.

```js
var app = new App();
app.attachTo('body');
```

<div class="note">
The `routes` hash could have been passed as an option to the __Giraffe.App__
constructor.
</div>

Almost finished! Let's start __Backbone.history__ to get things rolling.

```js
Backbone.history.start();
```

The __Giraffe.Router__ has one more trick up its sleeve: it gives you
programmatic control over your routes. The function `Giraffe.Router#cause` takes
an `appEvent` and optional parameters, navigates to the corresponding route
defined in the router, and then triggers the `appEvent` with the parameters.
Here we show _child view 1_ as the default view by causing its `appEvent`.

```js
app.router.cause('route:childView', 1);
```

__Giraffe.Router__ also provides two utility functions to help you manage
routes, `isCaused` and `getRoute`. We could have used `getRoute` to build our
anchor links in the app template above, but didn't for the sake of familiarity.
No longer must you build route links manually!

```js
console.log(app.router.isCaused('route:childView', 1)); // => true
console.log(app.router.isCaused('route:childView', 2)); // => false
console.log(app.router.isCaused('route:childView'));    // => false
console.log(app.router.getRoute('route:childView', 1)); // => '#childView/1'
```

<div class='note'>
You will not see hash changes in your address bar because the example is in an
iframe, but your browser's back and forward buttons should work!
</div>

:::< common.md --raw

:::@ --hide

```css
h2 {
  font-size: 24px;
}
.child-view {
  position: relative;
  padding: 20px;
  margin: 20px;
  border: 1px dashed #999;
}
```

## Try It

{{{EXAMPLE style='height: 154px;'}}}

:::END
