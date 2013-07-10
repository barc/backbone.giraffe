var View = Giraffe.View.extend({
  template: '#view-template',

  onChangeName: function(e) {
    $('#hello-text').text('Hello ' + $(e.target).val() + '!');
  },

  onAlertHello: function() {
    alert($('#hello-text').text());
  }
});

Giraffe.View.setDocumentEvents(['mousedown', 'change', 'keyup']); // as an array
Giraffe.View.setDocumentEvents('mousedown change keyup'); // or as a single string
Giraffe.View.setDocumentEvents('click change'); // Giraffe's default events
Giraffe.View.setDocumentEvents('click keyup'); // the events for this example

var view = new View();
view.attachTo('body');