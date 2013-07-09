
Giraffe.View.setTemplateStrategy('underscore-template-selector');

var View = Giraffe.View.extend({
  // Optionally, set the strategy for this view only
  //templateStrategy: 'underscore-template-selector',
  template: '#hello-template',
  serialize: function() {
    return {name: 'underscore-template-selector'};
  }
});

var view = new View();
view.attachTo('body');