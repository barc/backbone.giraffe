(function() {
  var Contrib,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Contrib = Giraffe.Contrib = {
    version: '0.1.1'
  };

  /*
  * `Backbone.Giraffe.Contrib` is a collection of officially supported classes that are
  * built on top of `Backbone.Giraffe`.
  */


  /*
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
  */


  Contrib.CollectionView = (function(_super) {
    __extends(CollectionView, _super);

    function CollectionView(options) {
      var _ref;
      if (!this.itemView) {
        throw new Error('`itemView` is required');
      }
      if (!(options != null ? (_ref = options.collection) != null ? _ref.model : void 0 : void 0)) {
        throw new Error('`collection.model` is required');
      }
      this.ItemView = this.itemView;
      this.listenTo(options.collection, 'add', this._onAdd);
      this.listenTo(options.collection, 'remove', this._onRemove);
      this.listenTo(options.collection, 'reset', this._onReset);
      this.listenTo(options.collection, 'sort', this._onSort);
      CollectionView.__super__.constructor.apply(this, arguments);
    }

    CollectionView.prototype._onAdd = function(item) {
      var itemView, options;
      options = this._calcAttachOptions(item);
      itemView = new this.ItemView({
        model: item
      });
      return this.attach(itemView, options);
    };

    CollectionView.prototype._onRemove = function(item) {
      var itemView;
      itemView = _.findWhere(this.children, {
        model: item
      });
      return itemView != null ? itemView.dispose() : void 0;
    };

    CollectionView.prototype._onReset = function() {
      this.removeChildren();
      return this.afterRender();
    };

    CollectionView.prototype._onSort = function() {
      this.removeChildren();
      return this.afterRender();
    };

    CollectionView.prototype._calcAttachOptions = function(item) {
      var index, options, pred, predView;
      options = {
        method: 'prepend'
      };
      index = this.collection.indexOf(item);
      if (index > 0) {
        options.method = 'after';
        pred = this.collection.at(index - 1);
        predView = _.findWhere(this.children, {
          model: pred
        });
        options.el = predView;
      }
      return options;
    };

    CollectionView.prototype.afterRender = function() {
      var my;
      my = this;
      return this.collection.each(function(item) {
        return my._onAdd(item);
      });
    };

    return CollectionView;

  })(Giraffe.View);

}).call(this);
