var ParentView, ChildView;

ParentView = Giraffe.View.extend({
  template: '#parent-template',
  afterRender: function() {
    var childView = new ChildView({name: 'child view'});
    childView.attachTo(this);
  }
});

ChildView = Giraffe.View.extend({
  template: '#child-template'
});

var parentView = new ParentView();
parentView.attachTo('body');

var childView = parentView.children[0];
console.log(parentView === childView.parent); // => true

var childView2 = new ChildView({name: 'child view attached with {method: "before"}'});
childView2.attachTo(childView, {method: 'before'});

console.log(childView2.parent === parentView); // => true