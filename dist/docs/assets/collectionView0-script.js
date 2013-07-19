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

var FruitView = Giraffe.View.extend({
  template: '#fruit-template',

  initialize: function() {
    this.$el.css('background-color', this.model.get('color'));
  },

  serialize: function() {
    return this.model.toJSON()
  },

  onClone: function() {
    this.model.collection.add(this.model.clone());
  },

  onDelete: function() {
    // Giraffe method which also removes it from the collection
    this.model.dispose();
  }
});

var FruitsView = Giraffe.View.extend({
  dataEvents: {
    'add collection': 'onAddItem',
    'remove collection': 'onRemoveItem'
  },

  getAttachOptions: function(fruit) {
    var index = this.collection.indexOf(fruit);
    var options = {method: 'prepend'};
    if (index > 0) {
      options.method = 'after';
      var pred = this.collection.at(index - 1);
      var predView = _.findWhere(this.children, {model: pred});
      options.el = predView;
    }
    return options;
  },

  onAddItem: function(fruit) {
    var itemView = new FruitView({model: fruit});
    var options = this.getAttachOptions(fruit);
    this.attach(itemView, options);
  },

  onRemoveItem: function(fruit) {
    var itemView = _.findWhere(this.children, {model: fruit});
    itemView.dispose();
  },

  afterRender: function() {
    var my = this;
    this.collection.each(function(item) {
      my.onAddItem(item, my.collection);
    });
  }
});

var fruits = new Fruits([
  {name: 'Apple', color: '#0F0'},
  {name: 'Banana', color: '#FF0'},
  {name: 'Orange', color: '#FF7F00'},
  {name: 'Pink Grapefruit', color: '#C5363A'}
]);

var fruitsView = new FruitsView({
  collection: fruits
});

fruitsView.attachTo('body');