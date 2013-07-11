Giraffe.View.setTemplateStrategy('jst');

var View = Giraffe.View.extend({
  // Optionally, set the strategy for this view only
  //templateStrategy: 'jst',
  template: function(data) {
    return '<p>Using the \'' + data.name + '\' strategy</p>';
  },
  serialize: function() {
    return {name: 'jst'};
  }
});

var view = new View();
view.attachTo('body');