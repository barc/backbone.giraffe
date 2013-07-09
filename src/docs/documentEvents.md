:::BEGIN Example


## View Document Events

This example demonstrates Giraffe's document event bindings that link DOM events to **Giraffe.View** methods.
Giraffe does *not* provide two-way data binding, but given its goal as a lightweight library, it should play nicely with most Backbone plugins. This feature can be disabled by calling the static method `Giraffe.View.removeDocumentEvents()`.
```js
var View = Giraffe.View.extend({
```

**Giraffe.View** provides a simple, convenient, and performant way to bind DOM events to view method calls in your markup using the form `data-gf-eventName='viewMethodName'`. If the method isn't found on the view, it searches up the hierarchy until it finds the method or fails on a view with no `parent`.

```js
  template: '#view-template',
```

Here's the template:

```html
<script id="view-template" type="text/template">
  <div id="hello-text">Hello world!</div>
  <input type="text" value="world" data-gf-keyup="onChangeName">
  <button data-gf-click="onAlertHello">Say hello in a popup</button>
</script>
```

<div class='note'>
By default, Giraffe binds only `click` and `change`, and not `keyup` as
this example uses, but you can easily set custom bindings using the static
method `Giraffe.View.setDocumentEvents`.
</div>

Whenever the input changes, this method is called.

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

If you wanted to set your own custom DOM event bindings, this is how you'd do it.

```js
Giraffe.View.setDocumentEvents(['mousedown', 'mouseup', 'change', 'keyup']); // as an array
Giraffe.View.setDocumentEvents('mousedown mouseup change keyup'); // or as a single string
Giraffe.View.setDocumentEvents('click change'); // the default events
Giraffe.View.setDocumentEvents('click keyup'); // the events for this example
```

All done! Let's create and attach the view.

```js
var view = new View();
view.attachTo('body');
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
strong {
  font-weight: bold;
}
```

## Try It

{{{EXAMPLE style='height: 80px;'}}}

:::END
