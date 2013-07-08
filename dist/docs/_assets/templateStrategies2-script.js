var View = Giraffe.View.extend({
  templateStrategy: 'jst',
  template: function(data) {
    return '<p>Using ' + data.name + ' strategy</p>';
  },
  serialize: function() {
    return {name: 'jst'};
  }
});

// or globally:
// Giraffe.View.setTemplateStrategy('jst');

var view = new View();
view.attachTo('body');