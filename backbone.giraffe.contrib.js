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
  * built on top of `Backbone.Giraffe`. These classes should be considered
  * experimental as their APIs are subject to undocumented changes.
  */


  /*
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
      var _ref, _ref1;
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
      if (this.modelViewEl) {
        this.modelViewEl = ((_ref1 = this.ui) != null ? _ref1[this.modelViewEl] : void 0) || this.modelViewEl;
      }
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
          throw new Error('`modelViewEl` not found in this view');
        }
      }
      return options;
    };

    CollectionView.prototype._cloneModelViewArgs = function() {
      var args;
      args = this.modelViewArgs || [{}];
      if (_.isFunction(args)) {
        args = args.call(this);
      }
      if (!_.isArray(args)) {
        args = [args];
      }
      args = _.map(args, _.clone);
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
      if (this.collection.contains(model)) {
        this.collection.remove(model);
      } else {
        modelView = _.findWhere(this.children, {
          model: model
        });
        if (modelView != null) {
          modelView.dispose();
        }
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

  /*
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
  * best solutions found so far is to agree that `modelTemplate` must put
  * `data-model-cid` on all top-level DOM elements.
  * on this node. So if you want __FCV__, here are the rules:
  *
  * 0. `modelTemplate` must return HTML wrapped up inside a single node
  * 0. you must put the attribute `data-model-cid` on the top level node returned from `modelTemplate`
  *
  * Be aware that the first rendered template is _appended_ to `modelEl`.
  *
  * @param {Object} options
  *
  * - [collection] - {Collection} The collection instance for the `FastCollectionView`. Defaults to a new __Giraffe.Collection__.
  * - modelTemplate - {String,Function} Required. The template for each model.
  * - [modelTemplateStrategy] - {String} The template strategy used for the `modelTemplate`. Can be a function returning a string of HTML to override the need for `modelTemplate` and `modelSerialize`. Defaults to inheriting from the view.
  * - [modelSerialize] - {Function} Used to get the data passed to `modelTemplate`. Returns the model by default. Customize by passing as an option or override globally at `Giraffe.Contrib.FastCollectionView.prototype.modelSerialize`.
  * - [modelEl] - {Selector,Giraffe.View#ui} The selector or Giraffe.View#ui name for the model template container. Can be a function returning the same. Defaults to `fastCollectionView.$el`.
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
  */


  Contrib.FastCollectionView = (function(_super) {
    __extends(FastCollectionView, _super);

    FastCollectionView.getDefaults = function(ctx) {
      return {
        collection: ctx.collection ? null : new Giraffe.Collection,
        modelTemplate: null,
        modelTemplateStrategy: ctx.templateStrategy,
        modelSerialize: null,
        modelEl: null
      };
    };

    function FastCollectionView() {
      this.addOne = __bind(this.addOne, this);
      var _ref;
      FastCollectionView.__super__.constructor.apply(this, arguments);
      if ((this.modelTemplate == null) && !_.isFunction(this.modelTemplateStrategy)) {
        throw new Error('`modelTemplate` or a `modelTemplateStrategy` function is required');
      }
      _.defaults(this, this.constructor.getDefaults(this));
      this.listenTo(this.collection, 'add', this.addOne);
      this.listenTo(this.collection, 'remove', this.removeOne);
      this.listenTo(this.collection, 'reset', this.render);
      this.listenTo(this.collection, 'sort', this.render);
      if (this.modelEl) {
        this.modelEl = ((_ref = this.ui) != null ? _ref[this.modelEl] : void 0) || this.modelEl;
      }
      this.modelTemplateCtx = {
        serialize: this.modelSerialize,
        template: this.modelTemplate
      };
      Giraffe.View.setTemplateStrategy(this.modelTemplateStrategy, this.modelTemplateCtx);
      this;
    }

    FastCollectionView.prototype.afterRender = function() {
      this.$modelEl = this.modelEl ? this.$(this.modelEl) : this.$el;
      if (!this.$modelEl.length) {
        throw new Error('`$modelEl` not found after rendering');
      }
      this.addAll();
      return this;
    };

    FastCollectionView.prototype.removeOne = function(model) {
      if (this.collection.contains(model)) {
        this.collection.remove(model);
      } else {
        this.removeByCid(model.cid);
      }
      return this;
    };

    /*
    * Adds `model` to the collection if not present and renders it to the DOM.
    */


    FastCollectionView.prototype.addOne = function(model) {
      var html;
      if (!this.collection.contains(model)) {
        this.collection.add(model);
      } else if (!this._renderedOnce) {
        this.render();
      } else {
        html = this._renderModel(model);
        this._insertModel(html, model);
      }
      return this;
    };

    FastCollectionView.prototype.addAll = function() {
      var html, model, _i, _len, _ref;
      html = '';
      _ref = this.collection.models;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        model = _ref[_i];
        html += this._renderModel(model);
      }
      this.$modelEl.empty().html(html);
      return this;
    };

    FastCollectionView.prototype.removeByCid = function(cid) {
      var $el;
      $el = this.getElByCid(cid);
      if (!$el.length) {
        throw new Error('Unable to find el with cid ' + cid);
      }
      $el.remove();
      return this;
    };

    /*
    * Gets the corresponding model in the collection by a DOM element.
    * Is especially useful in DOM handlers - pass `event.target` to get the model.
    *
    * @param {String/Element/$/Giraffe.View} el
    */


    FastCollectionView.prototype.getModelByEl = function(el) {
      var cid;
      cid = this.getCidByEl(el);
      return this.collection.get(cid);
    };

    /*
    * Gets the cid of the model corresponding to `el`.
    */


    FastCollectionView.prototype.getCidByEl = function(el) {
      var $el, $found;
      $el = Giraffe.View.to$El(el, this.$modelEl).closest('[data-model-cid]');
      $found = this.$modelEl.children($el);
      if ($found.length) {
        return $el.data('model-cid');
      } else {
        return this.getCidByEl($el);
      }
    };

    /*
    * Gets a __jQuery__ object with the el for the model with `cid`.
    */


    FastCollectionView.prototype.getElByCid = function(cid) {
      return this.$modelEl.children("[data-model-cid='" + cid + "']");
    };

    /*
    * Default serialize function for the model template.
    */


    FastCollectionView.prototype.modelSerialize = function() {
      return this.model;
    };

    FastCollectionView.prototype._renderModel = function(model) {
      this.modelTemplateCtx.model = model;
      return this.modelTemplateCtx.templateStrategy();
    };

    FastCollectionView.prototype._insertModel = function(html, model) {
      var $existingEl, $nextModel, nextModel;
      $existingEl = this.getElByCid(model.cid);
      if ($existingEl.length) {
        $existingEl.replaceWith(html);
      } else {
        nextModel = this.collection.at(this.collection.indexOf(model) + 1);
        if (nextModel) {
          $nextModel = this.getElByCid(nextModel.cid);
          if ($nextModel.length) {
            $nextModel.before(html);
          } else {
            this.$modelEl.append(html);
          }
        } else {
          this.$modelEl.append(html);
        }
      }
      return this;
    };

    return FastCollectionView;

  })(Giraffe.View);

}).call(this);
