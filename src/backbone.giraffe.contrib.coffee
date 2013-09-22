Contrib = Giraffe.Contrib =
  version: '{{VERSION}}'

###
* `Backbone.Giraffe.Contrib` is a collection of officially supported classes that are
* built on top of `Backbone.Giraffe`.
###

###
* A __CollectionView__ draws observes a `Collection` rendering each model using
* a provider model view.
*
* @param {Object} options
*
* - collection - {Collection} The collection instance for the `CollectionView`. Defaults to a new __Giraffe.Collection__.
* - modelView - {ViewClass} The view created per model in `collection.models`. Defaults to __Giraffe.View__.
* - modelViewArgs - {Array} The arguments passed to the `modelView` constructor. Can be a function returning an array.
* - modelViewEl - {Selector,Giraffe.View#ui} The container for the model views. Can be a function returning the same. Defaults to `collectionView.$el`.
*
* @example
*
*  var FruitsView = Giraffe.Contrib.CollectionView.extend({
*    modelView: FruitView,
*  });
*
*  var view = new FruitsView({
*    collection: [],
*   });
###
class Contrib.CollectionView extends Giraffe.View


  @getDefaults: (ctx) ->
    collection: if ctx.collection then null else new Giraffe.Collection # lazy lood for efficiency
    modelView: Giraffe.View
    modelViewEl: null # optional selector or Giraffe.View#ui name to contain the model views
    modelViewArgs: null # optional array of arguments passed to modelView constructor (or function returning the same)
  

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
    @modelViewEl = @ui?[@modelViewEl] or @modelViewEl # accept a Giraffe.View#ui name or a selector
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
      if prevView?._isAttached # make sure the prev view has been attached
        options.method = 'after'
        options.el = prevView.$el
        break
      i++
    if !options.el and @modelViewEl # lazy loaded for efficiency
      options.el = @$(@modelViewEl)
#ifdef DEBUG
      throw new Error("`modelViewEl` not found in this view") if !options.el.length
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
    modelView = _.findWhere(@children,  model: model)
    modelView?.dispose()
    @


  addOne: (model) =>
    if !@collection.contains(model)
      @collection.add model # falls through
    else if !@_renderedOnce
      @render() # falls through
    else
      attachOptions = @_calcAttachOptions(model)
      modelViewArgs = @_cloneModelViewArgs()
      modelViewArgs[0].model = model
      modelView = new @modelView(modelViewArgs...)
      @attach modelView, attachOptions
    @