:::BEGIN Example


# View UI

This example demonstrates the __Giraffe.View__ `ui` feature that maintains
cached __jQuery__ objects for a view and allows you to use the names of these
cached objects in your `events` hash. The `ui` hash is a simple map of names to
selectors. For example, `{$button: 'button'}` makes `this.$button` available
once the view has rendered at least once.

```js
var View = Giraffe.View.extend({
  ui: {
    '$someButton': 'button'
  },
  events: {
    'click $someButton': function() {
      alert('clicked `this.$someButton` which has length ' + this.$someButton.length);
    }
  },
  template: '#view-template'
});
```

```html
<script id="view-template" type="text/template">
  <button>click me</button>
</script>
```

Let's create and attach the view to see it in action.

```js
var view = new View();
view.attachTo('body');
```

:::< common.md --raw

## Try It

{{{EXAMPLE style='height: 26px;'}}}


:::END
