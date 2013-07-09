:::BEGIN Example


# Menu Example

This advanced example demonstrates how you can use Giraffe's features to build a route-powered menu with cached content views that save their scroll position.

```js
var App, MenuView, MenuItemView, ContentView, ContentItemView;
```

## The App

The `App` view creates a collection representing the menu's items along with the menu and content views.

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

## The MenuView

The `MenuView` listens for the `'route:menu'` app event and activates the `collection` item whose `name` matches the route parameter.

```js
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
```

## The MenuItemView

The `MenuItemView` takes a `model` and displays its `name` and `active` status.

```js
MenuItemView = Giraffe.View.extend({
  template: '#menu-item-template',

  serialize: function() {
    var name = this.model.get('name');
    return {
      name: name,
      href: this.app.router.getRoute('route:menu', name),
      className: this.model.get('active') ? 'active' : ''
    };
  }
});
```

```html
<script id="menu-item-template" type="text/template">
  <a href="<%= href %>" class="<%= className %>"><%= name %></a>
</script>
```

## The ContentView

The `ContentView` listens for changes to the `active` property on its `collection` and displays the appropriate `ContentItemView`.

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
```

## The ContentItemView

The `ContentItemView` displays the name of the content. Because these are created with `options.saveScrollPosition` set to `true`, they save their scroll position when detached and apply it when attached.

```js
ContentItemView = Giraffe.View.extend({
  className: 'content-item-view',

  template: '#content-item-template',

  serialize: function() {
    var lines = [];
    for (var i = 0; i < 50; i++)
      lines.push(this.model.get('name'));
    return {lines: lines};
  }
});
```

```html
<script id="content-item-template" type="text/template">
  <% _.each(lines, function(line) { %>
    <p>content for <%= line %></p>
  <% }); %>
</script>
```

## Loading the App

We'll now create the app with some `routes`, which automatically creates an instance of **Giraffe.Router** at `app.router`. Next we'll attach the app, start `Backbone.history`, and then route to the first menu item.

```js
var app = new App({
  routes: {
    'menu/:name': 'route:menu'
  }
});
app.attachTo('body');
Backbone.history.start();
app.router.cause('route:menu', 'menu item 1');
```

{{{COMMON}}}

:::@ --hide

```css
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
  margin-top: 20px;
  border: 1px solid #bbb;
}
```

## Try It

{{{EXAMPLE style='height: 304px;'}}}


:::END
