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
*  view.collection.add({name: 'banana'});
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
    @addOne m for m in @collection.models
    @


  removeOne: (model, options) ->
    if @collection.contains(model)
      @collection.remove model # falls through
    else
      modelView = _.findWhere(@children, {model})
      modelView?.dispose()
    @


  addOne: (model) ->
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
* the DOM once. [Here's a jsPerf with more.](http://jsperf.com/collection-views-in-giraffe-and-marionette/2)
*
* The option `modelEl` can be used to specify where to insert the model html.
* It defaults to `view.$el` and cannot contain any DOM elemenets other
* than those automatically created per model by the `FastCollectionView`.
*
* The option `modelTemplate` is the only required one and it is used to create
* the html per model. ___`modelTemplate` must return a single top-level DOM node
* per call.___ The __FVC__ uses a similar templating system to the
* __Giraffe.View__, but instead of defining `template` and an optional 
* `serialize` and templateStrategy`, __FVC__ takes  `modelTemplate` and optional
* `modelSerialize` and `modelTemplateStrategy`. As in __Giraffe.View__,
* setting `modelTemplateStrategy` to a function bypasses Giraffe's usage
* of `modelTemplate` and `modelSerialize`.
*
* The __FVC__ reacts to the events `'add'`, `'remove'`, `'reset`', and `'sort'`.
* It should keep `modelEl` in sync wih the collection with a template per model.
* The __FVC__ API also exposes a shortcut to manipulating the collection with 
* `addOne` and `removeOne`.
*
* @param {Object} options
*
* - [collection] - {Collection} The collection instance for the `FastCollectionView`. Defaults to a new __Giraffe.Collection__.
* - modelTemplate - {String,Function} Required. The template for each model. Must return exactly 1 top level DOM element per call. Is actually not required if `modelTemplateStrategy` is a function, signaling circumvention of Giraffe's templating help.
* - [modelTemplateStrategy] - {String} The template strategy used for the `modelTemplate`. Can be a function returning a string of HTML to override the need for `modelTemplate` and `modelSerialize`. Defaults to inheriting from the view.
* - [modelSerialize] - {Function} Used to get the data passed to `modelTemplate`. Returns the model by default. Customize by passing as an option or override globally at `Giraffe.Contrib.FastCollectionView.prototype.modelSerialize`.
* - [modelEl] - {Selector,Giraffe.View#ui} The selector or Giraffe.View#ui name for the model template container. Can be a function returning the same. Do not put html in here manually with the current design. Defaults to `view.$el`.
*
* @example
*
*  var FruitsView = Giraffe.Contrib.CollectionView.extend({
*    modelTemplate: 'my-fcv-template-id'
*  });
*
*  var view = new FruitsView({
*    collection: [{name: 'apple'}],
*  });
*
*  view.$el.children().length; // => 1
*
*  var banana = new Backbone.Model({name: 'banana'});
*
*  view.collection.add(banana);
*  // or
*  // view.addOne(banana);
*
*  view.$el.children().length; // => 2
*
*  view.collection.remove(banana);
*  // or
*  // view.removeOne(banana);
*
*  view.$el.children().length; // => 1
###
class Contrib.FastCollectionView extends Giraffe.View


  @getDefaults: (ctx) ->
    collection: if ctx.collection then null else new Giraffe.Collection # lazy lood for efficiency
    modelTemplate: null # either this or a `modelTemplateStrategy` function is required
    modelTemplateStrategy: ctx.templateStrategy # inherited by default, can be overridden to directly provide a string without using `template` and `serialize`
    modelSerialize: ctx.modelSerialize # default defined on prototype returns `this.model`; is function returning the data passed to `modelTemplate`; called in the context of `modelTemplateCtx`
    modelEl: null # optional selector or Giraffe.View#ui name to contain the model html
  

  constructor: ->
    super
#ifdef DEBUG
    throw new Error('`modelTemplate` or a `modelTemplateStrategy` function is required') if !@modelTemplate? and !_.isFunction(@modelTemplateStrategy)
#endif
    _.defaults @, @constructor.getDefaults(@)
    @listenTo @collection, 'add', @addOne
    @listenTo @collection, 'remove', @removeOne
    @listenTo @collection, 'reset sort', @render
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
  removeOne: (model, collection, options) ->
    if @collection.contains(model)
      @collection.remove model # falls through
    else
      index = options?.index ? options
      @removeByIndex index
    @


  ###
  * Adds `model` to the collection if not present and renders it to the DOM.
  ###
  addOne: (model) ->
    if !@collection.contains(model)
      @collection.add model # falls through
    else if !@_renderedOnce # TODO a better way, perhaps add to Giraffe API?
      @render() # falls through
    else
      html = @_renderModel(model)
      @_insertModelHTML html, model
    @


  ###
  * Adds all of the models to the DOM at once. Is destructive to `modelEl`.
  ###
  addAll: ->
    html = ''
    for model in @collection.models
      html += @_renderModel(model)
    @$modelEl.empty().html html
    @


  ###
  * Removes children of `modelEl` by index.
  *
  * @param {Integer} index
  ###
  removeByIndex: (index) ->
    $el = @getElByIndex(index)
#ifdef DEBUG
    throw new Error('Unable to find el with index ' + index) if !$el.length
#endif
    $el.remove()
    @


  ###
  * Gets the element for `model`.
  *
  * @param {Model} model
  ###
  getElByModel: (model) ->
    @getElByIndex @collection.indexOf(model)


  ###
  * Gets the element inside `modelEl` at `index`.
  *
  * @param {Integer} index
  ###
  getElByIndex: (index) ->
    $(@$modelEl.children()[index])


  ###
  * Gets the corresponding model in the collection by a DOM element.
  * Is especially useful in DOM handlers - pass `event.target` to get the model.
  *
  * @param {String/Element/$/Giraffe.View} el
  ###
  getModelByEl: (el) ->
    index = $(el).closest(@$modelEl.children()).index()
    @collection.at index


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
  * Inserts a model's html into the DOM.
  ###
  _insertModelHTML: (html, model) ->
    $children = @$modelEl.children()
    numChildren = $children.length
    index = @collection.indexOf(model)
    if numChildren is @collection.length
      $existingEl = $($children[index])
      $existingEl.replaceWith html
    else if index >= numChildren
      @$modelEl.append html
    else
      $prevModel = $($children[index - 1])
      if $prevModel.length
        $prevModel.after html
      else
        @$modelEl.append html
    @