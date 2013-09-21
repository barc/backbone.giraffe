Giraffe.View.setTemplateStrategy('underscore-template');

var View = Giraffe.View.extend({
  // Optionally, set the strategy for this view only
  //templateStrategy: 'underscore-template',
  template: '<p>Using the \'<%= name %>\' strategy</p>',
  // or
  //template: $('#my-template-selector').html(),
  // or
  //template: function() { return '<p><%= name %></p>'; },
  serialize: function() {
    return {name: 'underscore-template'};
  }
});

var view = new View();
view.attachTo('body');