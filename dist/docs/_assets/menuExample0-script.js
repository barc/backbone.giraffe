var App, MenuView, MenuItemView, ContentView, ContentItemView;

App = Giraffe.App.extend({
  initialize: function() {
    this.menuItems = new Giraffe.Collection([
      {name: 'menu item 1'},
      {name: 'menu item 2'},
      {name: 'menu item 3'}
    ]);
  },

  afterRender: function() {
    this.attach(new MenuView({collection: this.menuItems}));
    this.attach(new ContentView({collection: this.menuItems}));
  }
});

MenuView = Giraffe.View.extend({
  appEvents: {
    'route:menu': 'onRouteMenu'
  },

  onRouteMenu: function(menuItemName) {
    var activeMenuItem = this.collection.findWhere({active: true});
    if (activeMenuItem) activeMenuItem.set('active', false);
    this.collection.findWhere({name: menuItemName}).set('active', true);
  },

  dataEvents: {
    'change:active collection': 'onChangeActiveItem'
  },

  onChangeActiveItem: function(model, active) {
    if (active) this.render();
  },

  afterRender: function() {
    var self = this;
    this.collection.each(function(model) {
      self.attach(new MenuItemView({model: model}));
    });
  }
});

MenuItemView = Giraffe.View.extend({
  getHTML: function() {
    var
      name = this.model.get('name'),
      href = this.app.router.getRoute('route:menu', name),
      className = this.model.get('active') ? 'active' : '';
    return '<a href="' + href + '" class="' + className + '">' + name+ '</a>';
  }
});

ContentView = Giraffe.View.extend({
  dataEvents: {
    'change:active collection': 'onChangeActive'
  },

  onChangeActive: function(model, active) {
    if (active) this.render();
  },

  afterRender: function() {
    var activeMenuItem = this.collection.findWhere({active: true});
    if (activeMenuItem)
      this.getItemView(activeMenuItem).attachTo(this, {method: 'html'});
  },

  getItemView: function(menuItem) {
    var view = _.find(this.children, function(child) {
      return child.model === menuItem;
    });
    if (!view) {
      view = new ContentItemView({
        model: menuItem,
        disposeOnDetach: false,
        saveScrollPosition: true
      });
    }
    return view;
  }
});

ContentItemView = Giraffe.View.extend({
  className: 'content-item-view',

  getHTML: function() {
    var html = '';
    for (var i = 0; i < 50; i++)
      html += '<p>content for ' + this.model.get('name') + '</p>';
    return html;
  }
});

var app = new App();
var router = new Giraffe.Router({
  triggers: {
    'menu/:name': 'route:menu'
  }
});
app.router = router; // set the router reference so the views can use it
app.attachTo('body');
Backbone.history.start();
router.cause('route:menu', 'menu item 1');