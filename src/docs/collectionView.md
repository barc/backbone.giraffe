# Giraffe.Contrib.CollectionView

This example details how to use `Giraffe.Contrib` to implement views for a
collection of fruits with the CollectionView and ItemView design pattern.

:::BEGIN Example

## Live Example

Here is the live example detailed below. Each fruit is rendered using an
item view named `FruitView`. The collection of fruits are children of a
single collection view named `FruitsView`.

- `clone` button creates a duplicate of the fruit
- `delete` button deletes the fruit from the collection
- `sort` button toggles ascending/descending sort
- `reset` button resets the collection to its original state

{{{EXAMPLE style='height: 375px'}}}

## Collection and Model

First define the model and collection representing the fruits. The advantage
of using __Giraffe.Model__ is the addition of a few methods such as
`Model#dispose` which is used later. This is not that different from using
__Backbone.Model__.


```js
var Fruit = Giraffe.Model.extend({
  defaults: {
    name: null,
    color: null
  }
});

var Fruits = Giraffe.Collection.extend({
  model: Fruit,
  comparator: 'name',

  toggleSort: function() {
    var comparator = this.comparator;

    // Reverse string order isn't as simple as prefixing with '-'. See
    // http://stackoverflow.com/a/5639070. Collection.reverse() is not a good
    // idea neither as the collection would not sort properly on add/remove.
    if (typeof comparator === 'string') {
      comparator = function(fruit) {
        return String.fromCharCode.apply(String, _.map(fruit.get("name").split(""),
          function (c) {
            return 0xffff - c.charCodeAt();
          }
        ));
      }
    } else {
      comparator = 'name';
    }
    this.comparator = comparator;
    this.sort();
  }
});
```

## Item View

Instead of generating markup for each fruit in a single view, it is more
maintainable to create an item view representing each item in the collection.
The item view encapsulates operations around the specific item.

```js
var FruitView = Giraffe.View.extend({
  template: '#fruit-template',

  initialize: function() {
    this.$el.css('background-color', this.model.get('color'));
  },

  serialize: function() {
    return this.model.toJSON()
  },
```

We could cheat and call `this.dispose()` here. By modifying the collection
instead, any view observing the collection is notified. `Contrib.CollectionView`
observes collection changes and modifies its item views accordingly.

```js
  onDelete: function() {
    // Giraffe method which also removes it from the collection
    this.model.dispose();
  },

  onClone: function() {
    this.model.collection.add(this.model.clone());
  }
});
```

Let's add a delete and clone button to allow users to visually modify the
collection.

```html
<script id='fruit-template' type='text/template'>
  <div class='fruit-view'>
    <h2><%= name %></h2>
    <button data-gf-click='onDelete'>delete</button>
    <button data-gf-click='onClone'>clone</button>
  </div>
</script>
```

## Collection View

`Giraffe.Contrib` contains a `CollectionView` class . The `CollectionView`
adds and removes item views to itself as it observes changes on its
collection. It is good practice to __always__ modify the collection
instead of trying to add views manually.

```js
var FruitsView = Giraffe.Contrib.CollectionView.extend({
  itemView: FruitView
});
```

Now create some tasty fruits and create the collection to assign to  `FruitsView`.

```js
var savoryFruits = [
    {name: 'Orange', color: '#FF7F00'},
    {name: 'Pink Grapefruit', color: '#C5363A'},
    {name: 'Apple', color: '#0F0'},
    {name: 'Banana', color: '#FF0'},
];

var fruits = new Fruits(savoryFruits);

var fruitsView = new FruitsView({
  collection: fruits
});
```

## Resetting and Sorting

Let's also give the user the ability to `reset` and `sort` fruits at
any time. The buttons need to be outside of the collection view otherwise
they would be disposed when the view resets its children.

Create a main view to contain the button just to keep things tidy and
easy one-way click binding.

```html
<script id='main-template' type='text/template'>
  <button data-gf-click='onClickReset'>reset</button>
  <button data-gf-click='onClickSort'>sort</button>
  <hr />
  <!-- fruits view is appended here in afterRender -->
</script>
```

```js
var MainView = Giraffe.View.extend({
  template: '#main-template',

  onClickReset: function() {
    fruitsView.collection.reset(savoryFruits);
  },

  onClickSort: function() {
    fruitsView.collection.toggleSort();
  },

  afterRender: function() {
    this.attach(fruitsView, {method: 'append'});
  }
});

var mainView = new MainView();

mainView.attachTo('body');
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
hr {
  border: 0;
  height: 0;
  border-top: 1px dashed #ccc;
}
```

:::< common.md --raw

We need to source the  `Backbone.Giraffe.Contrib` library which defines `Giraffe.CollectionView`.

<div class='note'>
None-core goodies are added to `Backbone.Giraffe.Contrib`, short for contributions.
</div>

```html
  <script src="../backbone.giraffe.contrib.js" type="text/javascript"></script>
```


:::END
