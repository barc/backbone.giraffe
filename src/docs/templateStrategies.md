# Template Strategies

Creating HTML markup is a lot of what we do as front end developers. There are
many solutions as evident by the ever increasing number of templating libraries
found on the web, and __Giraffe__ aims to easily support the common cases and be
flexible enough to support any form of string templating. __Giraffe__ provides
templating strategies based on the built-in dependecies of __Backbone__, namely
the __Underscore__ `template` function. Selecting a strategy tells __Giraffe__
how to utilize the `Giraffe.View#template` property when rendering a view. The
predefined strategies are:

* #### [Underscore templates](#h-template-strategy-underscore-template)
  * `Giraffe.View#template` is an __Underscore__ template string.
* #### [Underscore template selector](#h-template-strategy-underscore-template-selector)
  * `Giraffe.View#template` is a CSS selector of an __Underscore__ template. This is the default.
* #### [JavaScript template functions (JST)](#h-template-strategy-jst)
  * `Giraffe.View#template` is a function that returns an HTML string.

Templating is fully user customizable as detailed in the
[User-Defined Template Strategy](#h-user-defined-template-strategy) and
[Mustache Integration](#h-mustache-integration) sections below.


<div class='note'>
At [Barc](http://barc.com) we love CoffeeScript and use
[funcd](https://github.com/mgutz/funcd), a function based template engine.
</div>

## Strategy Scope

First decide whether to set the strategy globally or to a specific view.
The global case is the one most used as it enforces consistent templating
across a project. To set a global strategy use the class method
`Giraffe.View.setTemplateStrategy`.

```js
Giraffe.View.setTemplateStrategy('underscore-template');
```

To enable for a specific view, set the `templateStrategy` option.

```js
var View = Giraffe.View.extend({
  templateStrategy: 'underscore-template',
  template: '<p>Hello <%= name %></p>',
  serialize: function() {
    return {name: 'giraffe'};
  }
  ...
});
```

<div class='note'>
The `template` property works in concert with `serialize`
to transform a view's data into HTML when
using one of the predefined strategies.
By default, `serialize` returns the view.
</div>

:::BEGIN Example
## Template Strategy 'underscore-template'

This is the simplest strategy and works well with CoffeeScript's multi-line
strings.

```js
Giraffe.View.setTemplateStrategy('underscore-template');

var View = Giraffe.View.extend({
  // Optionally, set the strategy for this view only
  //templateStrategy: 'underscore-template',
  template: '<p>Using the \'<%= name %>\' strategy</p>',
  // or
  //template: $('#my-template-selector').html(),
  serialize: function() {
    return {name: 'underscore-template'};
  }
});

var view = new View();
view.attachTo('body');
```

:::< common.md --raw


:::@ --hide

```css
p {
  color: #F50;
  font-size: 18px;
}
```


### Result

{{{EXAMPLE style='height: 20px'}}}

:::END


:::BEGIN Example
## Template Strategy 'underscore-template-selector'

This strategy expects a selector to a DOM element containing the template. This
is the default template strategy because it is concise and a common choice of
__Backbone__ developers.

In HTML page

```html
<script id='hello-template' type='text/template'>
  <p>Using the '<%= name %>' strategy</p>
</script>
```

In script

```js

Giraffe.View.setTemplateStrategy('underscore-template-selector');

var View = Giraffe.View.extend({
  // Optionally, set the strategy for this view only
  //templateStrategy: 'underscore-template-selector',
  template: '#hello-template',
  serialize: function() {
    return {name: 'underscore-template-selector'};
  }
});

var view = new View();
view.attachTo('body');
```

:::< common.md --raw

:::@ --hide

```css
p {
  color: #F50;
  font-size: 18px;
}
```


### Result

{{{EXAMPLE style='height: 20px'}}}

:::END

:::BEGIN Example
## Template Strategy 'jst'

This strategy expects `template` to be a function that returns an HTML string.

```js
Giraffe.View.setTemplateStrategy('jst');

var View = Giraffe.View.extend({
  // Optionally, set the strategy for this view only
  //templateStrategy: 'jst',
  template: function(data) {
    return '<p>Using the \'' + data.name + '\' strategy</p>';
  },
  serialize: function() {
    return {name: 'jst'};
  }
});

var view = new View();
view.attachTo('body');
```

:::< common.md --raw

:::@ --hide

```css
p {
  color: #F50;
  font-size: 18px;
}
```

### Result

{{{EXAMPLE style='height: 20px'}}}

:::END


:::BEGIN Example
## User-Defined Template Strategy

To completely override __Giraffe__ templating, assign a function to
`templateStrategy` that returns an HTML string.

As an example, many developers have a build process to precompile templates into
JavaScript Templates (`JST`) objects. The object might look something like this:

```js
var JST = {
  body: function(it) {
    return '<p>Using a ' + it.name + ' strategy</p>';
  },
  header: function(it) { return '<div>Header</div>'; },
  footer: function(it) { return '<div>footer</div>'; },
};
```

To use this `JST`, we'll assign `setTemplateStrategy` a
function which uses the view's `template` as the name of `JST` function to
call.

```js

Giraffe.View.setTemplateStrategy(function() {
  var data = this.serialize();
  var template = JST[this.template];
  return template(data);
});

var View = Giraffe.View.extend({
  template: 'body',
  serialize: function() {
    return {name: 'user-defined'};
  }
});

var view = new View();
view.attachTo('body');
```

:::< common.md --raw

:::@ --hide

```css
p {
  color: #F00;
  font-size: 18px;
}
```

### Result

{{{EXAMPLE style='height: 20px'}}}

:::END


:::BEGIN Example
## Mustache Integration

This example shows how to integrate __Mustache__ templates into __Giraffe__
using a user-defined strategy.

```js
Giraffe.View.setTemplateStrategy(function() {
  return Mustache.render(this.template, this.serialize());
});

var View = Giraffe.View.extend({
  // Optionally, set the strategy for this view only
  //templateStrategy: function() { return Mustache.render(...); },
  template: '<p>Using {{name}}</p>',
  serialize: function() {
    return {name: 'Mustache'};
  }
});

var view = new View();
view.attachTo('body');
```

:::< common.md --raw

All we need now is a reference to the Mustache library in our page

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/mustache.js/0.7.2/mustache.min.js"></script>
```

:::@ --hide

```css
p {
  color: #F00;
  font-size: 18px;
}
```

### Result

{{{EXAMPLE style='height: 20px'}}}

:::END
