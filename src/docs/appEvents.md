:::BEGIN Example


# App Events

This example demonstrates how **Giraffe.App** helps components communicate.

Let's create an instance of `Giraffe.App` with three child views that talk to
each other using the app as an event aggregator.

```js
var App = Giraffe.App.extend({
  afterRender: function() {
    this.attach(new ChildView({color: '#e99', text: 'red'}));
    this.attach(new ChildView({color: '#9e9', text: 'green'}));
    this.attach(new ChildView({color: '#99e', text: 'blue'}));
  }
});
```

This example has a `ChildView` class with a button that paints all child views its color, and they'll send this coloring message via `appEvents`. Each child view starts out its own color.

```js
var ChildView = Giraffe.View.extend({
  className: 'child-view',
  template: '#child-template',
  initialize: function() {
    this.$el.css('background-color', this.options.color);
  },
```

Each `ChildView` has a button that colors all child views its color.

```html
<script id="child-template" type="text/template">
  <button>Color the views <%= this.options.text %>!</button>
</script>
```

The `appEvents` hash is a convenient feature that helps your app's objects communicate. It's similar to the **Backbone.View** `events` hash, but instead of mapping DOM events it maps events on an instance of **Giraffe.App**.  If a **Giraffe.App** has been created, `appEvents` is automatically bound for all Giraffe objects *(views, apps, routers, models, and collections)*, and is cleaned up via `Backbone.Events.stopListening` in `dispose`, which all Giraffe objects implement. When an instance of **Giraffe.App** is created, it stores its reference globally at `Giraffe.app` unless an app instance is already there, and all Giraffe objects store this reference as `this.app` unless you pass `{app: someApp}` as an option.

```js
  appEvents: {
    'setColor': function(color) { this.$el.css('background-color', color); }
    //'someOtherAppEvent': 'someFunctionName'
  },
```

Clicking the view's button calls the `colorChildViews` method. By triggering an event on `this.app`, all views listening to `appEvents` will hear it.

```js
  events: {
    'click button': 'colorChildViews'
  },
  colorChildViews: function() {
    this.app.trigger('setColor', this.options.color);
  }
});
```

Like all Giraffe objects, **Giraffe.App** can listen to its own `appEvents`. To help us see what's going on, let's log every event that passes through the app to the console.

```js
App.prototype.appEvents = {
  'all': function() { console.log('app event', arguments); }
};
```

That's it! Let's create and attach the app.

```js
var app = new App();
app.attachTo('body');
```

{{{COMMON}}}

:::@ --hide

```css
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

{{{EXAMPLE style='height: 324px;'}}}

:::END
