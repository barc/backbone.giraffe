var App, ChildView;

App = Giraffe.App.extend({
  template: '#app-template',

  appEvents: {
    'route:childView': 'showChildView',
    'all': function() { console.log('app event', arguments); }
    // 'some:otherRoute': 'someMethodName'
    // 'some:otherAppEvent': 'someOtherMethodName'
  },

  showChildView: function(name) {
    this.attach(new ChildView({name: name}), {el: '#child-view-container', method: 'html'});
  }
});

ChildView = Giraffe.View.extend({
  className: 'child-view',
  template: '#child-template',
  initialize: function(options) {
    var color;
    if (options.name === '1')
      color = '#e99';
    else if (options.name === '2')
      color = '#9e9';
    else
      color = '#99e';
    this.$el.css('background-color', color);
  }
});

var app = new App();
app.attachTo('body');

var router = new Giraffe.Router({
  triggers: {
    'childView/:name': 'route:childView'
    // 'someHashLocation/:andItsParams': 'some:appEvent'
  }
});

console.log(router.app === Giraffe.app); // => true

// Alternatively:
// var Router = Giraffe.Router.extend({triggers: {...}});
// var router = new Router();

Backbone.history.start();

router.cause('route:childView', 1);

console.log(router.isCaused('route:childView', 1)); // => true
console.log(router.isCaused('route:childView', 2)); // => false
console.log(router.isCaused('route:childView'));    // => false
console.log(router.getRoute('route:childView', 1)); // => '#childView/1'