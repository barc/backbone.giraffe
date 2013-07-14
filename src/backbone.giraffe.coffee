#===============================================================================
# Copyright (c) 2013 Barc Inc.
#
# Barc Permissive License
#===============================================================================


# TODO
# route namespaces
# more events like disposing and disposed? rendering/rendered, attaching/attached - replace before/afterRender?
# view transitions
# collectionView?
# modelView?


if global?
  Backbone = require('backbone')
  $ = require('jQuery')
else
  Backbone = window.Backbone
  $ = Backbone.$


Backbone.Giraffe = Giraffe =
  app: null # stores the most recently created instance of App, so for simple cases with 1 app Giraffe objects don't need an app reference
  apps: {} # cache for all app views by `options.name`, defaulting to `cid`
  views: {} # cache for all views by `cid`
window?.Giraffe = Giraffe


# A helper function for more helpful error messages.
error = ->
  console?.error?.apply console, ['Backbone.Giraffe error:'].concat(arguments...)


###
* **Giraffe.View** is optimized for simplicity and flexibility. Views can move
* around the DOM safely and freely with the `attachTo` method, which accepts any
* selector, DOM element, or view, as well as an optional jQuery insertion method
* like `'prepend'`, `'after'`, or `'html'`. The default is `'append'`.
*
*     var parentView = new Giraffe.View();
*     parentView.attachTo('body', {method: 'prepend'});
*     parentView.$el.parent(); // => $('body')
*
* The `attachTo` method automatically sets up parent-child relationships between
* views via the references `children` and `parent` to allow nesting with no
* extra work.
*
*     var childView = new Giraffe.View();
*     childView.attachTo(parentView); // or parentView.attach(childView);
*     childView.parent === parentView; // => true
*     parentView.children[0] === childView; // => true
*
* Views automatically manage the lifecycle of all `children`, and any object
* with a `dispose` method can be added to `children` via `addChild`.
* When a view is disposed, it disposes of all of its `children`, allowing the
* disposal of an entire application with a single method call.
*
*     parentView.dispose(); // disposes both `parentView` and `childView`
*
* When a view renders, it first calls `detach` on all of its `children`, and when a view is detached, the default behavior is call `dispose` on it. To overried this behavior and cache a view even when its `parent` renders, you can set the cached view's `options.disposeOnDetach` to `false`.
*
* **Giraffe.View** gets much of its smarts by way of the `data-view-cid` attribute attached to `view.$el`. This attribute allows us to find a view's parent when attached to a DOM element and safely detach views when they would otherwise be clobbered. Currently, Giraffe has only one class that extends **Giraffe.View**, **Giraffe.App**, which encapsulates app-wide messenging and routing.
*
* @param {Object} [options]
###
class Giraffe.View extends Backbone.View


  @defaultOptions:
    disposeOnDetach: true     # If true, disposes of the view when detached from the DOM.
    alwaysRender: false       # If true, always renders on attach unless suppressRender is passed as an option.
    saveScrollPosition: false # If true or a selector, saves the scroll position of `@$el` or `@$(selector)`, respectively, when detached to be automatically applied when reattached. Object selectors aren't scoped to the view, so `window` and `$('body')` are valid values.
    documentTitle: null       # When the view is attached, the document.title will be set to this.
    templateStrategy: null    # View-specific strategy, use `Giraffe.View.setTemplateStrategy` to set globally


  constructor: (options = {}) ->
    _.defaults options, Giraffe.View.defaultOptions

    @app or= options.app or Giraffe.app

    ###
    * Similar to the `events` hash of **Backbone.View**, the `appEvents` hash maps events on `this.app` to methods on the view. App events can be triggered from routes or by any object in your application. If a **Giraffe.App** has been created, every view has a reference to the global **Giraffe.app** instance at `this.app`, and a specific app instance can be set by passing `options.app` to the view. The instance of `this.app` is used to bind `appEvents`, and these bindings are automatically cleaned up when a view is disposed. See **Giraffe.App** and **Giraffe.Router** for more.
    ###
    Giraffe.bindEventMap @, @app, @appEvents

    ###
    * When one view is attached to another, the child view is added to the parent's `children` array. When a view renders, it first calls `detach` on its `children`. By default, `dispose` is called on a view when it is detached if `options.disposeOnDetach` is `true`, which is the default setting. After a view renders, any child views with `options.disposeOnDetach` set to `false` will be in `children`, ready to be attached. When `dispose` is called on a view, it disposes of all of its `children`. Any object with a `dispose` method can be added to a view's `children` via `addChild` to take advantage of lifecycle management.
    ###
    @children = []

    ###
    * Child views have a reference to their parent view.
    ###
    @parent = null

    @_renderedOnce = false
    @_isAttached = false

    @_createEventsFromUIElements()

    @_wrapInitialize()

    if options.templateStrategy
      Giraffe.View.setTemplateStrategy options.templateStrategy, @
    else if typeof @templateStrategy is 'string'
      Giraffe.View.setTemplateStrategy @templateStrategy, @

    # Creates and initializes the view.
    super options


  # Pre-initialization to set `data-view-cid` is necessary to allow views to be attached in `initialize`.
  _wrapInitialize: ->
    @initialize = _.wrap @initialize, (initialize) =>
      # Add the view to the global cache now that the view has a cid.
      @_cache()

      # Set the data-view-cid attribute to link dom els to their view objects.
      @$el.attr 'data-view-cid', @cid

      # Initialize the view
      initialize.apply @, Array.prototype.slice.call(arguments, 1)

      # Bind data events after initialize is called, so objects can be created during initialize to be bound to
      @_bindDataEvents()


  _attachMethods: ['append', 'prepend', 'html', 'after', 'before', 'insertAfter', 'insertBefore']
  _siblingAttachMethods: ['after', 'before', 'insertAfter', 'insertBefore']


  ###
  * Attaches this view to `el`, which can be a selector, DOM element, or view. If `el` has a parent view, a parent-child relationship is set up. If the view has not yet been rendered when attached, `render` is called. This render behavior can be overridden through the options `forceRender` and `suppressRender`. Before a view renders, it calls `detach` on all of its `children`, and when a view is detached, it is also disposed, unless `options.disposeOnDetach` is set to false.
  *
  * @param {String/Element/jQuery/View} el A view, selector, or DOM element to attach `view.$el` to.
  * @param {Object} [options]
  *     {String} method The jQuery method used to put this view in `el`. Accepts `'append'`, `'prepend'`, `'html'`, `'after'`, and `'before'`. Defaults to `'append'`.
  *     {Boolean} forceRender Calls `render` when attached, even if the view has already been rendered.
  *     {Boolean} suppressRender Prevents `render` when attached, even if the view hasn't yet been rendered.
  ###
  attachTo: (el, options) ->
    method = options?.method or 'append'
    forceRender = options?.forceRender or false
    suppressRender = options?.suppressRender or false

    if !@$el
      error 'Trying to attach a disposed view. Make a new one or create the view with the option `disposeOnDetach` set to false.', @
      return @

    if !_.contains(@_attachMethods, method)
      error "The attach method '#{method}' isn't supported. Defaulting to 'append'.", method, @_attachMethods
      method = 'append'

    $el = Giraffe.View.to$El(el)

    if !$el
      error 'No such `el` to attach to', el
      return @

    # $el and $container differ for jQuery methods that operate on siblings
    $container = if _.contains(@_siblingAttachMethods, method) then $el.parent() else $el

    # The methods 'insertAfter' and 'insertBefore' become 'after' and 'before' because we always call $el[method] @$el
    method = 'after' if method is 'insertAfter'
    method = 'before' if method is 'insertBefore'

    # Make sure we're attaching to a single element
    if $el.length isnt 1
      error('Expected to render to a single element but found ' + $el.length, el)
      return @

    # Detach the view so it can move around freely, preserving it so it's not disposed.
    @detach true

    # Set the new parent.
    @setParent Giraffe.View.getClosestView($container)

    # If the method is destructive, detach any children of the parent to prevent event clobbering.
    if method is 'html'
      Giraffe.View.detachByEl $el
      $el.empty()

    # Attach the view to the el.
    $el[method] @$el
    @_isAttached = true

    # Render as necessary.
    shouldRender = !suppressRender and (!@_renderedOnce or forceRender or @options.alwaysRender)
    if shouldRender
      @render options

    @_loadScrollPosition() if @options.saveScrollPosition
    document.title = @options.documentTitle if @options.documentTitle?
    @


  ###
  * `attach` is an inverted way to call `attachTo`. Unlike `attachTo`, calling this function requires a parent view. It's here only for aesthetics.
  * @param {View} view
  * @param {Object} [options]
  ###
  attach: (view, options) ->
    if options?.el
      childEl = @$el.find(options.el)
      if childEl.length
        view.attachTo childEl, options
      else if @$el.is(options.el)
        view.attachTo @$el, options
      else
        error 'Attempting to attach to an element that doesn\'t exist inside this view!', options, view, @
    else
      view.attachTo @$el, options
    @


  ###
  * This is an empty function for you to implement. Used in fewer situations than `afterRender`, but helpful in circumstances where the DOM has state that need to be preserved across renders. For example, if a view with a dropdown menu is rendering, you may want to save its open state in `beforeRender` and reapply it in `afterRender`.
  * @caption Implement this function in your views.
  ###
  beforeRender: ->


  ###
  * Giraffe implements `render` so it can do some helpful things, but you can still call it like you normally would. By default, `render` uses a view's `template`, which is the DOM selector of an **Underscore** template, but this is easily configured. See `template`, `Giraffe.View.setTemplateStrategy`, and `templateStrategy` for more.
  * @caption Do not override unless you know what you're doing!
  ###
  render: (options) =>
    @beforeRender.apply @, arguments
    @_renderedOnce = true
    @detachChildren options?.preserve
    @$el.empty().html @templateStrategy() or ''
    @_cacheUiElements()
    @afterRender.apply @, arguments
    @


  ###
  * This is an empty function for you to implement. After a view renders, `afterRender` is called. Child views are normally attached to the DOM here. Views that are cached by setting `options.disposeOnDetach` to true will be in `view.children` in `afterRender`, but will not be attached to the parent's `$el`.
  * @caption Implement this function in your views.
  ###
  afterRender: ->


  ###
  * Giraffe implements its own `render` function which calls `templateStrategy` to get the HTML string to put inside `view.$el`. Your views can either define a `template`, which uses **Underscore** templates by default and is customizable via `Giraffe.View.setTemplateStrategy`, or override `templateStrategy` with a function returning a string of HTML from your favorite templating engine.
  ###
  templateStrategy: -> ''


  ###
  * Consumed by the `templateStrategy` function created by `Giraffe.View.setTemplateStrategy`. By default, `template` is the DOM selector of an **Underscore** template.
  ###
  template: null


  ###
  * Gets the data passed to the `template`. Returns the view by default.
  * @caption Override this function to pass custom data to a view's `template`.
  ###
  serialize: -> @


  ###
  * Detaches the view from the DOM. If `options.disposeOnDetach` is true, which is the default, `dispose` will be called on the view and its `children` unless `preserve` is true. `preserve` defaults to false.
  *
  * @param {Boolean} [preserve] If true, doesn't dispose of the view, even if `disposeOnDetach` is `true`.
  ###
  detach: (preserve = false) ->
    return @ unless @_isAttached
    @_isAttached = false

    @_saveScrollPosition() if @options.saveScrollPosition

    # Deatch the view from the DOM to preserve its events.
    @$el.detach()

    # Disposes the view unless the view's options or function caller preserve it.
    if @options.disposeOnDetach and !preserve
      @dispose()
    @


  ###
  * Calls `detach` on each object in `children`, passing the `preserve` parameter through.
  *
  * @param {Boolean} [preserve]
  ###
  detachChildren: (preserve = false) ->
    child.detach? preserve for child in @children.slice() # slice because @children may be modified
    @


  _saveScrollPosition: ->
    @_scrollPosition = @_getScrollPositionEl().scrollTop()


  _loadScrollPosition: ->
    if @_scrollPosition?
      @_getScrollPositionEl().scrollTop @_scrollPosition


  _getScrollPositionEl: ->
    switch typeof @options.saveScrollPosition
      when 'string'
        @$(@options.saveScrollPosition).first()
      when 'object'
        $(@options.saveScrollPosition)
      else
        @$el


  ###
  * Adds `child` to this view's `children` and assigns this view as `child.parent`. If `child` implements `dispose`, it will be called when the view is disposed. If `child` implements `detach`, it will be called before the view renders.
  *
  * @param {Object} child
  ###
  addChild: (child) ->
    if !_.contains(@children, child)
      child.parent?.removeChild child, true
      child.parent = @
      @children.push child
    @


  ###
  * Calls `addChild` on the given array of objects.
  *
  * @param {Array} children Array of objects
  ###
  addChildren: (children) ->
    @addChild child for child in children
    @


  ###
  * Removes an object from this view's `children`. If `preserve` is `false`, the default, Giraffe will attempt to call `dispose` on the child. If `preserve` is true, Giraffe will attempt to call `detach` on the child.
  *
  * @param {Object} child
  * @param {Boolean} [preserve] If `true`, Giraffe attempts to call `detach` on the child, otherwise it attempts to call `dispose` on the child. Is `false` by default.
  ###
  removeChild: (child, preserve = false) ->
    index = _.indexOf(@children, child)
    if index > -1
      @children.splice index, 1
      child.parent = null
      if preserve
        child.detach? true
      else
        child.dispose?()
    @


  ###
  * Calls `removeChild` on all `children`, passing `preserve` through.
  *
  * @param {Boolean} [preserve] If `true`, detaches rather than removes the children.
  ###
  removeChildren: (preserve = false) ->
    @removeChild child, preserve for child in @children.slice() # slice because @children is modified
    @


  ###
  * Sets a new parent for a view. `parent` can be `null` or `undefined` to remove the current parent.
  *
  * @param {Giraffe.View} [parent]
  ###
  setParent: (parent) ->
    if parent
      parent.addChild @
    else if @parent
      @parent.removeChild @, true
      @parent = null
    @


  ###
  * If `el` is `null` or `undefined`, tests if the view is somewhere on the DOM by calling `$(document).find(this.$el)`. If `el` is defined, tests if `el` is the immediate parent of the view.
  *
  * @param {String} [el] Optional selector, DOM element, or view to test against the view's immediate parent.
  * @returns {Boolean}
  ###
  isAttached: (el) ->
    if el
      if el.$el
        @parent is el
      else
        @$el.parent().is(el)
    else
      $(document).find(@$el).length > 0


  ###
  * The optional `ui` object maps names to selectors, e.g. `{$someName: '#some-selector'}`. If a view defines `ui`, the jQuery objects it names will be cached and updated every `render`. For example, declaring `this.ui = {$button: '#button'}` in a view makes `this.$button` always available once `render` has been called.
  ###
  ui: null


  # Caches jQuery objects to the view, reading the map @ui {name: selector}, made available as @name.
  _cacheUiElements: ->
    if @ui
      for name, selector of @ui
        @[name] = @$(selector)
    @


  # Removes references to the elements cached from the @ui {name: selector} map..
  _uncacheUiElements: ->
    return @ unless @ui
    for name, selector of @ui
      delete @[name]
    @


  # Inserts the `ui` names into `events`.
  _createEventsFromUIElements: ->
    return @ unless @events and @ui
    @ui = @ui() if typeof @ui is 'function'
    @events = @events() if typeof @events is 'function'
    for eventKey, method of @events
      newEventKey = @_getEventKeyFromUIElements(eventKey)
      if newEventKey isnt eventKey
        delete @events[eventKey]
        @events[newEventKey] = method
    @


  # Creates an `events` key that replaces any `ui` names with their selectors.
  _getEventKeyFromUIElements: (eventKey) ->
    parts = eventKey.split(' ')
    length = parts.length
    return eventKey if length < 2
    lastPart = parts[length - 1]
    uiTarget = @ui[lastPart]
    if uiTarget
      parts[length - 1] = uiTarget
      parts.join ' '
    else
      eventKey


  # Binds the `dataEvents` hash that allows any arbitrary instance property of the view to be bound to easily.
  # Expects the form {'event targetObj': 'handler'}
  _bindDataEvents: ->
    return @ unless @dataEvents
    @dataEvents = @dataEvents() if typeof @dataEvents is 'function'
    for eventKey, cb of @dataEvents
      pieces = eventKey.split(' ')
      if pieces.length < 2
        error 'Data event must specify target object, ex: {\'change collection\': \'handler\'}'
        continue
      targetObj = pieces.pop()
      targetObj = if targetObj is 'this' or targetObj is '@' then @ else @[targetObj] # allow listening to self
      if !targetObj
        error "Unknown taget object #{targetObj} for data event", eventKey
        continue
      eventName = pieces.join(' ')
      Giraffe.bindEvent @, targetObj, eventName, cb
    @


  # Removes the view from the global cache.
  _uncache: ->
    delete Giraffe.views[@cid]
    @


  # Stores the view in the global cache.
  _cache: ->
    Giraffe.views[@cid] = @
    @


  ###
  * Calls `method` on the view via `this[method].apply(this, args)`, or if not found, up the view hierarchy until it finds the method or fails on a view without a parent. Used by Giraffe to call the methods defined for the events bound in `setDocumentEvents`.
  *
  * @param {String} method
  * @param {Any} [args...]
  ###
  invoke: (method, args...) ->
    view = @
    while view and !view[method]
      view = view.parent
    if view?[method]
      view[method].apply view, args
    else
      error 'No such method in view hierarchy', method, args, @
      true


  ###
  * Define `appEvents` on any Giraffe object to listen to events on `this.app`, which is either the option passed in `{app: myApp}` or the first instance of **Giraffe.App** created on the page, which is globally assigned to `Giraffe.app`. Any object with a reference to an app can `trigger` arbitrary `appEvents`, and any object with a reference to a router can `cause` an app event and navigate to its corresponding route.
  ###
  appEvents: null


  ###
  * Destroys a view, unbinding its events and freeing its resources. Calls the `remove` method defined by **Backbone.View** and calls `dispose` on all `children`.
  ###
  dispose: ->
    Giraffe.dispose @, ->
      @setParent null
      @removeChildren()
      @_uncacheUiElements()
      @_uncache()
      if @$el
        @remove()
        @$el = null
      else
        error "Disposed of a view that has already been disposed", @


  ###
  * Detaches the top-level views inside `el`, which can be a selector, element, jQuery object, or **Giraffe.View**. Used internally by Giraffe to remove views that would otherwise be clobbered when the `method` option `'html'` is used to attach a view. Uses the `data-view-cid` attribute to match DOM nodes to view instances.
  *
  * @param {Element/jQuery/Giraffe.View} el
  * @param {Boolean} [preserve]
  ###
  @detachByEl: (el, preserve = false) ->
    $el = Giraffe.View.to$El(el)
    while ($child = $el.find('[data-view-cid]:first')).length
      cid = $child.attr('data-view-cid')
      view = Giraffe.View.getByCid(cid)
      view.detach preserve
    @


  ###
  * Gets the closest parent view of `el`, which can be a selector, element, jQuery object, or **Giraffe.View**. Uses the `data-view-cid` attribute to match DOM nodes to view instances.
  *
  * @param {Element/jQuery/Giraffe.View} el
  ###
  @getClosestView: (el) ->
    $el = Giraffe.View.to$El(el)
    cid = $el.closest('[data-view-cid]').attr('data-view-cid')
    Giraffe.View.getByCid cid


  ###
  * Looks up a view from the cache by `cid`, returning undefined if not found.
  *
  * @param {String} cid
  ###
  @getByCid: (cid) ->
    Giraffe.views[cid]


  # Gets a jQuery object from a selector, element, jQuery object, or Giraffe.View.
  @to$El: (el) ->
    el?.$el or if el instanceof $ then el else $(el)


  ###
  * Giraffe provides a convenient high-performance way to declare view method calls in your HTML markup. Using the form `data-gf-eventName='methodName'`, when a bound DOM event is triggered, Giraffe looks for the defined method on the element's view. For example, putting `data-gf-click='submitForm'` on a button calls the method `submitForm` on its view on `'click'`. If the view does not define the method, Giraffe searches up the view hierarchy until it finds it or runs out of views. By default, only the `click` and `change` events are bound by Giraffe, but `setDocumentEvents` allows you to set a custom list of events, first unbinding the existing ones and then setting the ones you give it, if any.
  *
  *     Giraffe.View.setDocumentEvents(['click', 'change', 'keydown']);
  *
  *     Giraffe.View.setDocumentEvents('click change keydown keyup');
  *
  * @param {Array/String} events An array or space-separated string of DOM events to bind to the document.
  ###
  @setDocumentEvents: (events) ->
    if typeof events is 'string'
      events = events.split(' ')
    if !_.isArray(events)
      events = [events]
    events = _.compact(events)

    Giraffe.View.removeDocumentEvents()
    Giraffe.View._currentDocumentEvents = events

    for event in events
      do (event) ->
        $(document).on event, "[data-gf-#{event}]", (e) ->
          $target = $(e.target).closest("[data-gf-#{event}]")
          method = $target.attr("data-gf-#{event}")
          view = Giraffe.View.getClosestView($target)
          view.invoke method, e


  ###
  * Using the form `data-gf-event`, DOM elements can be configured to call view methods on DOM events. By default, Giraffe only binds the most common events to keep things lean. To configure your own set of events, use Giraffe.View.setDocumentEvents to reset the bindings to the events of your choosing. For example, if you want only the click and mousedown events, call Giraffe.View.setDocumentEvents(['click', 'mousedown']). If you wish to remove Giraffe's document event features completely, call `removeDocumentEvents`. It is not necessary to call this method before setting new ones. Setting document events removes the current ones.
  ###
  @removeDocumentEvents: ->
    return unless Giraffe.View._currentDocumentEvents?.length
    for event in Giraffe.View._currentDocumentEvents
      $(document).off event, "[data-gf-#{event}]"
    Giraffe.View._currentDocumentEvents = null


  ###
  * Giraffe provides common strategies for templating.
  *
  * The `strategy` argument can be a function returning an HTML string or one of the following:
  *
  * - `'underscore-template-selector'`
  *
  *     - `view.template` is a string or function returning DOM selector
  *
  * - `'underscore-template'`
  *
  *     - `view.template` is a string or function returning underscore template
  *
  * - `'jst'`
  *
  *     - `view.template` is an html string or a JST function
  *
  * @param {String} strategy Choose 'underscore-template-selector', 'underscore-template', 'jst'
  *
  ###
  @setTemplateStrategy: (strategy, instance) ->

    strategyType = typeof strategy
    if strategyType is 'function'
      templateStrategy = strategy
    else if strategyType isnt 'string'
      return error('Unrecognized template strategy', strategy)
    else
      switch strategy.toLowerCase()

        # @template is a string DOM selector or a function returning DOM selector
        when 'underscore-template-selector'
          templateStrategy = ->
            return '' unless @template
            if !@_templateFn
              switch typeof @template
                when 'string'
                  selector = @template
                  @_templateFn = _.template($(selector).html() or '')
                when 'function'
                  # user likely made it a function because it depends on
                  # run time info, ensure it is called EACH time
                  @_templateFn = (locals) =>
                    selector = @template()
                    _.template $(selector).html() or '', locals
                else
                  throw new Error('this.template must be string or function')

            @_templateFn @serialize.apply(@, arguments)

        # @template is a string or a function returning a string template
        when 'underscore-template'
          templateStrategy = ->
            return '' unless @template
            if !@_templateFn
              switch typeof @template
                when 'string'
                  @_templateFn = _.template(@template)
                when 'function'
                  @_templateFn = (locals) =>
                    _.template @template(), locals
                else
                  throw new Error('this.template must be string or function')
            @_templateFn @serialize.apply(@, arguments)

        # @template is the markup or a JST function
        when 'jst'
          templateStrategy = ->
            return '' unless @template
            if !@_templateFn
              switch typeof @template
                when 'string'
                  html = @template
                  @_templateFn = -> html
                when 'function'
                  @_templateFn = @template
                else
                  throw new Error('this.template must be string or function')
            @_templateFn @serialize.apply(@, arguments)

        else
          throw new Error('Unrecognized template strategy: ' + strategy)

    if instance
      instance.templateStrategy = templateStrategy
    else
      Giraffe.View::templateStrategy = templateStrategy



