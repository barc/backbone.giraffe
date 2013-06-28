:::BEGIN Example

## Routers and appEvents

This example demonstrates how **Giraffe.Router** ties into the `appEvents` described in the *App Events* example.
```js
var App, ChildView;
```

**Giraffe.App** is a **Giraffe.View** that encapsulates an app. **Giraffe.Router** requires an app because it uses `appEvents` to communicate with your objects.
```js
App = Giraffe.App.extend({
```

In this example, clicking some links will change the window location hash, triggering an `appEvent` which shows a child view with a specific name. Here we make three links to the three child views and a container for the active child view.
```js
  getHTML: function() {
    var html = '';
    html += '<p><a href="#childView/1">show child view 1</a></p>';
    html += '<p><a href="#childView/2">show child view 2</a></p>';
    html += '<p><a href="#childView/3">show child view 3</a></p>';
    html += '<div id="child-view-container"></div>';
    return html;
  },
```

Any Giraffe object, including the app, can listen for `appEvents`. When a route is triggered, its corresponding `appEvent` is called. Note that the `route:` prefix is just a naming convention and is not required. This route event is defined in `Router.triggers` below.
```js
  appEvents: {
    'route:childView': 'showChildView',
    'all': function() { console.log('app event', arguments); } // log to see what's happening
    // 'some:otherRoute': 'someFunctionName'
    // 'some:otherAppEvent': 'someOtherFunctionName'
  },

  showChildView: function(name) {
    this.attach(new ChildView({name: name}), {el: '#child-view-container', method: 'html'});
  }
});
```

In this example, we're going to create a child view that simply displays its name and a color.
```js
ChildView = Giraffe.View.extend({
  className: 'child-view',

  initialize: function(options) {
    this.name = 'child view ' + this.options.name;
    var color;
    if (options.name === '1')
      color = '#e99';
    else if (options.name === '2')
      color = '#9e9';
    else
      color = '#99e';
    this.$el.css('background-color', color);
  },

  getHTML: function() {
    return '<h2>' + this.name + '</h2>';
  }
});
```

It's time to create and attach the app.
```js
var app = new App();
app.attachTo('body');
```

Here's our router. The `triggers` option maps routes to appEvents. The router will bind to the global app reference at `Giraffe.app`, the first one created, unless an option `{app: someApp}` is passed to the router.
```js
var router = new Giraffe.Router({
  triggers: {
    'childView/:name': 'route:childView'
    // 'someHashLocation/:andItsParams': 'some:appEvent'
  }
  // app: someApp // to set an app other than Giraffe.app
});

router.app === Giraffe.app; // => true

// Alternatively:
// var Router = Giraffe.Router.extend({triggers: {...}});
// var router = new Router();
```

Almost finished! Let's start the Backbone history to get things rolling.
```js
Backbone.history.start();
```

The **Giraffe.Router** has one more trick up its sleeve: it gives you programmatic control over your routes. The function `router.cause` takes an `appEvent` and optional parameters, navigates to the corresponding route defined in the router, and then triggers the `appEvent`. No longer must you manually build route links! Here we show *child view 1* as the default view by causing its `appEvent`. **Giraffe.Router** also provides two utility functions to help you manage routes, `isCaused` and `getRoute`. We could have used `getRoute` to build our anchor links in `App.getHTML` above, but didn't for the sake of familiarity.
```js
router.cause('route:childView', 1);
router.isCaused('route:childView', 1); // => true
router.isCaused('route:childView', 2); // => false
router.isCaused('route:childView');    // => false
router.getRoute('route:childView', 1); // => '#childView/1'
```

**Please note:** you won't see hash changes in your address bar because the example is in an iframe, but your browser's back and forward buttons should work!

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
