:::BEGIN Example

# View Flexibility

This advanced example demonstrates the flexibility of **Giraffe.View**.
The design goal is to create a single view class that nests, manages memory, and moves around the DOM with ease.

**Giraffe.App** is a **Giraffe.View** that encapsulates an app.

```js
var ParentApp = Giraffe.App.extend({
  template: '#parent-app-template',

  afterRender: function() {
    this.attach(new ChildView());
  }
});
```

Here's the app's template.

```html
<script id="parent-app-template" type="text/template">
  <h2><%= this.options.name %></h2>
  <h3><%= this.cid %></h3>
  <button data-gf-click="render">Reset <%= this.options.name %></button>
</script>
```

Now let's build the child view that spawns recursively. Let's start with its template.

<div class='note'>
The attribute `data-gf-click` is an intuitive way to assign a view method as the click event handler for the DOM element. We recommend prefixing the name of the handler with `on` to make it clear an event triggers the method. 
</div>

```html
<script id="child-template" type="text/template">
  <h3><% this.cid %></h3>

  <% if (showMoveUpButton) { %>
    <button data-gf-click="onMoveUp">&#9650;</button>
  <% } %>

  <% if (showMoveDownButton) { %>
    <button data-gf-click="onMoveDown">&#9660;</button>
  <% } %>

  <button data-gf-click="onAddChild">Add a child</button>
  <button data-gf-click="render">Render count: <%= this.renderCount%></button>
  <button data-gf-click="onDispose">Dispose</button>

  <% if (this.parent instanceof ChildView) { %>
    <label>
      <input type="checkbox" data-gf-change="toggleCache" <%= this.options.disposeOnDetach ? '' : "checked='checked'" %>>
      Cache this view
    </label>
    <button data-gf-click="onAttachUsingHTML">Reattach to parent using $.html</button>
  <% } %>

  <div class="child-views"></div>
</script>
```

Define the child view

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

  template: '#child-template',

  serialize: function() {
    var
      $parentChildren = this.$el.parent().find('> .child-view'),
      index = $parentChildren.index(this.$el);
    return {
      showMoveUpButton: this.parent instanceof ChildView || index !== 0,
      showMoveDownButton: this.parent instanceof ChildView || index !== $parentChildren.length - 1
    };
  },
```


In this example, each child view has a button that adds another `ChildView` to its `children`.

```js
  onAddChild: function() {
    this.attach(new ChildView(), {el: this.$('.child-views:first')});
  },
```

Each child view also has a button that calls `dispose`, which cleans up all resources and event bindings on the view and its `children`.

```js
  onDispose: function() {
    this.dispose();
  },
```

By default, Giraffe recreates child views every `render`, but this is often not desired.
`options.disposeOnDetach` tells Giraffe whether or not to cache a view.
By default, `disposeOnDetach` is true, and child views are disposed of when their `parent` detaches them before a `render`.
If you set a view's `disposeOnDetach` option to false, it is preserved when its `parent` renders.
In this example, the `ChildView` has a checkbox to toggle this caching behavior.

```js
  toggleCache: function(e) {
    this.options.disposeOnDetach = !$(e.target).is(':checked');
  },
```

Cached child views will be in `children` after rendering the `parent`.
Uncached child views have already been disposed of by this point.
Giraffe does *not* automatically reattach child views, so you retain full control.

```js
  afterRender: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.attach(this.children[i], {el: '.child-views:first'});
    }
  },
```

Like `afterRender`, `beforeRender` is an empty function for you to create when needed.

```js
  beforeRender: function() {
    this.renderCount = this.renderCount || 0;
    this.renderCount += 1;
  },
```

Giraffe views can move freely around the DOM using jQuery methods to insert themselves and automatically update their `parent`.
The supported insertion methods are `append`, `prepend`, `before`, `after`, and `html`. The function `attachTo` is an inverted way to call `attach`, the difference being `attachTo` doesn't require a parent view - any DOM element, selector, or view will do.
When a view is attached, Giraffe automatically calls `render` on the view if it hasn't yet been rendered, but passing the option `forceRender` will cause attach to always render.
The option `preserve` prevents child view disposal, even if `disposeOnDetach` is true.
In this example, we force `render` on the relevant views so the correct movement buttons are displayed,
and we use `preserve` to prevent the `render` from disposing of uncached child views.

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

The `html` jQuery method replaces existing content.
Giraffe automatically disposes of any uncached views that get in the way.

```js
  onAttachUsingHTML: function() {
    this.attachTo(this.$el.parent(), {method: 'html'});
  },
```

Let's use the console to see when views get disposed.

```js
  dispose: function() {
    Giraffe.View.prototype.dispose.call(this);
    console.log('Disposing of ' + this.cid);
  }
});
```

That's it! Let's create and attach the app.
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

### Result

{{{EXAMPLE style='height: 600px;'}}}


:::END
