:::BEGIN Example


# View Document Events

This example demonstrates __Giraffe__'s document event bindings that link DOM events
to __Giraffe.View__ methods.

```js
var View = Giraffe.View.extend({
  template: '#view-template',
```

__Giraffe.View__ provides a simple, convenient, and performant way to bind DOM
events to view method calls in your markup using the form
`data-gf-eventName='viewMethodName'`. If the method isn't found on the view, it
searches up the hierarchy until it finds the method or fails on a view with no
`parent`. In this template we bind to `'keyup'` and `'click'` events.

```html
<script id="view-template" type="text/template">
  <div id="hello-text">Hello world!</div>
  <input type="text" value="world" data-gf-keyup="onChangeName">
  <button data-gf-click="onAlertHello">Say hello in a popup</button>
</script>
```

<div class='note'>
By default, __Giraffe__ binds only `click` and `change`, and not `keyup` as this
example uses, but you can easily set custom bindings using the class method
`Giraffe.View.setDocumentEvents`.
</div>

Whenever the input changes via a `'keyup'` event, this method is called.

```js
  onChangeName: function(e) {
    $('#hello-text').text('Hello ' + $(e.target).val() + '!');
  },
```

Whenever the button is clicked, this method is called.

```js
  onAlertHello: function() {
    alert($('#hello-text').text());
  }
});
```

If you want to set your own custom DOM event bindings, this is how you'd do it.

```js
Giraffe.View.setDocumentEvents(['mousedown', 'change', 'keyup']); // as an array
Giraffe.View.setDocumentEvents('mousedown change keyup'); // or as a single string
Giraffe.View.setDocumentEvents('click change'); // Giraffe's default events
Giraffe.View.setDocumentEvents('click keyup'); // the events for this example
```

<div class="note">
__Giraffe__ does _not_ provide two-way data binding, but given its goal as a
light and flexible library, it should play nicely with most Backbone plugins.
This feature can be disabled by calling the class method
`Giraffe.View.removeDocumentEvents()`.
</div>

All done! Let's create and attach the view.

```js
var view = new View();
view.attachTo('body');
```

:::< common.md --raw

## Try It

{{{EXAMPLE style='height: 80px;'}}}


:::END
