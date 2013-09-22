(function() {
  var Contrib,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Contrib = Giraffe.Contrib = {
    version: '0.1.3'
  };

  /*
  * `Backbone.Giraffe.Contrib` is a collection of officially supported classes that are
  * built on top of `Backbone.Giraffe`.
  */


  /*
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
  */


  Contrib.CollectionView = (function(_super) {
    __extends(CollectionView, _super);

    CollectionView.getDefaults = function(ctx) {
      return {
        collection: ctx.collection ? null : new Giraffe.Collection,
        modelView: Giraffe.View,
        modelViewArgs: null,
        modelViewEl: null
      };
    };

    function CollectionView() {
      this.addOne = __bind(this.addOne, this);
      var _ref;
      CollectionView.__super__.constructor.apply(this, arguments);
      _.defaults(this, this.constructor.getDefaults(this));
      if (!this.modelView) {
        throw new Error('`modelView` is required');
      }
      if (!((_ref = this.collection) != null ? _ref.model : void 0)) {
        throw new Error('`collection.model` is required');
      }
      this.listenTo(this.collection, 'add', this.addOne);
      this.listenTo(this.collection, 'remove', this.removeOne);
      this.listenTo(this.collection, 'reset', this.render);
      this.listenTo(this.collection, 'sort', this.render);
      this;
    }

    CollectionView.prototype._calcAttachOptions = function(model) {
      var i, index, options, prevModel, prevView;
      options = {
        el: null,
        method: 'prepend'
      };
      index = this.collection.indexOf(model);
      i = 1;
      while (prevModel = this.collection.at(index - i)) {
        prevView = _.findWhere(this.children, {
          model: prevModel
        });
        if (prevView != null ? prevView._isAttached : void 0) {
          options.method = 'after';
          options.el = prevView.$el;
          break;
        }
        i++;
      }
      if (!options.el && this.modelViewEl) {
        options.el = this.$(this.modelViewEl);
        if (!options.el.length) {
          throw new Error("`modelViewEl` not found in this view");
        }
      }
      return options;
    };

    CollectionView.prototype._cloneModelViewArgs = function() {
      var args;
      args = this.modelViewArgs || [{}];
      if (_.isFunction("function")) {
        args = args.call(this);
      }
      args = _.clone(args);
      if (!_.isArray(args)) {
        args = [args];
      }
      if (!(_.isArray(args) && _.isObject(args[0]))) {
        throw new Error('`modelViewArgs` must be an array with an object as the first value');
      }
      return args;
    };

    CollectionView.prototype.afterRender = function() {
      this.collection.each(this.addOne);
      return this;
    };

    CollectionView.prototype.removeOne = function(model) {
      var modelView;
      modelView = _.findWhere(this.children, {
        model: model
      });
      if (modelView != null) {
        modelView.dispose();
      }
      return this;
    };

    CollectionView.prototype.addOne = function(model) {
      var attachOptions, modelView, modelViewArgs;
      if (!this.collection.contains(model)) {
        this.collection.add(model);
      } else if (!this._renderedOnce) {
        this.render();
      } else {
        attachOptions = this._calcAttachOptions(model);
        modelViewArgs = this._cloneModelViewArgs();
        modelViewArgs[0].model = model;
        modelView = (function(func, args, ctor) {
          ctor.prototype = func.prototype;
          var child = new ctor, result = func.apply(child, args);
          return Object(result) === result ? result : child;
        })(this.modelView, modelViewArgs, function(){});
        this.attach(modelView, attachOptions);
      }
      return this;
    };

    return CollectionView;

  })(Giraffe.View);

}).call(this);
