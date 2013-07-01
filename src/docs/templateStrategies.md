## Template Strategies

Creating HTML markup is a lot of what we do as front end developers.
There are many solutios as evident by the ever increasing number of templating
libraries found on the web. __Giraffe__ provides templating strategies
based on the built-in dependecies of Backbone, namely underscore `template`
function. The predefined strategies are

* underscore templates
* underscore templates in the DOM
* JavaScript template functions (JST)

Selecting a strategy tells __Giraffe__ how to utilize `Giraffe.View#template`
property when rendering a view. Of course templating is user
customizable as detailed in the [User Defined](#h-user-defined)
section below.

<div class='aside'>
At [Barc](http://barc.com) we love CoffeeScript and use [funcd](https://github.com/mgutz/funcd),
a function based template engine.
</div>

### Strategy Scope

First decide whether to set the strategy globally or to a specific view.
The global case is the one most used as it enforces consistent templating
across a project. To enable a global strategy use `Giraffe.View.setTemplateStrategy`
class method

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
to transform a view's model and/or collection into HTML when
using one of the predefined strategies.
</div>

:::BEGIN Example
### Underscore Template

This is the simplest and works well with CoffeeScript's multi-line
strings.

```js
var View = Giraffe.View.extend({
  templateStrategy: 'underscore-template',
  template: '<p>Using <%= name %> strategy</p>',
  serialize: function() {
    return {name: 'underscore-template'};
  }
});

var view = new View();
view.attachTo('body');
```

{{{COMMON}}}

```css --hide
p {
  color: #F50;
  font-size: 18px;
}
```


#### Result

{{{EXAMPLE style='height: 40px'}}}

:::END


:::BEGIN Example
### Underscore Template Selector

This strategy expects a selector to a DOM element containing the template.

In HTML page

```html
<script id='hello-template' type='gf-template'>
  <p>Using <%= name %> strategy</p>
</script>
```

In script

```js
var View = Giraffe.View.extend({
  templateStrategy: 'underscore-template-selector',
  template: '#hello-template',
  serialize: function() {
    return {name: 'underscore-template-selector'};
  }
});

var view = new View();
view.attachTo('body');
```

{{{COMMON}}}

```css --hide
p {
  color: #F50;
  font-size: 18px;
}
```


#### Result

{{{EXAMPLE style='height: 40px'}}}

:::END

:::BEGIN Example
### Javascript Template Function

This strategy expects a function.

```js
var View = Giraffe.View.extend({
  templateStrategy: 'jst',
  template: function(data) {
    return '<p>Using ' + data.name + ' strategy</p>';
  },
  serialize: function() {
    return {name: 'jst'};
  }
});

var view = new View();
view.attachTo('body');
```

{{{COMMON}}}

```css --hide
p {
  color: #F50;
  font-size: 18px;
}
```

#### Result

{{{EXAMPLE style='height: 40px'}}}

:::END


:::BEGIN Example
### User Defined

To completely override __Giraffe__ templating assign a function to `templateStrategy`.

```js
var View = Giraffe.View.extend({
  templateStrategy: function() {
    var data = this.serialize();
    return '<p>Using  ' + data.name + ' strategy</p>';
  },
  serialize: function() {
    return {name: 'user defined'};
  }
});

var view = new View();
view.attachTo('body');
```

{{{COMMON}}}

```css --hide
p {
  color: #F00;
  font-size: 18px;
}
```

#### Result

{{{EXAMPLE style='height: 40px'}}}

:::END


