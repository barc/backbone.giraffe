:::BEGIN Example


## View.dataEvents

This example demonstrates how to use the `dataEvents` map of **Giraffe.View**. Similar to how the **Backbone.View** `events` map binds DOM events to view methods, **Giraffe.View** provides the `dataEvents` hash that maps object events to view methods. Like the `events` map, the `dataEvents` bindings are also automatically cleaned up when a view's `dispose` method is called.
```js
var View = Giraffe.View.extend({
```

To demonstrate `dataEvents`, we'll first need some data. In this example we'll use a regular **Backbone.Collection**,
but `dataEvents` works with any object that implements `Backbone.Events`.
```js
  initialize: function() {
    this.collection = new Backbone.Collection();
  },
```

`dataEvents` maps events on an object to a view method. The hash's key is a space-separated list of events ending with the target object. This structure mirrors the `events` map of **Backbone.View**, `{'domEventName selector': 'viewMethod'}`,
but replaces the selector with the name of any `Backbone.Events` object on this view instance, and it has the added benefit of accepting multiple events per definition.
```js
  dataEvents: {
    'add remove collection': 'render'
    // 'someOtherEvent someOtherEventsObject': function() { ... }
    // 'anEventTriggeredOnThisView this': 'someMethodName'
  },
```

This example has a button to add a new model and a button for each model that removes it.
```js
  getHTML: function() {
    var html = '<button data-gf-click="onAddModel">add model</button>';
    this.collection.each(function(model) {
      html += '<button data-gf-click="onRemoveModel" data-cid="' + model.cid + '">' +
        'remove model ' + model.get('name') + '</button>';
    });
    return html;
  },
```

Here are the functions that add and remove models. The ui updates automatically based on the events bound in `dataEvents`.
```js
  onAddModel: function(e) {
    this.modelCount = this.modelCount || 0;
    this.modelCount += 1;
    this.collection.add({name: this.modelCount});
  },

  onRemoveModel: function(e) {
    var cid = $(e.target).data('cid');
    this.collection.remove(this.collection.get(cid));
  }
});
```

That's it! Let's create and attach the view.

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
```


## Try It

{{{EXAMPLE}}}



:::END
