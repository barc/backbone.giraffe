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

var FruitView = Giraffe.View.extend({
  template: '#fruit-template',

  initialize: function() {
    this.$el.css('background-color', this.model.get('color'));
  },

  serialize: function() {
    return this.model.toJSON()
  },

  onDelete: function() {
    // Giraffe method which also removes it from the collection
    this.model.dispose();
  },

  onClone: function() {
    this.model.collection.add(this.model.clone());
  }
});

var FruitsView = Giraffe.Contrib.CollectionView.extend({
  itemView: FruitView
});

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