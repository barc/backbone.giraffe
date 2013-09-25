# Giraffe.Contrib.FastCollectionView

This example details how to use
[`Giraffe.Contrib`](https://github.com/barc/backbone.giraffe/blob/master/dist/backbone.giraffe.contrib.js)
to implement a view for a collection of fruits with the __Contrib.FastCollectionView__,
a class that efficiently renders a collection with a single view.

The goal of this class is to render a collection as efficiently as possible. It
has yet to be optimized much, but when re-rendering the entire collection on a
`'sort'` or `'reset'` event it is very fast. 
[Here's a jsPerf with more.](http://jsperf.com/collection-views-in-giraffe-and-marionette/2)

:::BEGIN Example

## Live Example

Here is the final result.
The fruits are rendered inside a shared instance of `FruitsView`, which inherits
directly from `Giraffe.View`. A number of actions can be performed via buttons:

- `clone` creates a duplicate of the fruit
- `delete` remove the fruit from the collection
- `sort` toggles ascending/descending sort
- `reset` resets the collection to its original state

{{{EXAMPLE style='height: 410px'}}}

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
  comparator: 'name'
});
```

:::@ --hide
```js
Fruits.prototype.toggleSort = function() {
  var comparator = this.comparator;

  // Reverse string order isn't as simple as prefixing with '-'. See
  // http://stackoverflow.com/a/5639070. Collection.reverse() is not a
  // good idea as the collection would not sort properly on add/remove.
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
};
```

## Collection View

`Giraffe.Contrib` contains a `FastCollectionView` class that syncs a template
per model in its `collection` by reacting to add/remove/sort/reset events.

```js
var FruitsView = Giraffe.Contrib.FastCollectionView.extend({
  // The view's regular template
  template: '#fruits-template',

  // Options specific to the `FastCollectionView`
  modelTemplate: '#fruit-template', // required - used to get the html per model
  modelEl: '#fruits-list', // optional - el to insert result of `modelTemplate`
  // `modelSerialize` and `modelTemplateStrategy` options not shown
  
  onDelete: function(e) {
    var model = this.getModelByEl(e.target); // `FastCollectionView` method
    // `dispose` is a Giraffe method which also removes it from the collection
    model.dispose();
    // or
    // this.collection.remove(model);
    // or
    // this.removeOne(model); // `FastCollectionView` method
  },
  
  onClone: function(e) {
    var model = this.getModelByEl(e.target);
    var newModel = model.clone();
    this.collection.add(newModel);
    // or
    // this.addOne(newModel); // `FastCollectionView` method
  }
});
```

The `FastCollectionView` property `modelEl` designates where to insert the
models' html. It defaults to `view.$el`. It is important to not put any other
elements inside `modelEl`, as __Giraffe__ makes this assumption to be able to
enable its automated features without creating views. As specified in
`FruitsView`, `'#fruits-list'` contains the fruits. Here's the template that
creates this `modelEl`:

```html
<script id='fruits-template' type='text/template'>
  <h1>Fruits</h1>
  <ul id='fruits-list'> <!-- matches `modelEl` -->
    <!-- `modelTemplate` result is inserted here for each model -->
  </ul>
</script>
```

<div class="note">
To maximize performance, the `FastCollectionView` is destructive
to its `modelEl` when the collection is fully re-rendered, which currently
occurs on `render` and the `'reset'` and `'sort'` events.
</div>

The template rendered per model, `modelTemplate`, `'#fruit-template'` in this
example, is the only required option of the `FastCollectionView`.
Let's add delete and clone buttons to let users visually modify the collection.

```html
<script id='fruit-template' type='text/template'>
  <li class='fruit' style='background-color: <%= attributes.color %>;'>
    <h2><%= attributes.name %></h2>
    <button data-gf-click='onDelete'>delete</button>
    <button data-gf-click='onClone'>clone</button>
  </li>
</script>
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
  <!-- FruitsView is appended here in afterRender -->
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
    this.attach(fruitsView);
  }
});

var mainView = new MainView();

mainView.attachTo('body');
```

<div class="note">
The `FastCollectionView` should be especially fast when re-rendering the entire
collection as on `'reset'` and `'sort'` events, because it concatenates all of
the html for each model into one string. However this may not always be the
optimal behavior. This class is a work in progress and smarter
rendering is something to look into. 
[Here's a jsPerf with more.](http://jsperf.com/collection-views-in-giraffe-and-marionette/2)
</div>

:::@ --hide

```css
h1 {
  font-size: 36px;
}
h2 {
  font-size: 24px;
}
.fruit {
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

We need to source the  `Backbone.Giraffe.Contrib` library which defines
`Giraffe.Contrib.FastCollectionView`.

<div class='note'>
None-core goodies are added to 
[`Backbone.Giraffe.Contrib`](https://github.com/barc/backbone.giraffe/blob/master/dist/backbone.giraffe.contrib.js),
short for contributions.
</div>

```html
  <script src="../backbone.giraffe.contrib.js" type="text/javascript"></script>
```


:::END
