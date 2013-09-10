:::BEGIN Example


# View Data Events

This example demonstrates how to use the `dataEvents` map of __Giraffe.View__.
Similar to how the __Backbone.View__ `events` map binds DOM events to view
methods, __Giraffe.View__ provides the `dataEvents` hash that maps object events
to view methods. Like the `events` map, the `dataEvents` bindings are also
automatically cleaned up when a view's `dispose` method is called.

```js
var View = Giraffe.View.extend({
```

To demonstrate `dataEvents`, we'll first need some data. In this example we'll
use a regular __Giraffe.Collection__, but `dataEvents` works with any object
that implements __Backbone.Events__.

```js
  initialize: function() {
    this.collection = new Giraffe.Collection();
  },
```

`dataEvents` maps events on an object to a view method via `Backbone.Events#listenTo`.
Its key is a space-separated series of events ending with the target object.
This structure mirrors the `events` map of __Backbone.View__,
`{'domEventName selector': 'viewMethod'}`, but replaces the selector with the
name of any `Backbone.Events` object on this view instance.
As a result of using `listenTo`, `dataEvents` accepts multiple events per
definition and the handlers are called in the context of the view.

```js
  dataEvents: {
    'add remove collection': 'render'
    // 'someEvent anotherEvent someBackboneEventsObject': function() { ... }
    // 'anEventTriggeredOnThisView this': 'someMethodName' // listen to self
    // 'sameEventAsAbove @': 'sameMethodAsAbove'
  },
```

<div class="note">
  The above is equivalent to putting
  `this.listenTo(this.collection, 'add remove', this.render);` in `initialize`.
</div>

This example has a button to add a new model and a button for each model that
removes it. The [__Document Events__](documentEvents.html) feature is used to
bind click events to view methods.

```js
  template: '#view-template',
```

```html
<script id="view-template" type="text/template">
  <button data-gf-click="onAddModel">add model</button>
  <% collection.each(function(model, index) { %>
    <button data-gf-click="onRemoveModel" data-cid="<%= model.cid %>">
      remove model <%= model.cid %>
    </button>
  <% }); %>
</script>
```

Here are the functions that add and remove models. The ui updates automatically
on the `'add'` and `'remove'` events bound in `dataEvents`.

```js
  onAddModel: function(e) {
    this.collection.add({});
  },

  onRemoveModel: function(e) {
    var cid = $(e.target).data('cid');
    this.collection.remove(cid);
  }
});
```

That's it! Let's create and attach the view.

```js
var view = new View();
view.attachTo('body');
```

<div class="note">
  Unfortunately `dataEvents` fails for some use cases. Its events are bound
  directly after `Giraffe.View#initialize`, so if your view needs to respond
  to events  in the `constructor` or `initialize`, they won't yet be listened
  for, and if your view creates data objects after `initialize`, they won't
  be bound to. We advocate using `Backbone.Events#listenTo` directly in these
  circumstances.
</div>

:::< common.md --raw

## Try It

{{{EXAMPLE style='height: 80px;'}}}


:::END
