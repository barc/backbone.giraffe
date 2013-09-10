var View = Giraffe.View.extend({

  initialize: function() {
    this.collection = new Giraffe.Collection();
  },

  dataEvents: {
    'add remove collection': 'render'
    // 'someEvent anotherEvent someBackboneEventsObject': function() { ... }
    // 'anEventTriggeredOnThisView this': 'someMethodName' // listen to self
    // 'sameEventAsAbove @': 'sameMethodAsAbove'
  },

  template: '#view-template',

  onAddModel: function(e) {
    this.collection.add({});
  },

  onRemoveModel: function(e) {
    var cid = $(e.target).data('cid');
    this.collection.remove(cid);
  }
});

var view = new View();
view.attachTo('body');