:::BEGIN Example

## View UI

This example demonstrates the **Giraffe.View** `ui` feature that maintains cached jQuery objects for a view and allows you to use the names of these cached objects in your `events` hash.
```js
var View = Giraffe.View.extend({
```

The `ui` hash is a simple map of names to selectors. For example, `{$button: 'button'}` makes `view.$button` available once the view has rendered at least once.
```js
  events: {
    'click $someButton': function() {
      alert('clicked `this.$someButton` which has a length of ' + this.$someButton.length);
    }
  },

  ui: {
    '$someButton': 'button'
  },

  getHTML: function() {
    return '<button>click me</button>';
  }
});
```

Let's create and attach the view.
```js
var view = new View();
view.attachTo('body');
```

{{{COMMON}}}

```css --hide
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
