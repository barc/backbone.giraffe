var View = Giraffe.View.extend({

  getHTML: function() {
    var html = '<div id="hello-text">Hello world!</div>';
    html += '<input type="text" value="world" data-gf-keyup="onChangeName">';
    html += '<button data-gf-click="onAlertHello">Say hello in a popup</button>';
    return html;
  },

  onChangeName: function(e) {
    $('#hello-text').text('Hello ' + $(e.target).val() + '!');
  },

  onAlertHello: function() {
    alert($('#hello-text').text());
  }
});

Giraffe.View.setDocumentEvents(['mousedown', 'mouseup', 'change', 'keyup']); // as an array
Giraffe.View.setDocumentEvents('mousedown mouseup change keyup'); // or as a single string
Giraffe.View.setDocumentEvents('click change'); // the default events
Giraffe.View.setDocumentEvents('click keyup'); // the events for this example

var view = new View();
view.attachTo('body');