{assert} = chai
{ut} = window


describe 'Giraffe.View', ->

  it 'should be OK', ->
    view = new Giraffe.View
    assert.ok view

  it 'should render a view', ->
    a = new Giraffe.View
    a.render()
    ut.assert.rendered a

  it 'should attach a view to the DOM', ->
    a = new Giraffe.View
    $el = ut.getEl()
    a.attachTo $el
    assert.ok a.isAttached()
    ut.assert.attached a, $el

  it 'should insert a view and replace the current contents with method "html"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = ut.getEl()
    a.attachTo $el
    b.attachTo $el, method: 'html'
    assert.ok !a.isAttached()
    assert.ok b.isAttached()

  it 'should insert a view before another with method "before"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    b.attachTo ut.getEl()
    a.attachTo b, method: 'before'
    ut.assert.siblings a, b

  it 'should insert a view after another with method "after"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    a.attachTo ut.getEl()
    b.attachTo a, method: 'after'
    ut.assert.siblings a, b

  it 'should insert a view at the end of the target\'s children with "append"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = ut.getEl()
    a.attachTo $el
    b.attachTo $el, method: 'append'
    ut.assert.siblings a, b

  it 'should insert a view at the beginning of the target\'s children with "prepend"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = ut.getEl()
    b.attachTo $el
    a.attachTo $el, method: 'prepend'
    ut.assert.siblings a, b

  it 'should render a view when attached and call `afterRender`', (done) ->
    a = new Giraffe.View
      afterRender: -> done()
    a.attachTo ut.getEl()
    ut.assert.rendered a

  it 'should suppress render on a view when attached', ->
    a = new Giraffe.View
      afterRender: -> assert.fail()
    a.attachTo ut.getEl(), suppressRender: true
    ut.assert.notRendered a

  it 'should render content into a view using the default "underscore-template-selector" strategy', ->
    $el = ut.getEl()
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
    ut.assert.hasText a, text, className

  it 'should render content into a view by overriding `templateStrategy`', ->
    $el = ut.getEl()
    className = 'render-test'
    text = 'hello world'
    a = new Giraffe.View {
      templateStrategy: -> """
        <div class='#{className}'>#{@text}</div>
      """
      text
    }
    a.render()
    ut.assert.hasText a, text, className

  it 'should render content into a view using the "jst" strategy', ->
    $el = ut.getEl()
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
    ut.assert.hasText a, text, className

  it 'should render content into a view using the "underscore-template" strategy', ->
    $el = ut.getEl()
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
    ut.assert.hasText a, text, className

  it 'should dispose of a view', ->
    a = new Giraffe.View
    a.dispose()
    ut.assert.disposed a

  it 'should remove the view from the DOM on dispose', ->
    a = new Giraffe.View
    $el = ut.getEl()
    a.attachTo $el
    ut.assert.attached a, $el
    a.dispose()
    ut.assert.disposed a

  it 'should fire the event "disposed" when disposed', (done) ->
    a = new Giraffe.View
    a.on 'disposed', -> done()
    a.dispose()

  it 'should detach a view, removing it from the DOM and disposing of it', ->
    a = new Giraffe.View
    a.attachTo ut.getEl()
    a.detach()
    assert.ok !a.isAttached()
    ut.assert.disposed a

  it 'should detach a view and not dispose it due to passing `true` to `detach`', ->
    a = new Giraffe.View
    a.attachTo ut.getEl()
    a.detach true
    assert.ok !a.isAttached()
    ut.assert.notDisposed a

  it 'should detach a view and not dispose due to passing `disposeOnDetach` to the view', ->
    a = new Giraffe.View(disposeOnDetach: false)
    a.attachTo ut.getEl()
    a.detach()
    assert.ok !a.isAttached()
    ut.assert.notDisposed a

  it 'should dispose the replaced view when using method "html"', ->
    a = new Giraffe.View
    b = new Giraffe.View
    $el = ut.getEl()
    a.attachTo $el
    b.attachTo $el, method: 'html'
    assert.ok !a.isAttached()
    assert.ok b.isAttached()
    ut.assert.disposed a
    ut.assert.notDisposed b

  it 'should nest a view with attach', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    parent.attach child
    ut.assert.nested child, parent
    ut.assert.attached child, parent

  it 'should nest a view with attachTo', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    child.attachTo parent
    ut.assert.nested child, parent
    ut.assert.attached child, parent

  it 'should propagate dispose to deeply nested views', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View
    greatgrandchild = new Giraffe.View
    parent.attach child
    child.attach grandchild
    grandchild.attach greatgrandchild
    ut.assert.notDisposed parent
    ut.assert.notDisposed child
    ut.assert.notDisposed grandchild
    ut.assert.notDisposed greatgrandchild
    parent.dispose()
    ut.assert.disposed parent
    ut.assert.disposed child
    ut.assert.disposed grandchild
    ut.assert.disposed greatgrandchild

  it 'should dispose the child views when the parent removes them', ->
    parent = new Giraffe.View
    child1 = new Giraffe.View
    child2 = new Giraffe.View(disposeOnDetach: false) # should still be disposed
    parent.attach child1
    parent.attach child2
    parent.removeChildren()
    ut.assert.disposed child1
    ut.assert.disposed child2
    assert.lengthOf parent.children, 0

  it 'should remove children but not dispose them when preserved', ->
    parent = new Giraffe.View
    child1 = new Giraffe.View
    child2 = new Giraffe.View
    parent.attach child1
    parent.attach child2
    parent.removeChildren true
    ut.assert.notDisposed child1
    ut.assert.notDisposed child2
    assert.lengthOf parent.children, 0

  it 'should dispose the child view when the parent renders', (done) ->
    parent = new Giraffe.View
    child = new Giraffe.View
    parent.attach child
    child.on 'disposed', -> done()
    parent.render()
    ut.assert.notNested child, parent
    ut.assert.disposed child

  it 'should not dispose of a cached child view when the parent renders', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View(disposeOnDetach: false)
    parent.attach child
    child.attach grandchild
    child.render()
    ut.assert.nested child, parent
    ut.assert.nested grandchild, child
    ut.assert.attached child, parent.$el
    ut.assert.notAttached grandchild, child.$el
    ut.assert.notDisposed grandchild

  it 'should not dispose of a child view when the parent renders if `preserve` is `true`', ->
    parent = new Giraffe.View
    child = new Giraffe.View
    grandchild = new Giraffe.View
    parent.attach child
    child.attach grandchild
    child.render preserve: true
    ut.assert.nested child, parent
    ut.assert.nested grandchild, child
    ut.assert.attached child, parent.$el
    ut.assert.notAttached grandchild, child.$el
    ut.assert.notDisposed grandchild

  it 'should add and remove several children as siblings', ->
    parent = new Giraffe.View
    a = new Giraffe.View
    b = new Giraffe.View
    c = new Giraffe.View

    parent.attach a
    parent.attach b
    parent.attach c

    ut.assert.nested a, parent
    ut.assert.nested b, parent
    ut.assert.nested c, parent
    assert.lengthOf parent.children, 3

    c.dispose()
    ut.assert.notNested c, parent
    ut.assert.disposed c
    assert.lengthOf parent.children, 2

    parent.removeChild a
    ut.assert.notNested a, parent
    ut.assert.disposed a
    assert.lengthOf parent.children, 1

    parent.removeChild b, true
    ut.assert.notNested b, parent
    ut.assert.notDisposed b
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
    ut.assert.appEventsOption Giraffe.View

  describe 'view document events', ->

    it 'should listen for document events', (done) ->
      a = new Giraffe.View
        templateStrategy: -> """
          <div data-gf-click='onClick'></div>
        """
        onClick: -> done()
      a.attachTo ut.getEl()
      a.$('div').click()

    it 'should remove document events', ->
      Giraffe.View.removeDocumentEvents()
      a = new Giraffe.View
        templateStrategy: -> """
          <div data-gf-click='onClick'></div>
        """
        onClick: -> fail()
      a.attachTo ut.getEl()
      a.$('div').click()

    it 'should set custom document events', (done) ->
      Giraffe.View.setDocumentEvents ['wat']
      a = new Giraffe.View
        templateStrategy: -> """
          <div data-gf-wat='onWat'></div>
        """
        onWat: -> done()
      a.attachTo ut.getEl()
      a.$('div').trigger('wat')

    it 'should set a custom document event prefix', (done) ->
      Giraffe.View.setDocumentEvents 'click'
      Giraffe.View.setDocumentEventPrefix 'test-on-'
      a = new Giraffe.View
        templateStrategy: -> """
          <div test-on-click='onClick'></div>
        """
        onClick: -> done()
      a.attachTo ut.getEl()
      a.$('div').click()

    it 'should use the custom prefix from the function parameter to `setDocumentEvents`', (done) ->
      Giraffe.View.setDocumentEvents 'click', 'test-on-'
      a = new Giraffe.View
        templateStrategy: -> """
          <div test-on-click='onClick'></div>
        """
        onClick: -> done()
      a.attachTo ut.getEl()
      a.$('div').click()

    it 'should allow a blank document events prefix', (done) ->
      Giraffe.View.setDocumentEvents 'click'
      Giraffe.View.setDocumentEventPrefix ''
      a = new Giraffe.View
        templateStrategy: -> """
          <div click='onClick'></div>
        """
        onClick: -> done()
      a.attachTo ut.getEl()
      a.$('div').click()

  describe 'declarative view composition', ->

    it 'should instantiate a view from a template', ->
      MyView = Giraffe.View.extend
        templateStrategy: -> 'foo'
      parentView = new Giraffe.View
        templateStrategy: -> '<div data-view-class="MyView"></div>'
        viewClasses:
          MyView: ->
            new MyView
          MyOtherView: -> # provider needs to be a function because we may want params or a cached view
            new MyView(other: 'options')
          MyCachedView: ->
            @myCachedView ?= new MyView(disposeOnDetach: false)
      parentView.viewClasses.MyView = -> # easy reflect on and mutate `viewClasses`
        @myView ?= new MyView(disposeOnDetach: false) # called in context of `a`
      parentView.render()
      assert.lengthOf 1, parentView.children
      assert.ok parentView.children[0] instanceof MyView
      assert.equal 'foo', parentView.$el.text()

      ###
        pros
          - gives the programmer control over provided classes at runtime via the mutable `viewClasses` hash
        cons
          - is a little more verbose
          - requires more Giraffe code
      ###

    it 'should instantiate a view from a template', ->
      a = new Giraffe.View
        templateStrategy: -> '<div data-view-class="getViewMyView"></div>' # calls the function getViewMyView and puts the result in this div inside `a` after `a` renders
        getViewMyView: ->
          new MyView
        getViewMyOtherView: -> # provider needs to be a function because we may want params or a cached view
          new MyView(other: 'options')
        getViewMyCachedView: ->
          @myCachedView ?= new MyView(disposeOnDetach: false)
      MyView = Giraffe.View.extend
        templateStrategy: -> 'foo'
      parentView.render()
      assert.lengthOf 1, parentView.children
      assert.ok parentView.children[0] instanceof MyView
      assert.equal 'foo', parentView.$el.text()

      ###
        pros
          - simple and straightforward
          - reuses existing `Giraffe.view#invoke` pattern, same as the similar-looking document events feature
        cons
          - no automated way to reflect on provided functions (how often will this be needed? and how hard is it to replicate for the programmer? doesn't seem like much work)
      ###