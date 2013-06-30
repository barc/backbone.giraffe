:::BEGIN Example

## View Basics

This example demonstrates the basic usage of **Giraffe.View**. It can be extended just like a **Backbone.View**.
```js
Giraffe.View.setTemplateStrategy('underscore-template');

var View = Giraffe.View.extend({
```

**Giraffe.View** implements `render` for you. This `render` function consumes `getHTML`, which is an empty method for you to implement that returns a string of the view's HTML. One of Giraffe's goals is to be as unintrusive to Backbone apps as possible, and so it may appear counterintuitive that it calls `render` for you. But stay with us! Giraffe is able to add quite a few features by controlling the `render` method. You can still call `render` when your models change and expect it to work like it always has. (except better!)
```js
  template: '<h2><%= name %></h2>',

  serialize: function() {
    return {name: 'main view'};
  }
});
```

Let's create an instance of the view class we just defined.
```js
var view = new View();
```

With a normal **Backbone.View**, we'd probably now do something like `$('body').append(view.$el)`. That would still work, but the **Giraffe.View** adds the method `attachTo`, a function that works some magic behind the scenes to simplify view management. The goal of the **Giraffe.View** is to have a recursively-nestable automatically-memory-managed move-it-and-render-it-anywhere-any-time view. *Phew.* In this simple case, the only things happening behind the scenes in `attachTo` are `$('body').append(view.$el)` followed by `view.render()`. The `render` happens only because Giraffe sees that the view has yet to be rendered.
```js
view.attachTo('body');
```

You may be wondering how **Giraffe.View** works under the hood. Part of the answer lies in tying a view's `$el` to the view instance via the `data-view-cid` attribute. This lets us query both our view objets and the DOM (along with off-DOM detached HTML fragments) to safely and automagically handle nested views.
```js
view.cid; // => 'view1'
view.$el.data("view-cid"); // => 'view1'
```

So let's see the magic! First we'll define a `ChildView` class.
```js
var ChildView = Giraffe.View.extend({
  className: 'child-view',

  template: '<h3><%= name %></h3>',

  serialize: function() {
    return {name: 'child view'};
  }
});
```

Now let's create an instance of `ChildView` and attach it to the first view we created. The method `attach` is an inverted way to call `attachTo`, the difference being `attachTo` doesn't require a parent view - any selector, DOM element, or view will do.
```js
var childView = new ChildView();
view.attach(childView);
```

When one view is attached to another, Giraffe sets up a parent-child relationship. Note that we could have called `childView.attachTo(view.$el)`, and because the `data-view-cid` is set up, we still know who the parent is. The child view gets a `parent` and the parent view adds the child view to its `children` array.
```js
childView.parent === view;      // => true
view.children[0] === childView; // => true
```

When a **Giraffe.View** renders, its child views are detached. This preserves their DOM event bindings, so you should never again need to call `delegateEvents` manually. When a view renders and its child views are detached, one of many things can happen. The default behavior is to call `dispose` on them, the generalized Giraffe removal/destroy/cleanup method. *(Side note: the method name is '`dispose'` and not `'remove'` as a matter of necessity even though it essentially overrides Backbone's `view.remove`. This is because any object can be added to a view's children via `view.addChild` to take advantage of automatic memory management, and some objects like collections already have a `remove` method that means something completely different! Any child with a `dispose` method will be disposed of when its parent disposes.)*

```js --no-capture
view.render() => childView.detach() => childView.dispose()
// ...rendering the parent completely destroyed our childView!
```

*My view is gone, you say? What if I want to keep it!?*

Good question! Even though it's often easy to just recreate child views after every `render`, there are many reasons you may want to cache them. To save a view even after its parent renders, simply set the view's option `disposeOnDetach` to false.

```js
childView.options.disposeOnDetach = false;
// or...
// new ChildView({disposeOnDetach: false});
```

```uml
-> view: render()
alt each child
  view -> child: detach()
  alt if options.disposeOnDetach
    child -> child: dispose()
end
```

We now have a cached child view! Let's see what happens when the parent view renders.

```js --no-capture
view.render() => childView.detach()
view.children[0] === childView // => true
// ...hurray! The childView is still around.
view.$el.find(childView.$el);  // => not found! ...it's not in the DOM!?
```

*My view is still around, but it's not in the DOM? What if I want it in the DOM!?*

Another good question! Giraffe tries its best to stay out of your way, any so there's no automatic child view reattaching. What if after `render` you wanted to show a different view? The client may ask for anything! Giraffe has an answer though, in the form of a handy convention: every time a view calls `render`, it firsts calls `beforeRender`, then renders, and then calls `afterRender`. Both of these functions are empty by default, ready for you to fill in when needed. The `afterRender` function is a great time to attach child views.

```js
view.afterRender = function() {
  this.attach(childView);
};
view.render();                // => childView.detach()
view.children.length === 1;   // => true, because childView.options.disposeOnDetach === false
view.$el.find(childView.$el); // => yep! good work, `afterRender`!
```

Time for a victory message.
```js
$('body').append('<p>We rendered the main view and saved the child!</p>')
```

Views can be attached to any selector, DOM element, or view. Note that the inverted `attach` method will make sure the calling object contains the `el` you specify, because semantically you're saying *'attach this view to this parent'*.
```js --no-capture
view.attachTo('#some-selector');
view.attachTo(someDOMElement);
view.attachTo($someJQueryObject);
view.attachTo(someView);
view.attach(childView, {el: '#something-inside-the-view'});
```

So this `attachTo` function, you may be wondering - how is it putting one $el inside another, and how can that be controlled? By default it uses the jQuery method `'append'`, but luckily many jQuery methods are supported - `'append'`, `'prepend'`, `'after'`, `'before'`, and `'html'` can all be passed to `attach` and `attachTo` as the `method` option. That last one may raise alarm bells in your jQuery underbrain - the `'html'` method can be quite destructive! Worry not - Giraffe has you covered. Any time you insert a view with the `'html'` method, any otherwise-clobbered views will be safely detached first. Note that by default, detaching a view will `dispose` of it, but the `preserve` option can override the behavior of `disposeOnDetach`.

```js --no-capture
childView.attachTo(view, {method: 'append'}); // the default method
childView.attachTo(view, {method: 'prepend'});
childView.attachTo(view, {method: 'after'});  // => makes `childView` a sibling of `view`
childView.attachTo(view, {method: 'before'}); // => also makes them siblings
view.attach(childView, {method: 'prepend'});  // inverted way to attach

childView.attachTo(view, {method: 'html'});
// => detaches any views that get in the way, disposing of them unless disposeOnDetach is false

childView.attachTo(view, {method: 'html', preserve: true});
// => detaches any views that get in the way, but does not dispose of them, even if disposeOnDetach is true
```

Here's an abridged UML summary.
```uml
participant Code
participant MyView
participant GView as "Giraffe.View"

Code -> MyView: attachTo('#container', {method: 'append'})

MyView -> GView: attachTo

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
      GView -> MyView: [optional] beforeRender()
  end

  GView -> GView: $el.empty()

  GView -> MyView: getHTML()

  MyView --> GView: return html string

  GView -> DOM: append html string to $el

  alt if afterRender overridden
      GView -> MyView: [optional] afterRender()
  end
end
```

That's it! Take a look at the result below. It may not look very impressive, but we covered a lot of ground!

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