# Set the default template strategy
Giraffe.View.setTemplateStrategy 'underscore-template-selector'

# Set the default document events
Giraffe.View.setDocumentEvents ['click', 'change']



###
* **Giraffe.App** is a special **Giraffe.View** that provides encapsulation for an entire application. Like all Giraffe views, the app has lifecycle management for all `children`, so calling `dispose` on an app will destroy all views, models, collections, and routers that have been added as `children` of the app or its descendents. The first **Giraffe.App** created on a page is available globally at `Giraffe.app`, and by default all Giraffe objects reference this app as `this.app` unless they're passed a different app in `options.app`. This app reference is used to bind `appEvents`, a hash that all Giraffe objects can implement which uses the app as an event aggregator for communication and routing. The app also provides synchronous and asynchronous initializers with `addInitializer` and `start`.
*
* @param {Object} [options]
###
class Giraffe.App extends Giraffe.View


  constructor: (options) ->
    @app = @
    if options?.routes
      @routes = options.routes
    @_initializers = []
    @started = false
    super


  _cache: ->
    if @routes
      @router = new Giraffe.Router(app: @, triggers: @routes)
    Giraffe.app ?= @ # for convenience, store the first created app as a global
    Giraffe.apps[@cid] = @
    $(window).on "unload", @_onUnload
    super


  _uncache: ->
    @router = null if @router
    Giraffe.app = null if Giraffe.app is @
    delete Giraffe.apps[@cid]
    $(window).off "unload", @_onUnload
    super


  _onUnload: =>
    @dispose()


  ###
  * If `routes` is defined on a **Giraffe.App** or passed to its constructor
  * as an option, the app will create an instance of **Giraffe.Router** as
  * `this.router` and bind the defined routes. The **Giraffe.App** `routes`
  * hash is similar to the `routes` of **Backbone.Router**, but instead of
  * `route: method` the **Giraffe.Router** expects `route: appEvent`, e.g.
  * `'someUrl/:andItsParams': 'some:appEvent'`.
  *
  *     var app = new Giraffe.App({routes: {'route': 'appEvent'}});
  *     app.router; // => instance of Giraffe.Router
  *     // or
  *     var MyApp = Giraffe.App.extend({routes: {'route': 'appEvent'}});
  *     var myApp = new MyApp();
  *     myApp.router; // => instance of Giraffe.Router
  ###
  routes: null


  ###
  * Queues up the provided function to be run on `start`. The functions you provide are called with the same `options` object passed to `start`. If the provided function has two arguments, the options and a callback, the app's initialization will wait until you call the callback. If the callback is called with a truthy first argument, an error will be logged and initialization will halt. If the app has already started when you call `addInitializer`, the function is called immediately.
  *
  *     app.addInitializer(function(options, cb) {
  *         doAsyncStuff(cb);
  *     });
  *
  * @param {Function} fn `function(options)` or `function(options, cb)`
  *     {Object} options - options passed from `start`
  *     {Function} cb - optional async callback `function(err)`
  ###
  addInitializer: (fn) ->
    if @started
      fn.call @, @options
    else
      @_initializers.push fn
    @


  ###
  * Starts the app by executing each initializer in the order it was added, passing `options` through the initializer queue. Triggers the `appEvents` `'app:initializing'` and `'app:initialized'`.
  *
  * @param {Object} [options]
  ###
  start: (options = {}) ->
    @trigger 'app:initializing', options

    # Runs all sync/async initializers.
    next = (err) =>
      return error(err) if err

      fn = @_initializers.shift()
      if fn
        # Allows asynchronous calls
        if fn.length is 2
          fn.call @, options, next
        else
          fn.call @, options
          next()
      else
        _.extend @options, options
        @started = true
        @trigger 'app:initialized', options

    next()
    @



