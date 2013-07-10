var JST = {
  body: function(it) {
    return '<p>Using a ' + it.name + ' strategy</p>';
  },
  header: function(it) { return '<div>Header</div>'; },
  footer: function(it) { return '<div>footer</div>'; },
};


Giraffe.View.setTemplateStrategy(function() {
  var data = this.serialize();
  var template = JST[this.template];
  return template(data);
});

var View = Giraffe.View.extend({
  template: 'body',
  serialize: function() {
    return {name: 'user-defined'};
  }
});

var view = new View();
view.attachTo('body');