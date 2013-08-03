var App = Giraffe.App.extend({
  afterRender: function() {
    this.attach(new ChildView({color: '#e99', text: 'red'}));
    this.attach(new ChildView({color: '#9e9', text: 'green'}));
    this.attach(new ChildView({color: '#99e', text: 'blue'}));
  }
});

var ChildView = Giraffe.View.extend({
  className: 'child-view',
  template: '#child-template',
  initialize: function() {
    this.$el.css('background-color', this.color);
  },

  appEvents: {
    'setColor': function(color) { this.$el.css('background-color', color); }
    //'someOtherAppEvent': 'someFunctionName'
  },

  events: {
    'click button': 'colorChildViews'
  },
  colorChildViews: function() {
    this.app.trigger('setColor', this.color);
  }
});

App.prototype.appEvents = {
  'all': function() { console.log('app event', arguments); }
};

var app = new App();
app.attachTo('body');