###
* The **Giraffe.Router** integrates with a **Giraffe.App** to decouple your router and route handlers and to provide programmatic encapsulation for your routes. A route can be handled by any Giraffe object by subscribing to the corresponding app event defined in `triggers`. The `cause` method navigates to a route and triggers the corresponding app event, and you can ask the router if a given app event is currently caused via `isCaused`. Additionally, rather than building anchor links and window locations manually, you can build routes from app events and optional parameters with `getRoute`.
*
* @param {Object} [options]
###

# A router which triggers events on the app instead of
# to callbacks further decoupling routing from other classes.
#
# @example
# class MyRouter extends Giraffe.Router
#   triggers:
#     'p': '=> posts'               # redirect to posts route
#     'comments': '-> comments/foo' # redirect to absolute route
#     'posts': 'show:posts'         # trigger 'show:posts'
class Giraffe.Router extends Backbone.Router


  # Creates an instance of a Router.
  constructor: (options = {}) ->
    @app = options.app or Giraffe.app
    if !@app
      return error 'Giraffe routers require an app! Please create an instance of Giraffe.App before creating a router.'
    @app.addChild @ # disposes of the router when its app is removed
    Giraffe.bindEventMap @, @app, @appEvents

    ###
      The `triggers` hash is a map of routes to app events, e.g. `{'some/route/:andItsParams': 'some:appEvent'}`. If a **Giraffe.App** is created with a `routes` hash, it automatically creates a **Giraffe.Router** setting the router's `triggers` to the app's `routes`. `Backbone.Router#routes` is used internally, which is why `Giraffe.Router#triggers` is renamed.
    ###
    @triggers = @triggers # TODO doc annotations to make this line unnecessary
    if options.triggers
      @triggers = options.triggers
    if typeof @triggers is 'function'
      @triggers = @triggers()
    if !@triggers
      return error 'Giraffe routers require a `triggers` map of routes to app events.'

    if options.parentRouter
      @parentRouter = options.parentRouter

    if options.namespace
      @namespace = options.namespace
    else if !@namespace
      @namespace = Giraffe.Router.defaultNamespace

    @_routes = {}

    @_bindTriggers()
    super


  @defaultNamespace: ''


  # Computes the full namespace.
  _fullNamespace: ->
    if @parentRouter
      @parentRouter._fullNamespace() + '/' + @namespace
    else
      @namespace


  # See `App.routes`
  triggers: null


  ###
  * Performs a page refresh. If `url` is defined, the router first silently navigates to it before refeshing.
  *
  * @param {String} [url]
  ###
  reload: (url) ->
    if url
      Backbone.history.stop()
      window.location = url
    window.location.reload()


  # Binds events from `triggers` property as well as setting up routes.
  #
  # triggers:
  #   'route/path': 'event:name'
  #   'route/path2': '-> absolute/path'
  #   'relativeRedirect': '=> route/path'
  _bindTriggers: ->
    if !@triggers
      error 'Expected router to implement `triggers` hash in the form {route: appEvent}'

    fullNs = @_fullNamespace()
    if fullNs.length > 0
      fullNs += '/'

    for route, appEvent of @triggers

      do (route, appEvent, fullNs) =>
        # Redirects to an absolute route
        if _.indexOf(appEvent, '-> ') is 0
          callback = =>
            redirect = appEvent.slice(3)
            # console.log 'REDIRECTING ', appEvent, ' -> ', redirect
            @navigate redirect, trigger: true

        # Redirects to a route within this router
        else if _.indexOf(appEvent, '=> ') is 0
          callback = =>
            redirect = appEvent.slice(3)
            # console.log 'REDIRECTING ', appEvent, ' => ', redirect
            @navigate fullNs + redirect, trigger: true

        # Triggers an appEvent on the app
        else
          route = fullNs + route
          callback = (args...) =>
            # console.log 'TRIGGERING ', appEvent
            @app.trigger appEvent, args..., route

          # register the route so we can do a reverse map
          @_registerRoute appEvent, route

        @route route, appEvent, callback
    @


  # Unbinds all triggers registered to Backbone.history
  _unbindTriggers: ->
    triggers = @_getTriggerRegExpStrings()
    Backbone.history.handlers = _.reject Backbone.history.handlers, (handler) ->
      _.contains triggers, handler.route.toString()


  # Gets the routes of `triggers` as RegExps turned to strings, the `route` of Backbone.history
  _getTriggerRegExpStrings: ->
    _.map _.keys(@triggers), (route) ->
      Backbone.Router::_routeToRegExp(route).toString()


  ###
  * Triggers an app event with optional arguments. If `this.triggers` has a matching route, `Backbone.history` navigates to it.
  *
  * @param {String} appEvent App event name.
  * @param {Object} [any] Optional parameters.
  ###
  cause: (appEvent, any) ->
    route = @getRoute(appEvent, any)
    if route?
      Backbone.history.navigate route, trigger: true
    else
      @app.trigger appEvent, any


  ###
  * Returns true if the current `window.location` matches the route that the given app event and optional arguments map to.
  *
  * @param {String} appEvent App event name.
  * @param {Object} [any] Optional parameters.
  ###
  isCaused: (appEvent, any) ->
    route = @getRoute(appEvent, any)
    if route?
      if Backbone.history._hasPushState
        window.location.pathname.slice(1) is route
      else
        window.location.hash is route
    else
      false


  ###
  * Converts an app event and optional arguments into a url mapped in `this.triggers`. Useful if you want to programmatically encapsulate your routes, so you don't need to manually build anchor links and window locations to navigate to.
  *
  * @param {String} appEvent App event name.
  * @param {Object} [any] Optional parameter.
  ###
  getRoute: (appEvent, any...) ->
    route = @_routes[appEvent]
    if route?
      route = @_reverseHash(route, any...)
      if route
        if Backbone.history._hasPushState
          route
        else
          '#' + route
      else if route is ''
        ''
      else
        null
    else
      null


  # Register a route for reverse hash mapping when `event` is invoked.
  _registerRoute: (appEvent, route) ->
    @_routes[appEvent] = route


  # Reverse map a route using `any` value.
  _reverseHash: (route, args...) ->
    first = args[0]
    return route unless first?

    wildcards = /:\w+|\*\w+/g
    result = ""
    start = 0

    if _.isObject(first)
      matches = route.replace wildcards, (token, index) ->
        key = token.slice(1)
        val = first[key] || ''
        result += route.slice(start, index) + val
        start = index + token.length
    else
      matches = route.replace wildcards, (token, index) ->
        val = args.shift() || ''
        result += route.slice(start, index) + val
        start = index + token.length

    result



  ###
  * Define `appEvents` on any Giraffe object to listen to events on `this.app`, which is either the option passed in `{app: myApp}` or the first instance of **Giraffe.App** created on the page, which is globally assigned to `Giraffe.app`. Any object with a reference to an app can `trigger` arbitrary `appEvents`, and any object with a reference to a router can `cause` an app event and navigate to its corresponding route.
  ###
  appEvents: null


  ###
  * Removes registered callbacks.
  *
  ###
  dispose: ->
    Giraffe.dispose @, ->
      @_unbindTriggers()



