var View = Giraffe.View.extend({

  template: '<h2><%= name %></h2>',

  serialize: function() {
    return {name: 'main view'};
  }
});

var view = new View();

view.attachTo('body');

view.cid; // => 'view1'
view.$el.data("view-cid"); // => 'view1'

var ChildView = Giraffe.View.extend({
  className: 'child-view',

  template: '<h3><%= name %></h3>',

  serialize: function() {
    return {name: 'child view'};
  }
});

var childView = new ChildView();
view.attach(childView);

childView.parent === view;      // => true
view.children[0] === childView; // => true

childView.options.disposeOnDetach = false;
// or...
// new ChildView({disposeOnDetach: false});

view.afterRender = function() {
  this.attach(childView);
};
view.render();                // => childView.detach()
view.children.length === 1;   // => true, because childView.options.disposeOnDetach === false
view.$el.find(childView.$el); // => yep! good work, `afterRender`!

$('body').append('<p>We rendered the main view and saved the child!</p>')