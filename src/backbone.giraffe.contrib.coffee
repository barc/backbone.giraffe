Contrib = Giraffe.Contrib =
  version: '{{VERSION}}'

###
* `Backbone.Giraffe.Contrib` is a collection of officially supported classes that are
* built on top of `Backbone.Giraffe`.
###

###
* A __CollectionView__ draws observes a `Collection` rendering each item using
* a provider item view.
*
* @param {Object} options
*
* - itemView
* - collection
*
* @example
*
*  var FruitsView = Giraffe.Contrib.CollectionView.extend({
*    itemView: FruitView,
*  });
*
*  var view = new FruitsView({
*    collection: [],
*   });
###

class Contrib.CollectionView extends Giraffe.View
  constructor: (options) ->
#ifdef DEBUG
    throw new Error('`itemView` is required') unless @itemView
    throw new Error('`collection.model` is required') unless options?.collection?.model
#endif
    @ItemView = @itemView
    @listenTo options.collection, 'add', @_onAdd
    @listenTo options.collection, 'remove', @_onRemove
    @listenTo options.collection, 'reset', @_onReset
    @listenTo options.collection, 'sort', @_onSort
    super


  _onAdd: (item) ->
    options = @_calcAttachOptions(item)
    itemView = new @ItemView(model: item)
    @attach itemView, options


  _onRemove: (item) ->
    itemView = _.findWhere(@children,  model: item)
    itemView?.dispose()


  _onReset: ->
    @removeChildren()
    @afterRender()


  _onSort: ->
    @removeChildren()
    @afterRender()


  _calcAttachOptions: (item) ->
    options =
      method: 'prepend'
    index = @collection.indexOf(item)
    if index > 0
      options.method = 'after'
      pred = this.collection.at(index - 1)
      predView = _.findWhere(@children, model: pred)
      options.el = predView
    options

  afterRender: ->
    my = @
    @collection.each (item) ->
      my._onAdd item