###
* **Giraffe.Model** and **Giraffe.Collection** are thin wrappers that add lifecycle management and `appEvents` support. To add lifecycle management to an arbitrary object, simply give it a `dispose` method and add it to a view via `addChild`. The function `Giraffe.dispose` can be used to perform some useful disposal work. The helper function `Giraffe.bindEventMap` adds `appEvents` bindings for any object, and Backbone's `stopListening` will unbind them.
*
* @param {Object} [attributes]
* @param {Object} [options]
###
class Giraffe.Model extends Backbone.Model


  constructor: (attributes, options) ->
    @app or= options?.app or Giraffe.app
    Giraffe.bindEventMap @, @app, @appEvents
    super


  ###
  * Define `appEvents` on any Giraffe object to listen to events on `this.app`, which is either the option passed in `{app: myApp}` or the first instance of **Giraffe.App** created on the page, which is globally assigned to `Giraffe.app`. Any object with a reference to an app can `trigger` arbitrary `appEvents`, and any object with a reference to a router can `cause` an app event and navigate to its corresponding route.
  ###
  appEvents: null


  ###
  * Removes event listeners and removes this model from its collection.
  ###
  dispose: ->
    Giraffe.dispose @, ->
      @collection?.remove @



###
* **Giraffe.Model** and **Giraffe.Collection** are thin wrappers that add lifecycle management and `appEvents` support. To add lifecycle management to an arbitrary object, simply give it a `dispose` method and add it to a view via `addChild`. The function `Giraffe.dispose` can be used to perform some useful disposal work. The helper function `Giraffe.bindEventMap` adds `appEvents` bindings for any object, and Backbone's `stopListening` will unbind them.
*
* @param {Array} [models]
* @param {Object} [options]
###
class Giraffe.Collection extends Backbone.Collection


  model: Giraffe.Model


  constructor: (models, options) ->
    @app or= options?.app or Giraffe.app
    Giraffe.bindEventMap @, @app, @appEvents
    super


  ###
  * Define `appEvents` on any Giraffe object to listen to events on `this.app`, which is either the option passed in `{app: myApp}` or the first instance of **Giraffe.App** created on the page, which is globally assigned to `Giraffe.app`. Any object with a reference to an app can `trigger` arbitrary `appEvents`, and any object with a reference to a router can `cause` an app event and navigate to its corresponding route.
  ###
  appEvents: null


  ###
  * Removes event listeners and disposes of all models, which removes them from the collection.
  ###
  dispose: ->
    Giraffe.dispose @, ->
      model.dispose() for model in @models



