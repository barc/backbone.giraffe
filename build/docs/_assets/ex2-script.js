var View = Giraffe.View.extend({

  initialize: function() {
    this.collection = new Backbone.Collection();
  },

  dataEvents: {
    'add remove collection': 'render'
    // 'someOtherEvent someOtherEventsObject': function() { ... }
    // 'anEventTriggeredOnThisView this': 'someMethodName'
  },

  getHTML: function() {
    var html = '<button data-gf-click="onAddModel">add model</button>';
    this.collection.each(function(model) {
      html += '<button data-gf-click="onRemoveModel" data-cid="' + model.cid + '">' +
        'remove model ' + model.get('name') + '</button>';
    });
    return html;
  },

  onAddModel: function(e) {
    this.modelCount = this.modelCount || 0;
    this.modelCount += 1;
    this.collection.add({name: this.modelCount});
  },

  onRemoveModel: function(e) {
    var cid = $(e.target).data('cid');
    this.collection.remove(this.collection.get(cid));
  }
});

var view = new View();
view.attachTo('body');