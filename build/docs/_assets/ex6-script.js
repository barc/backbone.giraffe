var App, ChildView;

App = Giraffe.App.extend({

  getHTML: function() {
    var html = '';
    html += '<p><a href="#childView/1">show child view 1</a></p>';
    html += '<p><a href="#childView/2">show child view 2</a></p>';
    html += '<p><a href="#childView/3">show child view 3</a></p>';
    html += '<div id="child-view-container"></div>';
    return html;
  },

  appEvents: {
    'route:childView': 'showChildView',
    'all': function() { console.log('app event', arguments); } // log to see what's happening
    // 'some:otherRoute': 'someFunctionName'
    // 'some:otherAppEvent': 'someOtherFunctionName'
  },

  showChildView: function(name) {
    this.attach(new ChildView({name: name}), {el: '#child-view-container', method: 'html'});
  }
});

ChildView = Giraffe.View.extend({
  className: 'child-view',

  initialize: function(options) {
    this.name = 'child view ' + this.options.name;
    var color;
    if (options.name === '1')
      color = '#e99';
    else if (options.name === '2')
      color = '#9e9';
    else
      color = '#99e';
    this.$el.css('background-color', color);
  },

  getHTML: function() {
    return '<h2>' + this.name + '</h2>';
  }
});

var app = new App();
app.attachTo('body');

var router = new Giraffe.Router({
  triggers: {
    'childView/:name': 'route:childView'
    // 'someHashLocation/:andItsParams': 'some:appEvent'
  }
  // app: someApp // to set an app other than Giraffe.app
});

router.app === Giraffe.app; // => true

// Alternatively:
// var Router = Giraffe.Router.extend({triggers: {...}});
// var router = new Router();

Backbone.history.start();

router.cause('route:childView', 1);
router.isCaused('route:childView', 1); // => true
router.isCaused('route:childView', 2); // => false
router.isCaused('route:childView');    // => false
router.getRoute('route:childView', 1); // => '#childView/1'