:::BEGIN Example

# View Flexibility

This advanced example demonstrates the flexibility of __Giraffe.View__. The
design goal is to create a single view class that nests, manages memory, and
moves around the DOM with ease.

## The Final Result

There is a lot of information in this example, so let's begin by playing around
with the result. If something doesn't make sense to you, read on!

{{{EXAMPLE style='height: 550px;'}}}

## The Parent App

__Giraffe.App__ is a __Giraffe.View__ that encapsulates an app. This example has
an app with a `ChildView` that has buttons to move around the DOM and create
more child views.

```js
var ParentApp = Giraffe.App.extend({
  template: '#parent-app-template',

  afterRender: function() {
    this.attach(new ChildView());
  }
});
```

Here's the app's template:

```html
<script id="parent-app-template" type="text/template">
  <h2><%= options.name %></h2>
  <h3><%= cid %></h3>
  <button data-gf-click="render">Reset <%= options.name %></button>
</script>
```

<div class='note'>
The attribute `data-gf-click` is an convenient way to assign a view method as
the click event handler for the DOM element. We recommend prefixing the name of
the handler with `on` to make it clear an event triggers the method. See the
[Document Events example](documentEvents.html) for more.
</div>

## The Child View

```js
var ChildView = Giraffe.View.extend({
  className: 'child-view',
```

:::@ --hide

```js
  colors: ['#ebb', '#eeb', '#beb', '#bee', '#bbe', '#ebe'],
  colorIndex: -1,

  initialize: function() {
    var proto = ChildView.prototype;
    proto.colorIndex += 1;
    if (proto.colorIndex >= proto.colors.length)
      proto.colorIndex = 0;
    var color = proto.colors[proto.colorIndex];
    this.$el.css('background-color', color);
  },
```


In this example, each `ChildView` has a button that adds another `ChildView` to
its `children` via the `onAddChild` method.

```js
  onAddChild: function() {
    this.attach(new ChildView(), {el: this.$('.child-views:first')});
  },
```

By default, __Giraffe__ recreates child views every `render`, but this is often
not desired. `options.disposeOnDetach` tells __Giraffe__ whether or not to cache
a view. By default, `disposeOnDetach` is true, and child views are disposed when
their `parent` detaches them before a `render`. If you set a view's
`disposeOnDetach` option to false, it is preserved when its `parent` renders.
In this example, the `ChildView` has a checkbox to toggle this caching behavior.

```js
  onToggleCache: function(e) {
    this.options.disposeOnDetach = !$(e.target).is(':checked');
  },
```

Cached child views will be in `children` after rendering the `parent`. Uncached
child views have already been disposed of by this point which removes them from
`children`. __Giraffe__ does _not_ automatically reattach child views, so you
retain full control over what happens each `render`.

```js
  afterRender: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.attach(this.children[i], {el: '.child-views:first'});
    }
  },
```

Let's track and display the number of renders so we can see what's happening.

```js
  beforeRender: function() {
    this.renderCount = this.renderCount || 0;
    this.renderCount += 1;
  },
```

__Giraffe__ views can move freely around the DOM using the function `attachTo`,
which automatically sets up parent-child relationships between views. `attachTo`
takes an optional `method` option, which is a __jQuery__ insertion method
defaulting to `'append'`. The methods are `'append'`, `'prepend'`, `'before'`,
`'after'`, and `'html'`. The function `attachTo` is an inverted way to call
`attach`, the difference being `attachTo` doesn't require a parent view - any
DOM element, selector, or view will do.

In this example, we have buttons to move the views around, but we don't want to
display an up or down button when that's an invalid move. To display the correct
buttons, we need to `render` a view when it moves, so we `forceRender` on
`attachTo` and we use `preserve` to prevent `render` from disposing of uncached
child views. When a view is attached, __Giraffe__ automatically calls `render`
on the view if it hasn't yet been rendered, but passing the option `forceRender`
will cause `attachTo` to always `render` the view. The option `preserve`
prevents child view disposal, even if `disposeOnDetach` is true, and is used
because we don't want to dispose of uncached views just to update the arrows.

