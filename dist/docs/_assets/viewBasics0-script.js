var MyView = Giraffe.View.extend({
  template: '#my-template',
  serialize: function() {
    return {name: 'my view'};
  }
});

var myView = new MyView();
myView.attachTo('body');