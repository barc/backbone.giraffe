Contrib = Giraffe.Contrib =
  version: '{{VERSION}}'

###
* `Backbone.Giraffe.Contrib` is a collection of officially supported classes that are
* built on top of `Backbone.Giraffe`. These classes should be considered
* experimental as their APIs are subject to undocumented changes.
###

###
* A __CollectionView__ mirrors a `Collection`, rendering a view for each model.
*
* @param {Object} options
*
* - [collection] - {Collection} The collection instance for the `CollectionView`. Defaults to a new __Giraffe.Collection__.
* - [modelView] - {ViewClass} The view created per model in `collection.models`. Defaults to __Giraffe.View__.
* - [modelViewArgs] - {Array} The arguments passed to the `modelView` constructor. Can be a function returning an array.
* - [modelViewEl] - {Selector,Giraffe.View#ui} The container for the model views. Can be a function returning the same. Defaults to `collectionView.$el`.
*
* @example
*
*  var FruitView = Giraffe.View.extend({});
*
*  var FruitsView = Giraffe.Contrib.CollectionView.extend({
*    modelView: FruitView
*  });
*
*  var view = new FruitsView({
*    collection: [{name: 'apple'}],
*  });
*
*  view.children.length; // => 1
*
*  view.collection.addOne({name: 'banana'});
*
*  view.children.length; // => 2
###
class Contrib.CollectionView extends Giraffe.View


  @getDefaults: (ctx) ->
    collection: if ctx.collection then null else new Giraffe.Collection # lazy lood for efficiency
    modelView: Giraffe.View
    modelViewArgs: null # optional array of arguments passed to modelView constructor (or function returning the same)
    modelViewEl: null # optional selector or Giraffe.View#ui name to contain the model views
  

  constructor: ->
    super
    _.defaults @, @constructor.getDefaults(@)
#ifdef DEBUG
    throw new Error('`modelView` is required') unless @modelView
    throw new Error('`collection.model` is required') unless @collection?.model
#endif
    @listenTo @collection, 'add', @addOne
    @listenTo @collection, 'remove', @removeOne
    @listenTo @collection, 'reset', @render
    @listenTo @collection, 'sort', @render
    @modelViewEl = @ui?[@modelViewEl] or @modelViewEl if @modelViewEl # accept a Giraffe.View#ui name or a selector
    @


  _calcAttachOptions: (model) ->
    options =
      el: null
      method: 'prepend'
    # Searches backwards for a modelView to insert after, falling back to prepend
    index = @collection.indexOf(model)
    i = 1
    while prevModel = @collection.at(index - i)
      prevView = _.findWhere(@children, model: prevModel)
      if prevView?._isAttached # TODO a better way, perhaps add to Giraffe API?
        options.method = 'after'
        options.el = prevView.$el
        break
      i++
    if !options.el and @modelViewEl
      options.el = @$(@modelViewEl)
#ifdef DEBUG
      throw new Error('`modelViewEl` not found in this view') if !options.el.length
#endif
    options


  # TODO fails if deep clone is needed
  _cloneModelViewArgs: ->
    args = @modelViewArgs or [{}]
    args = args.call(@) if _.isFunction(args)
    args = [args] if !_.isArray(args)
    args = _.map(args, _.clone)
#ifdef DEBUG
    throw new Error('`modelViewArgs` must be an array with an object as the first value') unless _.isArray(args) and _.isObject(args[0])
#endif
    args


  # TODO If there was a "rendered" event this wouldn't need to implement afterRender (requiring super calls)
  afterRender: ->
    @collection.each @addOne
    @


  removeOne: (model) ->
    if @collection.contains(model)
      @collection.remove model # falls through
    else
      modelView = _.findWhere(@children, {model})
      modelView?.dispose()
    @


  addOne: (model) =>
    if !@collection.contains(model)
      @collection.add model # falls through
    else if !@_renderedOnce # TODO a better way, perhaps add to Giraffe API?
      @render() # falls through
    else
      attachOptions = @_calcAttachOptions(model)
      modelViewArgs = @_cloneModelViewArgs()
      modelViewArgs[0].model = model
      modelView = new @modelView(modelViewArgs...)
      @attach modelView, attachOptions
    @


###
* A __FastCollectionView__ is a __CollectionView__ that _doesn't create a view
* per model_. Performance should generally be improved, especially when the
* entire collection must be rendered, as string concatenation is used to touch
* the DOM once.
*
* There are however some caveats as opposed to the regular __CollectionView__.
*
* Normally, __Giraffe__ uses `data-view-cid` to link DOM nodes to view instances.
* The __FastCollectionView__ (__FCV__ from here on) does not use views for its
* models, and as a result the __FCV__ cannot be certain of what its contents are
* unless you and it make an agreement about how you'll handle things. One of the
* best solutions found so far is to agree that each model's template must put
* `data-model-cid` on all top-level DOM elements.
*
* The option `modelEl` can be used to specify where to insert the model html.
* It defaults to `view.$el` and currently cannot contain any elemenets other
* than those automatically created per model by the `FastCollectionView`.
*
* @param {Object} options
*
* - [collection] - {Collection} The collection instance for the `FastCollectionView`. Defaults to a new __Giraffe.Collection__.
* - modelTemplate - {String,Function} Required. The template for each model. Is actually not required if `modelTemplateStrategy` is a function, signaling circumvention of Giraffe's templating help.
* - [modelTemplateStrategy] - {String} The template strategy used for the `modelTemplate`. Can be a function returning a string of HTML to override the need for `modelTemplate` and `modelSerialize`. Defaults to inheriting from the view.
* - [modelSerialize] - {Function} Used to get the data passed to `modelTemplate`. Returns the model by default. Customize by passing as an option or override globally at `Giraffe.Contrib.FastCollectionView.prototype.modelSerialize`.
* - [modelEl] - {Selector,Giraffe.View#ui} The selector or Giraffe.View#ui name for the model template container. Can be a function returning the same. Do not put html in here manually with the current design. Defaults to `view.$el`.
*
* @example
*
*  var FruitView = Giraffe.View.extend({});
*
*  var FruitsView = Giraffe.Contrib.CollectionView.extend({
*    modelTemplate: 'my-fcv-template-id'
*  });
*
*  var view = new FruitsView({
*    collection: [{name: 'apple'}],
*  });
*
*  view.children.length; // => 1
*
*  view.collection.addOne({name: 'banana'});
*
*  view.children.length; // => 2
###
class Contrib.FastCollectionView extends Giraffe.View


  @getDefaults: (ctx) ->
    collection: if ctx.collection then null else new Giraffe.Collection # lazy lood for efficiency
    modelTemplate: null # either this or a `modelTemplateStrategy` function is required
    modelTemplateStrategy: ctx.templateStrategy # inherited by default, can be overridden to directly provide a string without using `template` and `serialize`
    modelSerialize: null # default defined on prototype returns `this.model`; is function returning the data passed to `modelTemplate`; called in the context of `modelTemplateCtx`
    modelEl: null # optional selector or Giraffe.View#ui name to contain the model html
  

  constructor: ->
    super
#ifdef DEBUG
    throw new Error('`modelTemplate` or a `modelTemplateStrategy` function is required') if !@modelTemplate? and !_.isFunction(@modelTemplateStrategy)
#endif
    _.defaults @, @constructor.getDefaults(@)
    @listenTo @collection, 'add', @addOne
    @listenTo @collection, 'remove', @removeOne
    @listenTo @collection, 'reset', @render
    @listenTo @collection, 'sort', @render
    @modelEl = @ui?[@modelEl] or @modelEl if @modelEl # accept a Giraffe.View#ui name or a selector
    @modelTemplateCtx =
      serialize: @modelSerialize
      template: @modelTemplate
    Giraffe.View.setTemplateStrategy @modelTemplateStrategy, @modelTemplateCtx
    @


  # TODO If there was a "rendered" event this wouldn't need to implement afterRender (requiring super calls)
  afterRender: ->
    @$modelEl = if @modelEl then @$(@modelEl) else @$el
#ifdef DEBUG
    throw new Error('`$modelEl` not found after rendering') if !@$modelEl.length
#endif
    @addAll()
    @


  ###
  * Removes `model` from the collection if present and removes its DOM elements.
  ###
  removeOne: (model) ->
    if @collection.contains(model)
      @collection.remove model # falls through
    else
      @removeByCid model.cid
    @


  ###
  * Adds `model` to the collection if not present and renders it to the DOM.
  ###
  addOne: (model) => # TODO could rename this `add` and take an array or object
    if !@collection.contains(model)
      @collection.add model # falls through
    else if !@_renderedOnce # TODO a better way, perhaps add to Giraffe API?
      @render() # falls through
    else
      html = @_renderModel(model)
      @_insertModel html, model
    @


  ###
  * Adds all of the models to the DOM at once. Is destructive to `modelEl`.
  ###
  addAll: ->
    html = ''
    for model in @collection.models
      html += @_renderModel(model)
    @$modelEl.empty().html html # TODO could less efficiently detach only data-model-cid, preserving other elements in `modelEl`
    @


  ###
  * Removes children of `modelEl` by data-model-cid.
  ###
  removeByCid: (cid) ->
    $el = @getElByCid(cid)
#ifdef DEBUG
    throw new Error('Unable to find el with cid ' + cid) if !$el.length
#endif
    $el.remove()
    @


  ###
  * Gets the corresponding model in the collection by a DOM element.
  * Is especially useful in DOM handlers - pass `event.target` to get the model.
  *
  * @param {String/Element/$/Giraffe.View} el
  ###
  getModelByEl: (el) ->
    cid = @getCidByEl(el)
    @collection.get cid


  ###
  * Gets the cid of the model corresponding to `el`.
  ###
  getCidByEl: (el) -> # TODO test with nested collection views
    $el = Giraffe.View.to$El(el, @$modelEl).closest('[data-model-cid]')
    $found = @$modelEl.children($el)
    if $found.length
      $el.data('model-cid')
    else
      @getCidByEl $el


  ###
  * Gets a __jQuery__ object with the el for the model with `cid`.
  ###
  getElByCid: (cid) ->
    @$modelEl.children("[data-model-cid='#{cid}']")


  ###
  * Default serialize function for the model template.
  ###
  modelSerialize: ->
    @model


  ###
  * Generates a model's html string using `modelTemplateCtx` and its options.
  ###
  _renderModel: (model) ->
    @modelTemplateCtx.model = model
    @modelTemplateCtx.templateStrategy()


  ###
  * Inserts a model's html into the DOM smart-like.
  ###
  _insertModel: (html, model) ->
    $existingEl = @getElByCid(model.cid)
    if $existingEl.length
      $existingEl.replaceWith html
    else
      nextModel = @collection.at(@collection.indexOf(model) + 1)
      if nextModel
        $nextModel = @getElByCid(nextModel.cid)
        if $nextModel.length
          $nextModel.before html
        else
          @$modelEl.append html
      else
        @$modelEl.append html
    @