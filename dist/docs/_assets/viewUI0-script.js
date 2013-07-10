var View = Giraffe.View.extend({
  ui: {
    '$someButton': 'button'
  },
  events: {
    'click $someButton': function() {
      alert('clicked `this.$someButton` which has length ' + this.$someButton.length);
    }
  },
  template: '#view-template'
});

var view = new View();
view.attachTo('body');