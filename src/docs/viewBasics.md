# View Basics

:::BEGIN Example

## Creating and Attaching a View

This example demonstrates the basic usage of __Giraffe.View__. It can be
extended just like a __Backbone.View__.

```js
var MyView = Giraffe.View.extend({
  template: '#my-template',
  serialize: function() {
    return {name: 'my view'};
  }
});
```

__Giraffe__ implements `render` so it can do some useful things, and by default
`render` expects a view's `template` to be the DOM selector of an __Underscore__
template. This can be easily configured to support any form of string
templating. For more information, see `template`, `setTemplateStrategy`, and
`templateStrategy` in the [API docs](backbone.giraffe.html#View-template) or the
[_Template Strategies_ example](templateStrategies.html). The included strategies
use a view's `serialize` function to get the data passed into the template.

```html
<script id="my-template" type="text/template">
  Hello <%= name %>!
</script>
```

__Giraffe__ uses the function `attachTo` to put views into the DOM or inside one
another. If a view has not yet been rendered, `attachTo` will call `render` on
it.

```js
var myView = new MyView();
myView.attachTo('body');
```

Here's the result:

:::< common.md --raw

{{{EXAMPLE style='height: 30px;'}}}

:::END


:::BEGIN Example
## Creating Child Views

This example demonstrates how the `attachTo` function automatically sets up
parent-child relationships between views.

__Giraffe__ calls the functions `beforeRender` and `afterRender` every time a
view renders. These are empty functions for your views to fill in. `afterRender`
is a good place to create and attach child views.

```js
var ParentView = Giraffe.View.extend({
  template: '#parent-template',
  afterRender: function() {
    var childView = new ChildView({name: 'child view'});
    childView.attachTo(this);
    // or
    // this.attach(childView);
  }
});
```

```html
<script id="parent-template" type="text/template">
  parent view
</script>
```

The `ChildView` will be put inside the `ParentView`.

```js
var ChildView = Giraffe.View.extend({
  template: '#child-template'
});
```

The `ChildView` simply displays the `name` provided in its `options`. We aren't
defining a `serialize` method on the `ChildView`, and by default, `serialize`
passes the view to the template function.

```html
<script id="child-template" type="text/template">
  <%= name %>
</script>
```

Let's create and attach the parent view.

```js
var parentView = new ParentView();
parentView.attachTo('body');
```

Now is a good time to inspect the views to see what the child-parent
relationship looks like. The parent has an array of `children` and the children
have a reference to their `parent`.

```js
var childView = parentView.children[0];
console.log(parentView === childView.parent); // => true
```

Let's create a second child view. The `method` option of `attachTo` is the
__jQuery__ method used to insert the view. The default is `'append'`. In this
case we'll use `'before'` to put it before the first child view we created. See
`attachTo` in the [API docs](backbone.giraffe.html#View-attachTo) for more.

```js
var childView2 = new ChildView({name: 'child view attached with {method: "before"}'});
childView2.attachTo(childView, {method: 'before'});
```

The `parent` of `childView2` is the `parentView`.

```js
console.log(childView2.parent === parentView); // => true
```

:::< common.md --raw

Here's the result:

{{{EXAMPLE style='height: 274px;'}}}

:::@ --hide

```css
[data-view-cid] {
  position: relative;
  padding: 20px;
  margin: 20px;
  border: 1px dashed #999;
}
```

## `attachTo` Sequence Diagram

```uml
participant MyView
participant GView as "Giraffe.View"

MyView -> GView: attachTo #container

alt if #container has parent view
    GView -> ParentView: set MyView as child of parent
end

GView -> DOM: detach MyView's $el

alt if method is 'html'
  GView -> GView: detach views inside #container
end

GView -> DOM: put MyView's $el in #container using method

alt if MyView not yet rendered or options.forceRender
  alt if beforeRender overridden
      GView -> MyView: beforeRender()
  end

  GView -> GView: $el.empty()

  GView -> MyView: templateStrategy()

  MyView --> GView: return html string

  GView -> DOM: append html string to $el

  alt if afterRender overridden
      GView -> MyView: afterRender()
  end
end
```

:::END
