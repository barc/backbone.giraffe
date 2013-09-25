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

    CollectionView.prototype.removeOne = function(model, options) {
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
  * best solutions found so far is to agree to not put anything else inside the
  * element that __Giraffe__ put model HTML into, `modelEl`. 
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

    /*
    * Removes `model` from the collection if present and removes its DOM elements.
    */


    FastCollectionView.prototype.removeOne = function(model, collection, options) {
      var index, _ref;
      if (this.collection.contains(model)) {
        this.collection.remove(model);
      } else {
        index = (_ref = options != null ? options.index : void 0) != null ? _ref : options;
        this.removeByIndex(index);
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
        this._insertModelHTML(html, model);
      }
      return this;
    };

    /*
    * Adds all of the models to the DOM at once. Is destructive to `modelEl`.
    */


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

    /*
    * Removes children of `modelEl` by index.
    *
    * @param {Integer} index
    */


    FastCollectionView.prototype.removeByIndex = function(index) {
      var $el;
      $el = this.getElByIndex(index);
      if (!$el.length) {
        throw new Error('Unable to find el with index ' + index);
      }
      $el.remove();
      return this;
    };

    /*
    * Gets the element for `model`.
    *
    * @param {Model} model
    */


    FastCollectionView.prototype.getElByModel = function(model) {
      return this.getElByIndex(this.collection.indexOf(model));
    };

    /*
    * Gets the element inside `modelEl` at `index`.
    *
    * @param {Integer} index
    */


    FastCollectionView.prototype.getElByIndex = function(index) {
      return $(this.$modelEl.children()[index]);
    };

    /*
    * Gets the corresponding model in the collection by a DOM element.
    * Is especially useful in DOM handlers - pass `event.target` to get the model.
    *
    * @param {String/Element/$/Giraffe.View} el
    */


    FastCollectionView.prototype.getModelByEl = function(el) {
      var index;
      index = $(el).closest(this.$modelEl.children()).index();
      return this.collection.at(index);
    };

    /*
    * Default serialize function for the model template.
    */


    FastCollectionView.prototype.modelSerialize = function() {
      return this.model;
    };

    /*
    * Generates a model's html string using `modelTemplateCtx` and its options.
    */


    FastCollectionView.prototype._renderModel = function(model) {
      this.modelTemplateCtx.model = model;
      return this.modelTemplateCtx.templateStrategy();
    };

    /*
    * Inserts a model's html into the DOM by index.
    */


    FastCollectionView.prototype._insertModelHTML = function(html, model) {
      var $children, $existingEl, $prevModel, index, numChildren;
      $children = this.$modelEl.children();
      numChildren = $children.length;
      index = this.collection.indexOf(model);
      if (numChildren === this.collection.length) {
        $existingEl = $($children[index]);
        $existingEl.replaceWith(html);
      } else if (index >= numChildren) {
        this.$modelEl.append(html);
      } else {
        $prevModel = $($children[index - 1]);
        if ($prevModel.length) {
          $prevModel.after(html);
        } else {
          this.$modelEl.append(html);
        }
      }
      return this;
    };

    return FastCollectionView;

  })(Giraffe.View);

}).call(this);