###
* Disposes of a object. Calls Backbone's `obj.stopListening()` and sets `obj.app` to null. Also triggers `'disposing'` and `'disposed'` events on `obj` before and after the disposal. Takes an optional `fn` argument to do additional work, and optional `args` that are passed through to the events and `fn`.
*
* @param {Object} obj The object to dispose.
* @param {Function} [fn] A callback to perform additional work in between the `'disposing'` and `'disposed'` events.
* @param {Any} [args...] A list of arguments to by passed to the `fn` and disposal events.
###
Giraffe.dispose = (obj, fn, args...) ->
  obj.trigger? 'disposing', obj, args...
  fn?.apply obj, args
  obj.stopListening?()
  obj.app = null
  obj.trigger? 'disposed', obj, args...
  obj



###
* Uses `Backbone.Events.listenTo` to make `contextObj` listen for `eventName` on `targetObj` with the callback `cb`, which can be a function or the string name of a method on `contextObj`.
*
* @param {Backbone.Events} contextObj The object doing the listening.
* @param {Backbone.Events} targetObj The object to listen to.
* @param {String/Function} eventName The name of the event to listen to.
* @param {Function} cb The event's callback.
###
Giraffe.bindEvent = (args...) ->
  _setEventBindings.apply null, args.concat('listenTo')


