# Implement CollectionView

CollectionView and ItemView are classes often found in other Backbone
frameworks. This example details how to implement this pattern in __Giraffe__
by rendering a collection of fruits.

:::BEGIN Example

## Collection and Model

Defining the model and collection is the same as in __Backbone__.
Any __Giraffe.Model__ is automatically tracked for dispoal when assigned to
a __Giraffe.View__.

```js
var Fruit = Giraffe.Model.extend({
  defaults: {
    name: null,
    color: null
  }
});

var Fruits = Giraffe.Collection.extend({
  model: Fruit
});
```

## Item View

In __Giraffe__ views are composable meaning many of the features needed
for CollectionView and ItemView are already baked into the view.

```js
var FruitView = Giraffe.View.extend({
  template: '#fruit-template',

  initialize: function() {
    this.$el.css('background-color', this.model.get('color'));
  },

  onDelete: function() {
    // We could cheat and call this.dispose(). Modify the collection
    // instead and let the parent view worry about removing the child view.
    this.model.collection.remove(this.model);
  }
});
```

In the view's template, assign `model.cid` as the id. This will be used
to find the closest view in the remove handler for the collection.

```html
<script id='fruit-template' type='text/template'>
  <div id='<%= model.cid %>' class='fruit-view'>
    <h2><%= model.get('name') %></h2>
    <button data-gf-click='onDelete'>delete</button>
  </div>
</script>
```

## Collection View

The parent or collection view acts on changes in its collection, thus the
view has to listen for `add` and `remove` events. The `dataEvents` property
facilitates assigning data event handlers.

```js
var FruitsView = Giraffe.View.extend({
  dataEvents: {
    'add collection': 'onAddItem',
    'remove collection': 'onRemoveItem'
  },
```

<div class='note'>
Consider `dataEvents` property unstable. One of our smart interns found a common
use case where this does not work. We may deprecate this property.
</div>

```js
  onAddItem: function(fruit) {
    var itemView = new FruitView({model: fruit});
    this.attach(itemView);
  },

  onRemoveItem: function(fruit) {
    // fruit template assigns fruit.cid to div
    var itemView = Giraffe.View.getClosestView('#' + fruit.cid);
    itemView.dispose();
  },
```

Child items must be added __after__ this collection view has rendered itself.

```js
  afterRender: function() {
    var my = this;
    this.collection.each(function (item) {
      my.onAddItem(item, my.collection);
    });
  }
});
```

Let's create tasty fruits and attach the collection view to the page.

```js
var fruits = new Fruits([
  {name: 'Apple', color: '#0F0'},
  {name: 'Banana', color: '#FF0'},
  {name: 'Orange', color: '#FF7F00'}
]);

var fruitsView = new FruitsView({
  collection: fruits
});

fruitsView.attachTo('body');
```

To see `add` in action, let's add grapefruit asyncronously.

```js
setTimeout(function() {
  fruits.add([{
    name: 'Pink Grapefruit',
    color: '#C5363A'
  }]);
}, 300);

```
:::@ --hide

```css
h2 {
  font-size: 24px;
}
.fruit-view {
  position: relative;
  padding: 10px;
  margin: 10px;
}
```

{{{COMMON}}}

Voila! Fruitty-tutty

{{{EXAMPLE style='height: 340px'}}}

:::END
