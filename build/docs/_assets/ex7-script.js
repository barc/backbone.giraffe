var View = Giraffe.View.extend({

  getHTML: function() {
    return '<h2>' + this.cid + '</h2>';
  }
});

var view = new View();

view.attachTo('body');

$('body').append('<p>view.cid: ' + view.cid + '</p>');
$('body').append('<p>view.$el.data("view-cid"): ' + view.$el.data('view-cid') + '</p>');

var ChildView = Giraffe.View.extend({
  className: 'child-view',

  getHTML: function() {
    return '<h3>' + this.cid + '</h3>';
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

$('body').append('<p>We rendered the view and saved the child! What a feat!</p>')