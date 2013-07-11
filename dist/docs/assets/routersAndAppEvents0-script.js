var App, ChildView;

App = Giraffe.App.extend({
  template: '#app-template',

  routes: {
    'childView/:name': 'route:childView'
    // 'someHashLocation/:andItsParams': 'some:appEvent'
  },

  appEvents: {
    'route:childView': 'showChildView',
    'all': function() { console.log('app event', arguments); }
    // 'some:otherRoute': 'someMethodName'
    // 'some:otherAppEvent': 'someOtherMethodName'
  },

  showChildView: function(name) {
    var childView = new ChildView({name: name});
    this.attach(childView, {el: '#child-view-container', method: 'html'});
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

Backbone.history.start();

app.router.cause('route:childView', 1);

console.log(app.router.isCaused('route:childView', 1)); // => true
console.log(app.router.isCaused('route:childView', 2)); // => false
console.log(app.router.isCaused('route:childView'));    // => false
console.log(app.router.getRoute('route:childView', 1)); // => '#childView/1'