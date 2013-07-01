## Template Strategies

__Giraffe__ provides a few common templating strategies.

* underscore templates
* underscore templates in the DOM
* JavaScript template functions (JST)
* user defined

### Strategy Scope

Choosing a strategy tells __Giraffe__ how to treat a view's `template`
property.

First decide whether a strategy applies globally or to a specific view.
The global case is the one most used as it enforces consistent templating
in a project. To enable a global strategy use `setTemplateStrategy` class
method

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

<div class='note' markdown='1'>
The `template` property works in concert with `serialize`
to transform a view's model and/or collection into HTML markup.
</div>

:::BEGIN Example
### Underscore Template (underscore-template)

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

{{{EXAMPLE}}}

:::END


:::BEGIN Example
### Underscore Template Selector (underscore-template-selector)

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

{{{EXAMPLE}}}

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

{{{EXAMPLE}}}

:::END


:::BEGIN Example
### User Defined

To completely override __Giraffe__ assign a function.

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

{{{EXAMPLE}}}

:::END


