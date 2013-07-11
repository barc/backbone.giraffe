Giraffe.View.setTemplateStrategy(function() {
  return Mustache.render(this.template, this.serialize());
});

var View = Giraffe.View.extend({
  // Optionally, set the strategy for this view only
  //templateStrategy: function() { return Mustache.render(...); },
  template: '<p>Using {{name}}</p>',
  serialize: function() {
    return {name: 'Mustache'};
  }
});

var view = new View();
view.attachTo('body');