```js
  onMoveUp: function() {
    var previousView = this.getPreviousView();
    this.attachTo(previousView, {
      method: 'before',
      forceRender: true,
      preserve: true
    });
    previousView.render({preserve: true});
  },

  getPreviousView: function() {
    var $parentChildren = this.$el.parent().find('> .child-view'),
      index = $parentChildren.index(this.$el);
    if (index > 0)
      return Giraffe.View.getClosestView($parentChildren[index - 1]);
    else
      return this.parent;
  },

  onMoveDown: function() {
    var nextView = this.getNextView();
    this.attachTo(nextView, {
      method: 'after',
      forceRender: true,
      preserve: true
    });
    nextView.render({preserve: true});
  },

  getNextView: function() {
    var $parentChildren = this.$el.parent().find('> .child-view'),
      index = $parentChildren.index(this.$el);
    if (index < $parentChildren.length - 1)
      return Giraffe.View.getClosestView($parentChildren[index + 1]);
    else
      return this.parent;
  },
```

The `'html'` __jQuery__ method replaces existing content. __Giraffe__
automatically detaches any views that get in the way when it's used. We'll add a
button to see how this behavior works with sibling views.

```js
  onAttachUsingHTML: function() {
    this.attachTo(this.$el.parent(), {method: 'html'});
  },
```

<div class="note">
In this example, siblings of a view reattached with `{method: 'html'}` will
be automatically detached. If the detached views are cached, they will remain in
`children` and will be reattached when the parent renders since `afterRender`
attaches all child views.
</div>

Let's use the console to see when views get disposed.

```js
  dispose: function() {
    Giraffe.View.prototype.dispose.call(this);
    console.log('Disposing of ' + this.cid);
  },
```

Here's the child view's `serialize` function and `template`:

```js
  template: '#child-template',

  serialize: function() {
    var
      $parentChildren = this.$el.parent().find('> .child-view'),
      index = $parentChildren.index(this.$el),
      parentIsChildView = this.parent instanceof ChildView;
    return {
      parentIsChildView: parentIsChildView,
      showMoveUpButton: parentIsChildView || index !== 0,
      showMoveDownButton: parentIsChildView || index !== $parentChildren.length - 1,
      checkedAttr: this.options.disposeOnDetach ? '' : "checked='checked'",
      renderCount: this.renderCount,
      cid: this.cid
    };
  }
});
```

```html
<script id="child-template" type="text/template">
  <h3><% cid %></h3>

  <% if (showMoveUpButton) { %>
    <button data-gf-click="onMoveUp">&#9650;</button>
  <% } %>

  <% if (showMoveDownButton) { %>
    <button data-gf-click="onMoveDown">&#9660;</button>
  <% } %>

  <button data-gf-click="onAddChild">Add a child</button>
  <button data-gf-click="render">Render count: <%= renderCount%></button>
  <button data-gf-click="dispose">Dispose</button>

  <% if (parentIsChildView) { %>
    <label>
      <input type="checkbox" data-gf-change="onToggleCache" <%= checkedAttr %>>
      Cache this view
    </label>
    <button data-gf-click="onAttachUsingHTML">
      Reattach to parent using jQuery method 'html'
    </button>
  <% } %>

  <div class="child-views"></div>
</script>
```

## Creating the App(s)

Phew, that's it! Let's create and attach the app.
The `name` property is only used for display purposes.

```js
var app1 = new ParentApp({name: 'app1'});
app1.attachTo('body');
```

Let's make two parent apps. Why? Because we can!

```js
var app2 = new ParentApp({name: 'app2'});
app2.attachTo('body');
```

:::< common.md --raw

:::@ --hide

```css
body {
  padding: 20px;
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
[data-gf-click="onMoveUp"] {
  position: absolute;
  left: -17px;
  top: 0;
}
[data-gf-click="onMoveDown"] {
  position: absolute;
  left: -17px;
  bottom: 0;
}
```


:::END
