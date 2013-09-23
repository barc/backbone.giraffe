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

var FruitsView = Giraffe.Contrib.FastCollectionView.extend({
  // The view's regular template
  template: '#fruits-template',

  // Options specific to the `FastCollectionView`
  modelTemplate: '#fruit-template', // required - used to get the html per model
  modelEl: '#fruits-list', // optional - el to insert result of `modelTemplate`
  // `modelSerialize` and `modelTemplateStrategy` options are not shown

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
    this.collection.add(model.clone());
  }
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
    this.attach(fruitsView);
  }
});

var mainView = new MainView();

mainView.attachTo('body');