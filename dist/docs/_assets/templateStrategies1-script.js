var View = Giraffe.View.extend({
  templateStrategy: 'underscore-template-selector',
  template: '#hello-template',
  serialize: function() {
    return {name: 'underscore-template-selector'};
  }
});

// or globally:
// Giraffe.View.setTemplateStrategy('underscore-template-selector');

var view = new View();
view.attachTo('body');