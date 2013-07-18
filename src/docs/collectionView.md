# Implement CollectionView

CollectionView and ItemView are classes found in other Backbone frameworks.
This example shows how to implement this pattern in __Giraffe__.

:::BEGIN Example

## The View's Model

This example renders a collection of fruits. Defining the model is the
same as in __Backbone__.

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

## Collection and Item View

Unlike other frameworks, every __Giraffe.View__ is composable.
Collection and item views in __Giraffe__ are just views.

The item view for fruit is fairly simple.

```js
var FruitView = Giraffe.View.extend({
  template: '#fruit-template',

  initialize: function() {
    this.$el.css('background-color', this.model.get('color'));
  },

  onDelete: function() {
    // we could cheat and call this.dispose(), modify the collection instead
    this.parent.collection.remove(this.model);
  }
});
```

```html
<script id='fruit-template' type='text/template'>
  <div id='<%= model.cid %>' class='fruit-view'>
    <h2><%= model.get('name') %></h2>
    <button data-gf-click='onDelete'>delete</button>
  </div>
</script>
```

The collection view acts on changes in its collection, thus the view needs
to listen for `add` and `remove` events. The `dataEvents` property facilitates
assigning data event handlers.

```js
var FruitsView = Giraffe.View.extend({
  dataEvents: {
    'add collection': 'onAddItem',
    'remove collection': 'onRemoveItem'
  },
```

<div class='note'>
Consider `dataEvents` property unstable. One of smart interns found a common
use case where it does not work. We may deprecate this property.
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

Adding of child items has to happen after this collection view has rendered
itself.

```js
  afterRender: function() {
    var my = this;
    this.collection.each(function (item) {
      my.onAddItem(item, my.collection);
    });

  }
});
```

All that is left is to create tasty fruits and attach the view to the page.

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