# TODO accept partial params
###
* The `stopListening` equivalent of `bindEvent`.
*
* @param {Backbone.Events} contextObj The object doing the listening.
* @param {Backbone.Events} targetObj The object to listen to.
* @param {String/Function} eventName The name of the event to listen to.
* @param {Function} cb The event's callback.
###
Giraffe.unbindEvent = (args...) ->
  _setEventBindings.apply null, args.concat('stopListening')


###
* Uses `bindEvent` to bind an event map of the form `{eventName: methodName}`.
*
* @param {Backbone.Events} contextObj The object doing the listening.
* @param {Backbone.Events} targetObj The object to listen to.
* @param {Object} eventMap A map of events to callbacks in the form {eventName: methodName/methodFn} to listen to.
* @param {Function} cb The event's callback.
###
Giraffe.bindEventMap = (args...) ->
  _setEventMapBindings.apply null, args.concat('listenTo')


# TODO accept partial params
###
* The `stopListening` equivalent of `bindEventMap`.
*
* @param {Backbone.Events} contextObj The object doing the listening.
* @param {Backbone.Events} targetObj The object to listen to.
* @param {Object} eventMap A map of events to callbacks in the form {eventName: methodName/methodFn} to listen to.
* @param {Function} cb The event's callback.
###
Giraffe.unbindEventMap = (args...) ->
  _setEventMapBindings.apply null, args.concat('stopListening')


# Event binding helpers
_setEventBindings = (contextObj, targetObj, eventName, cb, bindOrUnbindFnName) ->
  return unless targetObj and contextObj and eventName and bindOrUnbindFnName
  if typeof cb is 'string'
    cb = contextObj[cb]
  if typeof cb isnt 'function'
    error "callback for `'#{eventName}'` not found", contextObj, targetObj, cb
    return
  contextObj[bindOrUnbindFnName] targetObj, eventName, cb


_setEventMapBindings = (contextObj, targetObj, eventMap, bindOrUnbindFnName) ->
  if typeof eventMap is 'function'
    eventMap = eventMap()
  return unless eventMap
  for eventName, cb of eventMap
    _setEventBindings contextObj, targetObj, eventName, cb, bindOrUnbindFnName
  null
