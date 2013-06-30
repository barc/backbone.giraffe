var View = Giraffe.View.extend({

  events: {
    'click $someButton': function() {
      alert('clicked `this.$someButton` which has a length of ' + this.$someButton.length);
    }
  },

  ui: {
    '$someButton': 'button'
  },

  getHTML: function() {
    return '<button>click me</button>';
  }
});

var view = new View();
view.attachTo('body');