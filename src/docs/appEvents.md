:::BEGIN Example


# App Events

This example demonstrates how __Giraffe.App__ helps your objects communicate.
We'll create an instance of `Giraffe.App` with three child views that talk to
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

This example has a `ChildView` class with a particular color and a button. When
the button is clicked, it sends a message to all other child views via
`appEvents` to color them its color.

```js
var ChildView = Giraffe.View.extend({
  className: 'child-view',
  template: '#child-template',
  initialize: function() {
    this.$el.css('background-color', this.options.color);
  },
```

Here's the `ChildView` template with the button. The default `serialize`
function passes the view to the template.

```html
<script id="child-template" type="text/template">
  <button>Color the views <%= options.text %>!</button>
</script>
```

<div class="note">
These examples use __Giraffe__'s templating default, __Underscore__ templates,
but __Giraffe__ supports any form of string templating. See the
[Template Strategies](templateStrategies.html) example for more.
</div>

The `appEvents` hash is a convenient feature that helps your app's objects
communicate. It's similar to the __Backbone.View__ `events` hash, but instead of
mapping DOM events it maps events on an instance of __Giraffe.App__.  If a
__Giraffe.App__ has been created, `appEvents` is automatically bound for all
__Giraffe__ objects _(views, apps, routers, models, and collections)_, and is
cleaned up via `Backbone.Events.stopListening` in `dispose`, which all
__Giraffe__ objects implement. When an instance of __Giraffe.App__ is created,
it stores its reference globally at `Giraffe.app` unless an app instance is
already there, and all __Giraffe__ objects store this reference as `this.app`
unless you pass `{app: someApp}` as an option.

```js
  appEvents: {
    'setColor': function(color) { this.$el.css('background-color', color); }
    //'someOtherAppEvent': 'someFunctionName'
  },
```

Clicking the view's button calls the `colorChildViews` method. By triggering an
event on `this.app`, all views listening to `appEvents` will hear it.

```js
  events: {
    'click button': 'colorChildViews'
  },
  colorChildViews: function() {
    this.app.trigger('setColor', this.options.color);
  }
});
```

Like all __Giraffe__ objects, __Giraffe.App__ can listen to its own `appEvents`.
To help us see what's going on, let's log every event that passes through the
app to the console.

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

:::< common.md --raw

:::@ --hide

```css
.child-view {
  position: relative;
  padding: 20px;
  margin: 20px;
  border: 1px dashed #999;
}
```

## Try It

{{{EXAMPLE style='height: 284px;'}}}

:::END
