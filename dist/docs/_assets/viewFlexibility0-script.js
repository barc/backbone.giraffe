var ParentApp = Giraffe.App.extend({
  template: '#parent-app-template',

  afterRender: function() {
    this.attach(new ChildView());
  }
});

var ChildView = Giraffe.View.extend({
  className: 'child-view',

  colors: ['#ebb', '#eeb', '#beb', '#bee', '#bbe', '#ebe'],
  colorIndex: -1,

  initialize: function() {
    var proto = ChildView.prototype;
    proto.colorIndex += 1;
    if (proto.colorIndex >= proto.colors.length)
      proto.colorIndex = 0;
    var color = proto.colors[proto.colorIndex];
    this.$el.css('background-color', color);
  },

  template: '#child-template',

  serialize: function() {
    var
      $parentChildren = this.$el.parent().find('> .child-view'),
      index = $parentChildren.index(this.$el);
    return {
      showMoveUpButton: this.parent instanceof ChildView || index !== 0,
      showMoveDownButton: this.parent instanceof ChildView || index !== $parentChildren.length - 1
    };
  },

  onAddChild: function() {
    this.attach(new ChildView(), {el: this.$('.child-views:first')});
  },

  onDispose: function() {
    this.dispose();
  },

  toggleCache: function(e) {
    this.options.disposeOnDetach = !$(e.target).is(':checked');
  },

  afterRender: function() {
    for (var i = 0; i < this.children.length; i++) {
      this.attach(this.children[i], {el: '.child-views:first'});
    }
  },

  beforeRender: function() {
    this.renderCount = this.renderCount || 0;
    this.renderCount += 1;
  },

  onMoveUp: function() {
    var previousView = this.getPreviousView();
    this.attachTo(previousView, {
      method: 'before',
      forceRender: true,
      preserve: true
    });
    previousView.render({preserve: true});
  },

  getPreviousView: function() {
    var $parentChildren = this.$el.parent().find('> .child-view'),
      index = $parentChildren.index(this.$el);
    if (index > 0)
      return Giraffe.View.getClosestView($parentChildren[index - 1]);
    else
      return this.parent;
  },

  onMoveDown: function() {
    var nextView = this.getNextView();
    this.attachTo(nextView, {
      method: 'after',
      forceRender: true,
      preserve: true
    });
    nextView.render({preserve: true});
  },

  getNextView: function() {
    var $parentChildren = this.$el.parent().find('> .child-view'),
      index = $parentChildren.index(this.$el);
    if (index < $parentChildren.length - 1)
      return Giraffe.View.getClosestView($parentChildren[index + 1]);
    else
      return this.parent;
  },

  onAttachUsingHTML: function() {
    this.attachTo(this.$el.parent(), {method: 'html'});
  },

  dispose: function() {
    Giraffe.View.prototype.dispose.call(this);
    console.log('Disposing of ' + this.cid);
  }
});

var app1 = new ParentApp({name: 'app1'});
app1.attachTo('body');

var app2 = new ParentApp({name: 'app2'});
app2.attachTo('body');