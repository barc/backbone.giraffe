#===============================================================================
# Copyright (c) 2013 Barc Inc.
#
# Barc Permissive License
#===============================================================================

Backbone.Giraffe = window.Giraffe = Giraffe =
  version: '{{VERSION}}'
  app: null # stores the most recently created instance of App, so for simple cases with 1 app Giraffe objects don't need an app reference
  apps: {} # cache for all app views by `cid`
  views: {} # cache for all views by `cid`


# A helper function for more helpful error messages.
error = ->
  console?.error?.apply console, ['Backbone.Giraffe error:'].concat(arguments...)


###
* __Giraffe.View__ is optimized for simplicity and flexibility. Views can move
* around the DOM safely and freely with the `attachTo` method, which accepts any
* selector, DOM element, or view, as well as an optional __jQuery__ insertion
* method like `'prepend'`, `'after'`, or `'html'`. The default is `'append'`.
*
*     var parentView = new Giraffe.View();
*     parentView.attachTo('body', {method: 'prepend'});
*     $('body').find(parentView.$el).length; // => 1
*
* The `attachTo` method automatically sets up parent-child relationships between
* views via the references `children` and `parent` to allow nesting with no
* extra work.
*
*     var childView = new Giraffe.View();
*     childView.attachTo(parentView); // or `parentView.attach(childView);`
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
* When a view is attached, `render` is called if it has not yet been rendered.
* When a view renders, it first calls `detach` on all of its `children`, and
* when a view is detached, the default behavior is to call `dispose` on it.
* To overried this behavior and cache a view even when its `parent` renders, you
* can set the cached view's `disposeOnDetach` property to `false`.
*
*     var parentView = new Giraffe.View();
*     parentView.attach(new Giraffe.View());
*     parentView.attach(new Giraffe.View({disposeOnDetach: false}));
*     parentView.attachTo('body'); // render() is called, disposes of the first view
*     parentView.children.length; // => 1
*
* Views are not automatically reattached after `render`, so you retain control,
* but their parent-child relationships stay intact unless they're disposed.
* See [`Giraffe.View#afterRender`](#View-afterRender) for more.
*
* __Giraffe.View__ gets much of its smarts by way of the `data-view-cid`
* attribute attached to `view.$el`. This attribute allows us to find a view's
* parent when attached to a DOM element and safely detach views when they would
* otherwise be clobbered.
*
* Currently, __Giraffe__ has only one class that extends __Giraffe.View__,
* __Giraffe.App__, which encapsulates app-wide messaging and routing.
*
* Like all __Giraffe__ objects, __Giraffe.View__ extends each instance with
* every property in `options`.
*
* @param {Object} [options]
###
class Giraffe.View extends Backbone.View


  @defaultOptions:
    disposeOnDetach: true     # If true, disposes of the view when detached from the DOM.
    alwaysRender: false       # If true, always renders on attach unless suppressRender is passed as an option.
    saveScrollPosition: false # If true or a selector, saves the scroll position of `@$el` or `@$(selector)`, respectively, when detached to be automatically applied when reattached. Object selectors aren't scoped to the view, so `window` and `$('body')` are valid values.
    documentTitle: null       # When the view is attached, the document.title will be set to this.


  constructor: (options) ->
    _.extend @, Giraffe.View.defaultOptions, options

    @app ?= Giraffe.app
    Giraffe.bindEventMap @, @app, @appEvents

    ###
    * When one view is attached to another, the child view is added to the
    * parent's `children` array. When `dispose` is called on a view, it disposes
    * of all `children`, enabling the teardown of a single view or an entire app
    * with one method call. Any object with a `dispose` method can be added
    * to a view's `children` via `addChild` to take advantage of lifecycle
    * management.
    ###
    @children = []

    ###
    * Child views attached via `attachTo` have a reference to their parent view.
    ###
    @parent = null

    @_renderedOnce = false
    @_isAttached = false

    @_createEventsFromUIElements()

    @_wrapInitialize()

    if typeof @templateStrategy is 'string'
      Giraffe.View.setTemplateStrategy @templateStrategy, @

    super


  # Pre-initialization to set `data-view-cid` is necessary to allow views to be attached in `initialize`.
  _wrapInitialize: ->
    @initialize = _.wrap @initialize, (initialize) =>
      # Add the view to the global cache now that the view has a cid.
      @_cache()

      # Set the data-view-cid attribute to link dom els to their view objects.
      @$el.attr 'data-view-cid', @cid

      # Set the initial parent -- needed only in cases where an existing `el` is given to the view.
      @setParent Giraffe.View.getClosestView(@$el)

      # Cache any elements that might already be in `el`
      @_cacheUiElements()

      # Initialize the view
      initialize.apply @, Array.prototype.slice.call(arguments, 1)

      # Bind data events after initialize is called, so objects can be created during initialize to be bound to
      # The limits of this implementation include the fact that that events firing during `initialize`
      # won't be listened for, and any data objects created after `initialize` won't be bound to.
      @_bindDataEvents()


  _attachMethods: ['append', 'prepend', 'html', 'after', 'before', 'insertAfter', 'insertBefore']
  _siblingAttachMethods: ['after', 'before', 'insertAfter', 'insertBefore']


  ###
  * Attaches this view to `el`, which can be a selector, DOM element, or view.
  * If `el` is inside another view, a parent-child relationship is set up.
  * `options.method` is the __jQuery__ method used to attach the view. It
  * defaults to `'append'` and also accepts `'prepend'`, `'after'`, `'before'`,
  * and `'html'`. If the view has not yet been rendered when attached, `render`
  * is called. This `render` behavior can be overridden via
  * `options.forceRender` and `options.suppressRender`. See the
  * [_View Basics_ example](viewBasics.html) for more.
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
    shouldRender = !suppressRender and (!@_renderedOnce or forceRender or @alwaysRender)
    if shouldRender
      @render options

    @_loadScrollPosition() if @saveScrollPosition
    document.title = @documentTitle if @documentTitle?
    @


  ###
  * `attach` is an inverted way to call `attachTo`. Unlike `attachTo`, calling
  * this function requires a parent view. It's here only for aesthetics. Takes
  * the same `options` as `attachTo` in addition to the optional `options.el`,
  * which is the first argument passed to `attachTo`, defaulting to the parent
  * view.
  *
  * @param {View} view
  * @param {Object} [options]
  * @caption parentView.attach(childView, [options])
  ###
  attach: (view, options) ->
    if options?.el
      el = Giraffe.View.to$El(options.el)
      childEl = @$el.find(el)
      if childEl.length
        view.attachTo childEl, options
      else if @$el.is(el)
        view.attachTo @$el, options
      else
        error 'Attempting to attach to an element that doesn\'t exist inside this view!', options, view, @
    else
      view.attachTo @$el, options
    @


  ###
  * __Giraffe__ implements `render` so it can do some helpful things, but you can
  * still call it like you normally would. By default, `render` uses a view's
  * `template`, which is the DOM selector of an __Underscore__ template, but
  * this is easily configured. See [`Giraffe.View#template`](#View-template),
  * [`Giraffe.View.setTemplateStrategy`](#View-setTemplateStrategy), and
  * [`Giraffe.View#templateStrategy`](#View-templateStrategy) for more.
  *
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
  * This is an empty function for you to implement. Less commonly used than
  * `afterRender`, but helpful in circumstances where the DOM has state that
  * needs to be preserved across renders. For example, if a view with a dropdown
  * menu is rendering, you may want to save its open state in `beforeRender`
  * and reapply it in `afterRender`.
  *
  * @caption Implement this function in your views.
  ###
  beforeRender: ->


  ###
  * This is an empty function for you to implement. After a view renders,
  * `afterRender` is called. Child views are normally attached to the DOM here.
  * Views that are cached by setting `disposeOnDetach` to true will be
  * in `view.children` in `afterRender`, but will not be attached to the
  * parent's `$el`.
  *
  * @caption Implement this function in your views.
  ###
  afterRender: ->


  ###
  * __Giraffe__ implements its own `render` function which calls `templateStrategy`
  * to get the HTML string to put inside `view.$el`. Your views can either
  * define a `template`, which uses __Underscore__ templates by default and is
  * customizable via [`Giraffe.View#setTemplateStrategy`](#View-setTemplateStrategy),
  * or override `templateStrategy` with a function returning a string of HTML
  * from your favorite templating engine. See the
  * [_Template Strategies_ example](templateStrategies.html) for more.
  ###
  templateStrategy: -> ''


  ###
  * Consumed by the `templateStrategy` function created by
  * [`Giraffe.View#setTemplateStrategy`](#View-setTemplateStrategy). By default,
  * `template` is the DOM selector of an __Underscore__ template. See the
  * [_Template Strategies_ example](templateStrategies.html) for more.
  *
  *     // the default `templateStrategy` is 'underscore-template-selector'
  *     view.template = '#my-template-selector';
  *     // or
  *     Giraffe.View.setTemplateStrategy('underscore-template');
  *     view.template = '<div>hello <%= name %></div>';
  *     // or
  *     Giraffe.View.setTemplateStrategy('jst');
  *     view.template = function(data) { return '<div>hello' + data.name + '</div>'};
  ###
  template: null


  ###
  * Gets the data passed to the `template`. Returns the view by default.
  *
  * @caption Override this function to pass custom data to a view's `template`.
  ###
  serialize: -> @


  ###
  * Detaches the view from the DOM. If `view.disposeOnDetach` is true,
  * which is the default, `dispose` will be called on the view and its
  * `children` unless `preserve` is true. `preserve` defaults to false. When
  * a view renders, it first calls `detach(false)` on the views inside its `$el`.
  *
  * @param {Boolean} [preserve] If true, doesn't dispose of the view, even if `disposeOnDetach` is `true`.
  ###
  detach: (preserve = false) ->
    return @ unless @_isAttached
    @_isAttached = false

    @_saveScrollPosition() if @saveScrollPosition

    # Deatch the view from the DOM to preserve its events.
    @$el.detach()

    # Disposes the view unless the view's options or function caller preserve it.
    if @disposeOnDetach and !preserve
      @dispose()
    @


  ###
  * Calls `detach` on each object in `children`, passing `preserve` through.
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
    if typeof @saveScrollPosition is 'boolean' or @$el.is(@saveScrollPosition)
      @$el
    else
      # First search for an $el scoped to this view, then search globally
      $el = Giraffe.View.to$El(@saveScrollPosition, @$el).first()
      if $el.length
        $el
      else
        $el = Giraffe.View.to$El(@saveScrollPosition).first()
        if $el.length
          $el
        else
          @$el


  ###
  * Adds `child` to this view's `children` and assigns this view as
  * `child.parent`. If `child` implements `dispose`, it will be called when the
  * view is disposed. If `child` implements `detach`, it will be called before
  * the view renders.
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
  * Removes an object from this view's `children`. If `preserve` is `false`, the
  * default, __Giraffe__ will attempt to call `dispose` on the child. If
  * `preserve` is true, __Giraffe__ will attempt to call `detach(true)` on the
  * child.
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
  * Sets a new parent for a view, first removing any current parent-child
  * relationship. `parent` can be falsy to remove the current parent.
  *
  * @param {Giraffe.View} [parent]
  ###
  setParent: (parent) ->
    if parent and parent isnt @
      parent.addChild @
    else if @parent
      @parent.removeChild @, true
      @parent = null
    @


  ###
  * If `el` is `null` or `undefined`, tests if the view is somewhere on the DOM
  * by calling `$(document).find(view.$el)`. If `el` is defined, tests if `el`
  * is the immediate parent of `view.$el`.
  *
  * @param {String} [el] Optional selector, DOM element, or view to test against the view's immediate parent.
  * @returns {Boolean}
  ###
  isAttached: (el) ->
    if el?
      if el.$el
        @parent is el
      else
        @$el.parent().is(el)
    else
      $(document).find(@$el).length > 0


  ###
  * The `ui` object maps names to selectors, e.g.
  * `{$someName: '#some-selector'}`. If a view defines `ui`, the __jQuery__
  * objects it names will be cached and updated every `render`. For example,
  * declaring `this.ui = {$button: '#button'}` in a view makes `this.$button`
  * always available once `render` has been called. Typically the selector
  * value is a string, but if it's function, its return value will be assigned,
  * and if it's neither a string or a function, the value itself is assigned.
  ###
  ui: null


  # Caches jQuery objects to the view, reading the map @ui {name: selector}, made available as @name.
  _cacheUiElements: ->
    if @ui
      for name, selector of @ui
        @[name] = switch typeof selector
          when 'string'
            @$(selector)
          when 'function'
            selector()
          else
            selector
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
  * Calls `methodName` on the view, or if not found, up the view hierarchy until
  * it either finds the method or fails on a view without a `parent`. Used by
  * __Giraffe__ to call the methods defined for the events bound in
  * `Giraffe.View.setDocumentEvents`.
  *
  * @param {String} methodName
  * @param {Any} [args...]
  ###
  invoke: (methodName, args...) ->
    view = @
    while view and !view[methodName]
      view = view.parent
    if view?[methodName]
      view[methodName].apply view, args
    else
      error 'No such method name in view hierarchy', methodName, args, @
      true


  ###
  * See [`Giraffe.App#appEvents`](#App-appEvents).
  ###
  appEvents: null


  ###
  * Destroys a view, unbinding its events and freeing its resources. Calls
  * `Backbone.View#remove` and calls `dispose` on all `children`.
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
  * Detaches the top-level views inside `el`, which can be a selector, element,
  * or __Giraffe.View__. Used internally by __Giraffe__ to remove views that
  * would otherwise be clobbered when the option `method: 'html'` is used
  * in `attachTo`. Uses the `data-view-cid` attribute to match DOM nodes to view
  * instances.
  *
  * @param {String/Element/Giraffe.View} el
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
  * Gets the closest parent view of `el`, which can be a selector, element, or
  * __Giraffe.View__. Uses the `data-view-cid` attribute to match DOM nodes to
  * view instances.
  *
  * @param {String/Element/Giraffe.View} el
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


  # Gets a jQuery object from a selector, element, jQuery object, or Giraffe.View,
  # scoped by an optional `$parent`.
  @to$El: (el, $parent) ->
    if $parent?
      $parent = Giraffe.View.to$El($parent)
    if $parent
      $el = Giraffe.View.to$El(el)
      $parent.find($el)
    else if el?.$el
      el.$el
    else if el instanceof $
      el
    else
      $(el)


  ###
  * __Giraffe__ provides a convenient high-performance way to declare view
  * method calls in your HTML markup. Using the form
  * `data-gf-eventName='methodName'`, when a bound DOM event is triggered,
  * __Giraffe__ looks for the defined method on the element's view. For example,
  * putting `data-gf-click='onSubmitForm'` on a button calls the method
  * `onSubmitForm` on its view on `'click'`. If the view does not define the
  * method, __Giraffe__ searches up the view hierarchy until it finds it or runs
  * out of views. By default, only the `click` and `change` events are bound by
  * __Giraffe__, but `setDocumentEvents` allows you to set a custom list of
  * events, first unbinding the existing ones and then setting the ones you give
  * it, if any.
  *
  *     Giraffe.View.setDocumentEvents(['click', 'change']); // default
  *     // or
  *     Giraffe.View.setDocumentEvents(['click', 'change', 'keydown']);
  *     // or
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
  * Equivalent to `Giraffe.View.setDocumentEvents(null)`.
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
  * See the [_Template Strategies_ example](templateStrategies.html) for more.
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
* __Giraffe.App__ is a special __Giraffe.View__ that provides encapsulation for
* an entire application. Like all __Giraffe__ views, the app has lifecycle
* management for all `children`, so calling `dispose` on an app will call
* `dispose` on all `children` that have the method. The first __Giraffe.App__
* created on a page is available globally at `Giraffe.app`, and by default all
* __Giraffe__ objects reference this app as `this.app` unless they're passed a
* different app in `options.app`. This app reference is used to bind
* `appEvents`, a hash that all __Giraffe__ objects can implement which uses the
* app as an event aggregator for communication and routing.
*
*     var myApp = new Giraffe.App();
*     window.Giraffe.app; // => `myApp`
*     myApp.attach(new Giraffe.View({
*       appEvents: {
*         'say:hello': function() { console.log('hello world'); }
*       },
*       // app: someOtherApp // if you don't want to use `window.Giraffe.app`
*     }));
*     myApp.trigger('say:hello'); // => 'hello world'
*
* `appEvents` are also used by the __Giraffe.Router__. See
* [`Giraffe.App#routes`](#App-routes) for more.
*
* The app also provides synchronous and asynchronous initializers with `addInitializer` and `start`.
*
* Like all __Giraffe__ objects, __Giraffe.App__ extends each instance with
* every property in `options`.
*
* @param {Object} [options]
###
class Giraffe.App extends Giraffe.View


  constructor: (options) ->
    @app = @
    @_initializers = []
    @started = false
    super


  _cache: ->
    Giraffe.app ?= @ # for convenience, store the first created app as a global
    Giraffe.apps[@cid] = @
    if @routes
      @router = new Giraffe.Router(app: @, triggers: @routes)
    $(window).on "unload", @_onUnload
    super


  _uncache: ->
    Giraffe.app = null if Giraffe.app is @
    delete Giraffe.apps[@cid]
    @router = null if @router
    $(window).off "unload", @_onUnload
    super


  _onUnload: =>
    @dispose()


  ###
  * Similar to the `events` hash of __Backbone.View__, `appEvents` maps events
  * on `this.app` to methods on a __Giraffe__ object. App events can be
  * triggered from routes or by any object in your application. If a
  * __Giraffe.App__ has been created, every __Giraffe__ object has a reference
  * to the global __Giraffe.app__ instance at `this.app`, and a specific app
  * instance can be set by passing `options.app` to the object's constructor.
  * This instance of `this.app` is used to bind `appEvents`, and these bindings
  * are automatically cleaned up when an object is disposed.
  *
  *     // in a Giraffe object
  *     this.appEvents = {'some:appEvent': 'someMethod'};
  *     this.app.trigger('some:appEvent', params) // => this.someMethod(params)
  ###
  appEvents: null


  ###
  * If `routes` is defined on a __Giraffe.App__ or passed to its constructor
  * as an option, the app will create an instance of __Giraffe.Router__ as
  * `this.router` and set the router's `triggers` to the app's `routes`. Any
  * number of routers can be instantiated manually, but they do require that an
  * instance of __Giraffe.App__ is first created, because they use `appEvents`
  * for route handling. See [`Giraffe.Router#triggers`](#Router-triggers)
  * for more.
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
  * Queues up the provided function to be run on `start`. The functions you
  * provide are called with the same `options` object passed to `start`. If the
  * provided function has two arguments, the options and a callback, the app's
  * initialization will wait until you call the callback. If the callback is
  * called with a truthy first argument, an error will be logged and
  * initialization will halt. If the app has already started when you call
  * `addInitializer`, the function is called immediately.
  *
  *     app.addInitializer(function(options) {
  *         doSyncStuff();
  *     });
  *     app.addInitializer(function(options, cb) {
  *         doAsyncStuff(cb);
  *     });
  *     app.start();
  *
  * @param {Function} fn `function(options)` or `function(options, cb)`
  *     {Object} options - options passed from `start`
  *     {Function} cb - optional async callback `function(err)`
  ###
  addInitializer: (fn) ->
    if @started
      fn.call @, @_startOptions
      _.extend @, @_startOptions
    else
      @_initializers.push fn
    @


  ###
  * Starts the app by executing each initializer in the order it was added,
  * passing `options` through the initializer queue. Triggers the `appEvents`
  * `'app:initializing'` and `'app:initialized'`.
  *
  * @param {Object} [options]
  ###
  start: (options = {}) ->
    @_startOptions = options
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
        _.extend @, options
        @started = true
        @trigger 'app:initialized', options

    next()
    @


  ###
  * See [`Giraffe.View#dispose`](#View-dispose).
  ###
  dispose: ->
    super



###
* The __Giraffe.Router__ integrates with a __Giraffe.App__ to decouple your
* router and route handlers and to provide programmatic encapsulation for your
* routes. Routes trigger `appEvents` on the router's instance of
* __Giraffe.App__. All __Giraffe__ objects implement the `appEvents` hash as a
* shortcut. `Giraffe.Router#cause` triggers an app event and navigates to its
* route if one exists in `Giraffe.Router#triggers`, and you can ask the router
* if a given app event is currently caused via `Giraffe.Router#isCaused`.
* Additionally, rather than building anchor links and window locations manually,
* you can build routes from app events and optional parameters with
* `Giraffe.Router#getRoute`.
*
*     var myRouter = Giraffe.Router.extend({
*       triggers: {
*         'post/:id': 'show:post' // triggers 'show:posts' on this.app
*       }
*     });
*     myRouter.cause('show:post', 42); // goes to #post/42 and triggers 'show:post'
*     myRouter.isCaused('show:post', 42); // => true
*     myRouter.getRoute('show:post', 42); // => '#post/42'
*
* The __Giraffe.Router__ requires that a __Giraffe.App__ has been created on the
* page so it can trigger events for your objects to listen to. For convenience,
* if a __Giraffe.App__ is created with a `routes` hash, it will automatically
* instantiate a router and set its `triggers` equal to the app's `routes`.
*
*     var myApp = Giraffe.App.extend({
*       routes: {'my/route': 'app:event'}
*     });
*     myApp.router.triggers; // => {'my/route': 'app:event'}
*
* Like all __Giraffe__ objects, __Giraffe.Router__ extends each instance with
* every property in `options`.
*
* @param {Object} [options]
###
class Giraffe.Router extends Backbone.Router


  # Creates an instance of a Router.
  constructor: (options) ->
    _.extend @, options

    @app ?= Giraffe.app
    if !@app
      return error 'Giraffe routers require an app! Please create an instance of Giraffe.App before creating a router.'
    @app.addChild @ # disposes of the router when its app is removed
    Giraffe.bindEventMap @, @app, @appEvents

    if typeof @triggers is 'function'
      @triggers = @triggers()
    if !@triggers
      return error 'Giraffe routers require a `triggers` map of routes to app events.'

    @_routes = {}

    @_bindTriggers()
    super


  namespace: ''


  # Computes the full namespace.
  _fullNamespace: ->
    if @parentRouter
      @parentRouter._fullNamespace() + '/' + @namespace
    else
      @namespace


  ###
  * The __Giraffe.Router__ `triggers` hash is similar `Backbone.Router#routes`,
  * but instead of `route: method` the __Giraffe.Router__ expects
  * `route: appEvent`. `Backbone.Router#routes` is used internally, which is why
  * `Giraffe.Router#triggers` is renamed. The router also has a redirect
  * feature as demonstrated below.
  *
  *     triggers: {
  *       'some/route/:andItsParams': 'some:appEvent', // triggers 'some:appEvent' on this.app
  *       'some/other/route': '-> some/redirect/route' // redirect
  *     }
  ###
  triggers: null


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
  * If `this.triggers` has a route that maps to `appEvent`, the router navigates
  * to the route, triggering the `appEvent`. If no such matching route exists,
  * `cause` acts as an alias for `this.app.trigger`.
  *
  * @param {String} appEvent App event name.
  * @param {Object} [any] Optional parameters.
  ###
  cause: (appEvent, any...) ->
    route = @getRoute(appEvent, any...)
    if route?
      Backbone.history.navigate route, trigger: true
    else
      @app.trigger appEvent, any...


  ###
  * Returns true if the current `window.location` matches the route that the
  * given app event and optional arguments map to in this router's `triggers`.
  *
  * @param {String} appEvent App event name.
  * @param {Object} [any] Optional parameters.
  ###
  isCaused: (appEvent, any...) ->
    route = @getRoute(appEvent, any...)
    if route?
      if Backbone.history._hasPushState
        window.location.pathname.slice(1) is route
      else
        window.location.hash is route
    else
      false


  ###
  * Converts an app event and optional arguments into a url mapped in
  * `this.triggers`. Useful to build links to the routes in your app without
  * manually manipulating route strings.
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
    if _.isObject(first)
      result = route.replace wildcards, (token, index) ->
        key = token.slice(1)
        first[key] || ''
    else
      result = route.replace wildcards, (token, index) ->
        args.shift() || ''

    result


  ###
  * Performs a page refresh. If `url` is defined, the router first silently
  * navigates to it before refeshing.
  *
  * @param {String} [url]
  ###
  reload: (url) ->
    if url
      Backbone.history.stop()
      window.location = url
    window.location.reload()


  ###
  * See [`Giraffe.App#appEvents`](#App-appEvents).
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
* __Giraffe.Model__ and __Giraffe.Collection__ are thin wrappers that add
* lifecycle management and `appEvents` support. To add lifecycle management to
* an arbitrary object, simply give it a `dispose` method and add it to a view
* via `addChild`. To use this functionality in your own objects, see
* [`Giraffe.dispose`](#dispose) and [`Giraffe.bindEventMap`](#bindEventMap).
*
* Like all __Giraffe__ objects, __Giraffe.Model__ and __Giraffe.Collection__
* extend each instance with every property in `options`.
*
* @param {Object} [attributes]
* @param {Object} [options]
###
class Giraffe.Model extends Backbone.Model


  constructor: (attributes, options) ->
    _.extend @, options
    @app ?= Giraffe.app
    Giraffe.bindEventMap @, @app, @appEvents
    super


  ###
  * See [`Giraffe.App#appEvents`](#App-appEvents).
  ###
  appEvents: null


  ###
  * Removes event listeners and removes this model from its collection.
  ###
  dispose: ->
    Giraffe.dispose @, ->
      @collection?.remove @



###
* See [`Giraffe.Model`](#Model).
*
* @param {Array} [models]
* @param {Object} [options]
###
class Giraffe.Collection extends Backbone.Collection


  model: Giraffe.Model


  constructor: (models, options) ->
    _.extend @, options
    @app ?= Giraffe.app
    Giraffe.bindEventMap @, @app, @appEvents
    super


  ###
  * See [`Giraffe.App#appEvents`](#App-appEvents).
  ###
  appEvents: null


  ###
  * Removes event listeners and disposes of all models, which removes them from
  * the collection.
  ###
  dispose: ->
    Giraffe.dispose @, ->
      model.dispose() for model in @models



###
* Disposes of a object. Calls `Backbone.Events#stopListening` and sets `obj.app`
* to null. Also triggers `'disposing'` and `'disposed'` events on `obj` before
* and after the disposal. Takes an optional `fn` argument to do additional work,
* and optional `args` that are passed through to the events and `fn`.
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
* Uses `Backbone.Events.listenTo` to make `contextObj` listen for `eventName` on
* `targetObj` with the callback `cb`, which can be a function or the string name
* of a method on `contextObj`.
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
* Makes `contextObj` listen to `targetObj` for the events of `eventMap` in the
* form `eventName: method`, where `method` is a function or the name of a
* function on `contextObj`.
*
*     Giraffe.bindEventMap(this, this.app, this.appEvents);
*
* @param {Backbone.Events} contextObj The object doing the listening.
* @param {Backbone.Events} targetObj The object to listen to.
* @param {Object} eventMap A map of events to callbacks in the form {eventName: methodName/methodFn} to listen to.
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



