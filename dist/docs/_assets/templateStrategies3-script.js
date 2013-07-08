var View = Giraffe.View.extend({
  templateStrategy: function() {
    var data = this.serialize();
    return '<p>Using  ' + data.name + ' strategy</p>';
  },
  serialize: function() {
    return {name: 'user defined'};
  }
});

// or globally:
// Giraffe.View.setTemplateStrategy(function() { ... });

var view = new View();
view.attachTo('body');