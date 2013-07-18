# Implement CollectionView

CollectionView and ItemView are classes often found in other Backbone
frameworks. This example details how to implement this pattern in __Giraffe__
by rendering a collection of savory colored fruits.

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

In __Giraffe__ views are composable obviating the need for a
a dedicated CollectionView and ItemView.

```js
var FruitView = Giraffe.View.extend({
  template: '#fruit-template',

  initialize: function() {
    // used to find this view by its unique collection id
    this.$el.attr('id', this.model.cid);
    this.$el.css('background-color', this.model.get('color'));
  },

  serialize: function() {
    return this.model.toJSON()
  },
```

We could cheat and call `this.dispose()` here. By modifying the collection
instead, any view observing the collection is notified.

```js
  onDelete: function() {
    this.model.collection.remove(this.model);
  }
});
```

Add a delete button to manually remove elements from the collection.

```html
<script id='fruit-template' type='text/template'>
  <div class='fruit-view'>
    <h2><%= name %></h2>
    <button data-gf-click='onDelete'>delete</button>
  </div>
</script>
```

## Collection View

A collection view reacts to changes on its collection, thus the
view needs handlers for `add` and `remove` events. The
`dataEvents` property facilitates assigning handlers.

```js
var FruitsView = Giraffe.View.extend({
  dataEvents: {
    'add collection': 'onAddItem',
    'remove collection': 'onRemoveItem'
  },
```

<div class='note'>
  <p>
    Consider `dataEvents` property unstable. One of our smart interns found a common
    use case where events do not trigger. That is, if you modify a model/collection
    in the `initialize` method, event listeners have not yet been assigned and
    expected events do not fire.
  </p>
  <p>
    We may obsolete this property altogether as it could lead to [astonishment](https://en.wikipedia.org/wiki/Principle_of_least_astonishment).
  </p>
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

Child items must be added _after_ this collection view has rendered itself.

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
