{assert} = chai

{
  getEl
  areSiblings
  hasText
  assertNested
  assertNotNested
  assertAttached
  assertNotAttached
  assertDisposed
  assertNotDisposed
  assertSiblings
  assertRendered
  assertNotRendered
  assertHasText
} = ut


describe 'Giraffe.View', ->

  it 'should be OK', ->
    view = new Giraffe.View
    assert.ok view

  it 'should render a view', ->
    a = new Giraffe.View
    a.render()
    assertRendered a

  it 'should attach a view to the DOM', ->
    a = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    assert.ok a.isAttached()
    assertAttached a, $el

  it 'should insert a view and replace the current contents with method "html"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    b.attachTo $el, method: 'html'
    assert.ok !a.isAttached()
    assert.ok b.isAttached()

  it 'should insert a view before another with method "before"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    b.attachTo getEl()
    a.attachTo b, method: 'before'
    assertSiblings a, b

  it 'should insert a view after another with method "after"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    a.attachTo getEl()
    b.attachTo a, method: 'after'
    assertSiblings a, b

  it 'should insert a view at the end of the target\'s children with "append"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    b.attachTo $el, method: 'append'
    assertSiblings a, b

  it 'should insert a view at the beginning of the target\'s children with "prepend"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = getEl()
    b.attachTo $el
    a.attachTo $el, method: 'prepend'
    assertSiblings a, b

  it 'should render a view when attached and call `afterRender`', (done) ->
    a = new Giraffe.View
      afterRender: -> done()
    a.attachTo getEl()
    assertRendered a

  it 'should suppress render on a view when attached', ->
    a = new Giraffe.View
      afterRender: -> assert.fail()
    a.attachTo getEl(), suppressRender: true
    assertNotRendered a

  it 'should render content into a view using the default "underscore-template-selector" strategy', ->
    $el = getEl()
    templateId = 'my-render-test-template'
    className = 'render-test'
    text = 'hello world'
    $el.append """
      <script type='text/template' id='#{templateId}'>
        <div class='#{className}'><%= text %></div>
      </script>
    """
    a = new Giraffe.View {
      template: '#' + templateId
      text
    }
    a.render()
    assertHasText a, text, className

  it 'should render content into a view by overriding `templateStrategy`', ->
    $el = getEl()
    className = 'render-test'
    text = 'hello world'
    a = new Giraffe.View {
      templateStrategy: -> """
        <div class='#{className}'>#{@text}</div>
      """
      text
    }
    a.render()
    assertHasText a, text, className

  it 'should render content into a view using the "jst" strategy', ->
    $el = getEl()
    className = 'render-test'
    text = 'hello world'
    a = new Giraffe.View {
      template: -> """
        <div class='#{className}'>#{@text}</div>
      """
      templateStrategy: 'jst'
      text
    }
    a.render()
    assertHasText a, text, className

  it 'should render content into a view using the "underscore-template" strategy', ->
    $el = getEl()
    className = 'render-test'
    text = 'hello world'
    a = new Giraffe.View {
      template: -> """
        <div class='#{className}'><%= text %></div>
      """
      templateStrategy: 'underscore-template'
      text
    }
    a.render()
    assertHasText a, text, className

  it 'should dispose of a view', ->
    a = new Giraffe.View
    a.dispose()
    assertDisposed a

  it 'should remove the view from the DOM on dispose', ->
    a = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    assertAttached a, $el
    a.dispose()
    assertDisposed a

  it 'should fire the event "disposed" when disposed', (done) ->
    a = new Giraffe.View
    a.on 'disposed', -> done()
    a.dispose()

  it 'should detach a view, removing it from the DOM and disposing of it', ->
    a = new Giraffe.View
    a.attachTo getEl()
    a.detach()
    assert.ok !a.isAttached()
    assertDisposed a

  it 'should detach a view and not dispose it due to passing `true` to `detach`', ->
    a = new Giraffe.View
    a.attachTo getEl()
    a.detach true
    assert.ok !a.isAttached()
    assertNotDisposed a

  it 'should detach a view and not dispose due to passing `disposeOnDetach` to the view', ->
    a = new Giraffe.View(disposeOnDetach: false)
    a.attachTo getEl()
    a.detach()
    assert.ok !a.isAttached()
    assertNotDisposed a

  it 'should dispose the replaced view when using method "html"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = getEl()
    a.attachTo $el
    b.attachTo $el, method: 'html'
    assert.ok !a.isAttached()
    assert.ok b.isAttached()
    assertDisposed a
    assertNotDisposed b

  it 'should nest a view with attach', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    parent.attach child
    assertNested child, parent
    assertAttached child, parent

  it 'should nest a view with attachTo', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    child.attachTo parent
    assertNested child, parent
    assertAttached child, parent

  it 'should propagate dispose to deeply nested views', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View
    greatgrandchild = new Giraffe.View
    parent.attach child
    child.attach grandchild
    grandchild.attach greatgrandchild
    assertNotDisposed parent
    assertNotDisposed child
    assertNotDisposed grandchild
    assertNotDisposed greatgrandchild
    parent.dispose()
    assertDisposed parent
    assertDisposed child
    assertDisposed grandchild
    assertDisposed greatgrandchild

  it 'should dispose the child views when the parent removes them', ->
    parent = new Giraffe.View
    child1 = new Giraffe.View
    child2 = new Giraffe.View(disposeOnDetach: false) # should still be disposed
    parent.attach child1
    parent.attach child2
    parent.removeChildren()
    assertDisposed child1
    assertDisposed child2
    assert.lengthOf parent.children, 0

  it 'should remove children but not dispose them when preserved', ->
    parent = new Giraffe.View
    child1 = new Giraffe.View
    child2 = new Giraffe.View
    parent.attach child1
    parent.attach child2
    parent.removeChildren true
    assertNotDisposed child1
    assertNotDisposed child2
    assert.lengthOf parent.children, 0

  it 'should dispose the child view when the parent renders', (done) ->
    parent = new Giraffe.View
    child = new Giraffe.View
    parent.attach child
    child.on 'disposed', -> done()
    parent.render()
    assertNotNested child, parent
    assertDisposed child

  it 'should not dispose of a cached child view when the parent renders', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View(disposeOnDetach: false)
    parent.attach child
    child.attach grandchild
    child.render()
    assertNested child, parent
    assertNested grandchild, child
    assertAttached child, parent.$el
    assertNotAttached grandchild, child.$el
    assertNotDisposed grandchild

  it 'should not dispose of a child view when the parent renders if `preserve` is `true`', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View
    parent.attach child
    child.attach grandchild
    child.render preserve: true
    assertNested child, parent
    assertNested grandchild, child
    assertAttached child, parent.$el
    assertNotAttached grandchild, child.$el
    assertNotDisposed grandchild

  it 'should add and remove several children as siblings', ->
    parent = new Giraffe.View
    a = new Giraffe.View
    b = new Giraffe.View
    c = new Giraffe.View

    parent.attach a
    parent.attach b
    parent.attach c

    assertNested a, parent
    assertNested b, parent
    assertNested c, parent
    assert.lengthOf parent.children, 3

    c.dispose()
    assertNotNested c, parent
    assertDisposed c
    assert.lengthOf parent.children, 2

    parent.removeChild a
    assertNotNested a, parent
    assertDisposed a
    assert.lengthOf parent.children, 1

    parent.removeChild b, true
    assertNotNested b, parent
    assertNotDisposed b
    assert.lengthOf parent.children, 0

  it 'should dispose of objects added to the view via `addChild`', (done) ->
    collection = new Giraffe.Collection
    view = new Giraffe.View
    view.addChild collection
    collection.on "disposed", -> done()
    view.dispose()

  it 'should invoke a method up the view hierarchy', (done) ->
    parent = new Giraffe.View({done})
    child = new Giraffe.View
    grandchild = new Giraffe.View
    child.attachTo parent
    grandchild.attachTo child
    grandchild.invoke 'done'

  it 'should accept `appEvents` as an option', ->
    ut.assertAppEventsOption Giraffe.View

  it 'should listen for data events', (done) ->
    parent = new Giraffe.View
      view: new Giraffe.View
      dataEvents:
        'done view': -> done()
    parent.view.trigger 'done'