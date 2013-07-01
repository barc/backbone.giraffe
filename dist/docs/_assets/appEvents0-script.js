var App = Giraffe.App.extend({
  afterRender: function() {
    this.attach(new ChildView({color: '#e99', text: 'Color the views red!'}));
    this.attach(new ChildView({color: '#9e9', text: 'Color the views green!'}));
    this.attach(new ChildView({color: '#99e', text: 'Color the views blue!'}));
  }
});

var ChildView = Giraffe.View.extend({
  className: 'child-view',

  initialize: function() {
    this.$el.css('background-color', this.options.color);
  },

  getHTML: function() {
    return '<button>' + this.options.text + '</button>';
  },

  events: {
    'click button': 'colorChildViews'
  },

  appEvents: {
    'setColor': function(color) { this.$el.css('background-color', color); }
    //'someOtherAppEvent': 'someFunctionName'
  },

  colorChildViews: function() {
    this.app.trigger('setColor', this.options.color);
  }
});

App.prototype.appEvents = {
  'all': function() { console.log('app event', arguments); }
};

var app = new App();
app.attachTo('body');