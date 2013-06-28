:::BEGIN Example


## Menu Example

This advanced example demonstrates how you can use Giraffe's features to build a route-powered menu with cached content views that save their scroll position.
```js
var App, MenuView, MenuItemView, ContentView, ContentItemView;
```

```js
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
```

```js
MenuView = Giraffe.View.extend({
  initialize: function() {

  },

  appEvents: {
    'route:menu': 'onRouteMenu'
  },

  onRouteMenu: function(menuItemName) {
    var activeMenuItem = this.collection.findWhere({active: true});
    if (activeMenuItem) activeMenuItem.set('active', false);
    this.collection.findWhere({name: menuItemName}).set('active', true);
  },

  dataEvents: {
    'change:active collection': function(model, active) { if (active) this.render(); }
  },

  afterRender: function() {
    var self = this;
    this.collection.each(function(model) {
      self.attach(new MenuItemView({model: model}));
    });
  }
});
```

```js
MenuItemView = Giraffe.View.extend({
  getHTML: function() {
    var
      name = this.model.get('name'),
      href = this.app.router.getRoute('route:menu', name),
      className = this.model.get('active') ? 'active' : '';
    return '<a href="' + href + '" class="' + className + '">' + name+ '</a>';
  }
});
```

```js
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
    var view = _.find(this.children, function(child) { return child.model === menuItem; });
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
```


```js
ContentItemView = Giraffe.View.extend({
  className: 'content-item-view',

  getHTML: function() {
    var html = '';
    for (var i = 0; i < 50; i++)
      html += '<p>content for ' + this.model.get('name') + '</p>';
    return html;
  }
});
```

All done!

```js
var app = new App();
app.router = new Giraffe.Router({
  triggers: {
    'menu/:name': 'route:menu'
  }
});
app.attachTo('body');
Backbone.history.start();
app.router.cause('route:menu', 'menu item 1');
```

{{{COMMON}}}

```css --hide
// Example
body {
  background-color: #ffffff;
  padding: 20px;
  font-size: 14px;
  font-family: Verdana, Geneva, sans-serif;
}
* {
  box-sizing: border-box;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
}
h1 {
  font-size: 42px;
}
h2 {
  font-size: 24px;
  margin-bottom: 20px;
  display: inline;
  margin-right: 10px;
}
h3 {
  font-size: 18px;
  display: inline;
  margin-right: 10px;
}
.child-view {
  position: relative;
  padding: 20px;
  margin: 20px;
  border: 1px dashed #999;
}
.menu {
  padding-left: 80px;
}
.menu li {
  color: #888;
  display: inline-block;
  min-width: 80px;
  cursor: pointer;
  border: 1px solid transparent;
  text-align: center;
  border-top-left-radius: 4px;
  -moz-border-top-left-radius: 4px;
  -webkit-border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  -moz-border-top-right-radius: 4px;
  -webkit-border-top-right-radius: 4px;
  padding: 4px;
  position: relative;
  top: 1px;
}
.menu li:active {
  color: #555;
}
.menu li.active {
  color: #333;
  border-color: #bbbbbb;
  border-bottom-color: #ffffff;
}
.menu-content {
  border: 1px solid #bbbbbb;
  padding: 20px;
  border-radius: 4px;
  -moz-border-radius: 4px;
  -webkit-border-radius: 4px;
}
.active {
  font-weight: bold;
}
.content-item-view {
  height: 200px;
  overflow: auto;
}
```

## Try It

{{{EXAMPLE}}}


:::END
