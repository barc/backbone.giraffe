(function() {
  var $, Backbone, Giraffe, error, _setEventBindings, _setEventMapBindings,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  if (typeof global !== "undefined" && global !== null) {
    Backbone = require('backbone');
    $ = require('jQuery');
  } else {
    Backbone = window.Backbone;
    $ = Backbone.$;
  }

  Backbone.Giraffe = Giraffe = {
    app: null,
    apps: {},
    views: {}
  };

  if (typeof window !== "undefined" && window !== null) {
    window.Giraffe = Giraffe;
  }

  error = function() {
    var _ref, _ref1;
    return typeof console !== "undefined" && console !== null ? (_ref = console.error) != null ? _ref.apply(console, (_ref1 = ['Backbone.Giraffe error:']).concat.apply(_ref1, arguments)) : void 0 : void 0;
  };

  /*
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
  * can set the cached view's `options.disposeOnDetach` to `false`.
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
  * @param {Object} [options]
  */


  Giraffe.View = (function(_super) {
    __extends(View, _super);

    View.defaultOptions = {
      disposeOnDetach: true,
      alwaysRender: false,
      saveScrollPosition: false,
      documentTitle: null,
      templateStrategy: null
    };

    function View(options) {
      if (options == null) {
        options = {};
      }
      this.render = __bind(this.render, this);
      _.defaults(options, Giraffe.View.defaultOptions);
      this.app || (this.app = options.app || Giraffe.app);
      Giraffe.bindEventMap(this, this.app, this.appEvents);
      /*
      * When one view is attached to another, the child view is added to the
      * parent's `children` array. When `dispose` is called on a view, it disposes
      * of all `children`, enabling the teardown of a single view or an entire app
      * with one method call. Any object with a `dispose` method can be added
      * to a view's `children` via `addChild` to take advantage of lifecycle
      * management.
      */

      this.children = [];
      /*
      * Child views attached via `attachTo` have a reference to their parent view.
      */

      this.parent = null;
      this._renderedOnce = false;
      this._isAttached = false;
      this._createEventsFromUIElements();
      this._wrapInitialize();
      if (options.templateStrategy) {
        Giraffe.View.setTemplateStrategy(options.templateStrategy, this);
      } else if (typeof this.templateStrategy === 'string') {
        Giraffe.View.setTemplateStrategy(this.templateStrategy, this);
      }
      View.__super__.constructor.call(this, options);
    }

    View.prototype._wrapInitialize = function() {
      var _this = this;
      return this.initialize = _.wrap(this.initialize, function(initialize) {
        _this._cache();
        _this.$el.attr('data-view-cid', _this.cid);
        _this.setParent(Giraffe.View.getClosestView(_this.$el));
        _this._cacheUiElements();
        initialize.apply(_this, Array.prototype.slice.call(arguments, 1));
        return _this._bindDataEvents();
      });
    };

    View.prototype._attachMethods = ['append', 'prepend', 'html', 'after', 'before', 'insertAfter', 'insertBefore'];

    View.prototype._siblingAttachMethods = ['after', 'before', 'insertAfter', 'insertBefore'];

    /*
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
    */


    View.prototype.attachTo = function(el, options) {
      var $container, $el, forceRender, method, shouldRender, suppressRender;
      method = (options != null ? options.method : void 0) || 'append';
      forceRender = (options != null ? options.forceRender : void 0) || false;
      suppressRender = (options != null ? options.suppressRender : void 0) || false;
      if (!this.$el) {
        error('Trying to attach a disposed view. Make a new one or create the view with the option `disposeOnDetach` set to false.', this);
        return this;
      }
      if (!_.contains(this._attachMethods, method)) {
        error("The attach method '" + method + "' isn't supported. Defaulting to 'append'.", method, this._attachMethods);
        method = 'append';
      }
      $el = Giraffe.View.to$El(el);
      if (!$el) {
        error('No such `el` to attach to', el);
        return this;
      }
      $container = _.contains(this._siblingAttachMethods, method) ? $el.parent() : $el;
      if (method === 'insertAfter') {
        method = 'after';
      }
      if (method === 'insertBefore') {
        method = 'before';
      }
      if ($el.length !== 1) {
        error('Expected to render to a single element but found ' + $el.length, el);
        return this;
      }
      this.detach(true);
      this.setParent(Giraffe.View.getClosestView($container));
      if (method === 'html') {
        Giraffe.View.detachByEl($el);
        $el.empty();
      }
      $el[method](this.$el);
      this._isAttached = true;
      shouldRender = !suppressRender && (!this._renderedOnce || forceRender || this.options.alwaysRender);
      if (shouldRender) {
        this.render(options);
      }
      if (this.options.saveScrollPosition) {
        this._loadScrollPosition();
      }
      if (this.options.documentTitle != null) {
        document.title = this.options.documentTitle;
      }
      return this;
    };

    /*
    * `attach` is an inverted way to call `attachTo`. Unlike `attachTo`, calling
    * this function requires a parent view. It's here only for aesthetics. Takes
    * the same `options` as `attachTo` in addition to the optional `options.el`,
    * which is the first argument passed to `attachTo`, defaulting to the parent
    * view.
    *
    * @param {View} view
    * @param {Object} [options]
    * @caption parentView.attach(childView, [options])
    */


    View.prototype.attach = function(view, options) {
      var childEl, el;
      if (options != null ? options.el : void 0) {
        el = Giraffe.View.to$El(options.el);
        childEl = this.$el.find(el);
        if (childEl.length) {
          view.attachTo(childEl, options);
        } else if (this.$el.is(el)) {
          view.attachTo(this.$el, options);
        } else {
          error('Attempting to attach to an element that doesn\'t exist inside this view!', options, view, this);
        }
      } else {
        view.attachTo(this.$el, options);
      }
      return this;
    };

    /*
    * __Giraffe__ implements `render` so it can do some helpful things, but you can
    * still call it like you normally would. By default, `render` uses a view's
    * `template`, which is the DOM selector of an __Underscore__ template, but
    * this is easily configured. See [`Giraffe.View#template`](#View-template),
    * [`Giraffe.View.setTemplateStrategy`](#View-setTemplateStrategy), and
    * [`Giraffe.View#templateStrategy`](#View-templateStrategy) for more.
    *
    * @caption Do not override unless you know what you're doing!
    */


    View.prototype.render = function(options) {
      this.beforeRender.apply(this, arguments);
      this._renderedOnce = true;
      this.detachChildren(options != null ? options.preserve : void 0);
      this.$el.empty().html(this.templateStrategy() || '');
      this._cacheUiElements();
      this.afterRender.apply(this, arguments);
      return this;
    };

    /*
    * This is an empty function for you to implement. Less commonly used than
    * `afterRender`, but helpful in circumstances where the DOM has state that
    * needs to be preserved across renders. For example, if a view with a dropdown
    * menu is rendering, you may want to save its open state in `beforeRender`
    * and reapply it in `afterRender`.
    *
    * @caption Implement this function in your views.
    */


    View.prototype.beforeRender = function() {};

    /*
    * This is an empty function for you to implement. After a view renders,
    * `afterRender` is called. Child views are normally attached to the DOM here.
    * Views that are cached by setting `options.disposeOnDetach` to true will be
    * in `view.children` in `afterRender`, but will not be attached to the
    * parent's `$el`.
    *
    * @caption Implement this function in your views.
    */


    View.prototype.afterRender = function() {};

    /*
    * __Giraffe__ implements its own `render` function which calls `templateStrategy`
    * to get the HTML string to put inside `view.$el`. Your views can either
    * define a `template`, which uses __Underscore__ templates by default and is
    * customizable via [`Giraffe.View#setTemplateStrategy`](#View-setTemplateStrategy),
    * or override `templateStrategy` with a function returning a string of HTML
    * from your favorite templating engine. See the
    * [_Template Strategies_ example](templateStrategies.html) for more.
    */


    View.prototype.templateStrategy = function() {
      return '';
    };

    /*
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
    */


    View.prototype.template = null;

    /*
    * Gets the data passed to the `template`. Returns the view by default.
    *
    * @caption Override this function to pass custom data to a view's `template`.
    */


    View.prototype.serialize = function() {
      return this;
    };

    /*
    * Detaches the view from the DOM. If `view.options.disposeOnDetach` is true,
    * which is the default, `dispose` will be called on the view and its
    * `children` unless `preserve` is true. `preserve` defaults to false. When
    * a view renders, it first calls `detach(false)` on the views inside its `$el`.
    *
    * @param {Boolean} [preserve] If true, doesn't dispose of the view, even if `disposeOnDetach` is `true`.
    */


    View.prototype.detach = function(preserve) {
      if (preserve == null) {
        preserve = false;
      }
      if (!this._isAttached) {
        return this;
      }
      this._isAttached = false;
      if (this.options.saveScrollPosition) {
        this._saveScrollPosition();
      }
      this.$el.detach();
      if (this.options.disposeOnDetach && !preserve) {
        this.dispose();
      }
      return this;
    };

    /*
    * Calls `detach` on each object in `children`, passing `preserve` through.
    *
    * @param {Boolean} [preserve]
    */


    View.prototype.detachChildren = function(preserve) {
      var child, _i, _len, _ref;
      if (preserve == null) {
        preserve = false;
      }
      _ref = this.children.slice();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (typeof child.detach === "function") {
          child.detach(preserve);
        }
      }
      return this;
    };

    View.prototype._saveScrollPosition = function() {
      return this._scrollPosition = this._getScrollPositionEl().scrollTop();
    };

    View.prototype._loadScrollPosition = function() {
      if (this._scrollPosition != null) {
        return this._getScrollPositionEl().scrollTop(this._scrollPosition);
      }
    };

    View.prototype._getScrollPositionEl = function() {
      switch (typeof this.options.saveScrollPosition) {
        case 'string':
          return this.$(this.options.saveScrollPosition).first();
        case 'object':
          return $(this.options.saveScrollPosition);
        default:
          return this.$el;
      }
    };

    /*
    * Adds `child` to this view's `children` and assigns this view as
    * `child.parent`. If `child` implements `dispose`, it will be called when the
    * view is disposed. If `child` implements `detach`, it will be called before
    * the view renders.
    *
    * @param {Object} child
    */


    View.prototype.addChild = function(child) {
      var _ref;
      if (!_.contains(this.children, child)) {
        if ((_ref = child.parent) != null) {
          _ref.removeChild(child, true);
        }
        child.parent = this;
        this.children.push(child);
      }
      return this;
    };

    /*
    * Calls `addChild` on the given array of objects.
    *
    * @param {Array} children Array of objects
    */


    View.prototype.addChildren = function(children) {
      var child, _i, _len;
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        child = children[_i];
        this.addChild(child);
      }
      return this;
    };

    /*
    * Removes an object from this view's `children`. If `preserve` is `false`, the
    * default, __Giraffe__ will attempt to call `dispose` on the child. If
    * `preserve` is true, __Giraffe__ will attempt to call `detach(true)` on the
    * child.
    *
    * @param {Object} child
    * @param {Boolean} [preserve] If `true`, Giraffe attempts to call `detach` on the child, otherwise it attempts to call `dispose` on the child. Is `false` by default.
    */


    View.prototype.removeChild = function(child, preserve) {
      var index;
      if (preserve == null) {
        preserve = false;
      }
      index = _.indexOf(this.children, child);
      if (index > -1) {
        this.children.splice(index, 1);
        child.parent = null;
        if (preserve) {
          if (typeof child.detach === "function") {
            child.detach(true);
          }
        } else {
          if (typeof child.dispose === "function") {
            child.dispose();
          }
        }
      }
      return this;
    };

    /*
    * Calls `removeChild` on all `children`, passing `preserve` through.
    *
    * @param {Boolean} [preserve] If `true`, detaches rather than removes the children.
    */


    View.prototype.removeChildren = function(preserve) {
      var child, _i, _len, _ref;
      if (preserve == null) {
        preserve = false;
      }
      _ref = this.children.slice();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        this.removeChild(child, preserve);
      }
      return this;
    };

    /*
    * Sets a new parent for a view, first removing any current parent-child
    * relationship. `parent` can be falsy to remove the current parent.
    *
    * @param {Giraffe.View} [parent]
    */


    View.prototype.setParent = function(parent) {
      if (parent && parent !== this) {
        parent.addChild(this);
      } else if (this.parent) {
        this.parent.removeChild(this, true);
        this.parent = null;
      }
      return this;
    };

    /*
    * If `el` is `null` or `undefined`, tests if the view is somewhere on the DOM
    * by calling `$(document).find(view.$el)`. If `el` is defined, tests if `el`
    * is the immediate parent of `view.$el`.
    *
    * @param {String} [el] Optional selector, DOM element, or view to test against the view's immediate parent.
    * @returns {Boolean}
    */


    View.prototype.isAttached = function(el) {
      if (el != null) {
        if (el.$el) {
          return this.parent === el;
        } else {
          return this.$el.parent().is(el);
        }
      } else {
        return $(document).find(this.$el).length > 0;
      }
    };

    /*
    * The `ui` object maps names to selectors, e.g.
    * `{$someName: '#some-selector'}`. If a view defines `ui`, the __jQuery__
    * objects it names will be cached and updated every `render`. For example,
    * declaring `this.ui = {$button: '#button'}` in a view makes `this.$button`
    * always available once `render` has been called. Typically the selector
    * value is a string, but if it's function, its return value will be assigned,
    * and if it's neither a string or a function, the value itself is assigned.
    */


    View.prototype.ui = null;

    View.prototype._cacheUiElements = function() {
      var name, selector, _ref;
      if (this.ui) {
        _ref = this.ui;
        for (name in _ref) {
          selector = _ref[name];
          this[name] = (function() {
            switch (typeof selector) {
              case 'string':
                return this.$(selector);
              case 'function':
                return selector();
              default:
                return selector;
            }
          }).call(this);
        }
      }
      return this;
    };

    View.prototype._uncacheUiElements = function() {
      var name, selector, _ref;
      if (!this.ui) {
        return this;
      }
      _ref = this.ui;
      for (name in _ref) {
        selector = _ref[name];
        delete this[name];
      }
      return this;
    };

    View.prototype._createEventsFromUIElements = function() {
      var eventKey, method, newEventKey, _ref;
      if (!(this.events && this.ui)) {
        return this;
      }
      if (typeof this.ui === 'function') {
        this.ui = this.ui();
      }
      if (typeof this.events === 'function') {
        this.events = this.events();
      }
      _ref = this.events;
      for (eventKey in _ref) {
        method = _ref[eventKey];
        newEventKey = this._getEventKeyFromUIElements(eventKey);
        if (newEventKey !== eventKey) {
          delete this.events[eventKey];
          this.events[newEventKey] = method;
        }
      }
      return this;
    };

    View.prototype._getEventKeyFromUIElements = function(eventKey) {
      var lastPart, length, parts, uiTarget;
      parts = eventKey.split(' ');
      length = parts.length;
      if (length < 2) {
        return eventKey;
      }
      lastPart = parts[length - 1];
      uiTarget = this.ui[lastPart];
      if (uiTarget) {
        parts[length - 1] = uiTarget;
        return parts.join(' ');
      } else {
        return eventKey;
      }
    };

    View.prototype._bindDataEvents = function() {
      var cb, eventKey, eventName, pieces, targetObj, _ref;
      if (!this.dataEvents) {
        return this;
      }
      if (typeof this.dataEvents === 'function') {
        this.dataEvents = this.dataEvents();
      }
      _ref = this.dataEvents;
      for (eventKey in _ref) {
        cb = _ref[eventKey];
        pieces = eventKey.split(' ');
        if (pieces.length < 2) {
          error('Data event must specify target object, ex: {\'change collection\': \'handler\'}');
          continue;
        }
        targetObj = pieces.pop();
        targetObj = targetObj === 'this' || targetObj === '@' ? this : this[targetObj];
        if (!targetObj) {
          error("Unknown taget object " + targetObj + " for data event", eventKey);
          continue;
        }
        eventName = pieces.join(' ');
        Giraffe.bindEvent(this, targetObj, eventName, cb);
      }
      return this;
    };

    View.prototype._uncache = function() {
      delete Giraffe.views[this.cid];
      return this;
    };

    View.prototype._cache = function() {
      Giraffe.views[this.cid] = this;
      return this;
    };

    /*
    * Calls `methodName` on the view, or if not found, up the view hierarchy until
    * it either finds the method or fails on a view without a `parent`. Used by
    * __Giraffe__ to call the methods defined for the events bound in
    * `Giraffe.View.setDocumentEvents`.
    *
    * @param {String} methodName
    * @param {Any} [args...]
    */


    View.prototype.invoke = function() {
      var args, methodName, view;
      methodName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      view = this;
      while (view && !view[methodName]) {
        view = view.parent;
      }
      if (view != null ? view[methodName] : void 0) {
        return view[methodName].apply(view, args);
      } else {
        error('No such method name in view hierarchy', methodName, args, this);
        return true;
      }
    };

    /*
    * See [`Giraffe.App#appEvents`](#App-appEvents).
    */


    View.prototype.appEvents = null;

    /*
    * Destroys a view, unbinding its events and freeing its resources. Calls
    * `Backbone.View#remove` and calls `dispose` on all `children`.
    */


    View.prototype.dispose = function() {
      return Giraffe.dispose(this, function() {
        this.setParent(null);
        this.removeChildren();
        this._uncacheUiElements();
        this._uncache();
        if (this.$el) {
          this.remove();
          return this.$el = null;
        } else {
          return error("Disposed of a view that has already been disposed", this);
        }
      });
    };

    /*
    * Detaches the top-level views inside `el`, which can be a selector, element,
    * or __Giraffe.View__. Used internally by __Giraffe__ to remove views that
    * would otherwise be clobbered when the option `method: 'html'` is used
    * in `attachTo`. Uses the `data-view-cid` attribute to match DOM nodes to view
    * instances.
    *
    * @param {String/Element/Giraffe.View} el
    * @param {Boolean} [preserve]
    */


    View.detachByEl = function(el, preserve) {
      var $child, $el, cid, view;
      if (preserve == null) {
        preserve = false;
      }
      $el = Giraffe.View.to$El(el);
      while (($child = $el.find('[data-view-cid]:first')).length) {
        cid = $child.attr('data-view-cid');
        view = Giraffe.View.getByCid(cid);
        view.detach(preserve);
      }
      return this;
    };

    /*
    * Gets the closest parent view of `el`, which can be a selector, element, or
    * __Giraffe.View__. Uses the `data-view-cid` attribute to match DOM nodes to
    * view instances.
    *
    * @param {String/Element/Giraffe.View} el
    */


    View.getClosestView = function(el) {
      var $el, cid;
      $el = Giraffe.View.to$El(el);
      cid = $el.closest('[data-view-cid]').attr('data-view-cid');
      return Giraffe.View.getByCid(cid);
    };

    /*
    * Looks up a view from the cache by `cid`, returning undefined if not found.
    *
    * @param {String} cid
    */


    View.getByCid = function(cid) {
      return Giraffe.views[cid];
    };

    View.to$El = function(el) {
      return (el != null ? el.$el : void 0) || (el instanceof $ ? el : $(el));
    };

    /*
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
    */


    View.setDocumentEvents = function(events) {
      var event, _i, _len, _results;
      if (typeof events === 'string') {
        events = events.split(' ');
      }
      if (!_.isArray(events)) {
        events = [events];
      }
      events = _.compact(events);
      Giraffe.View.removeDocumentEvents();
      Giraffe.View._currentDocumentEvents = events;
      _results = [];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        event = events[_i];
        _results.push((function(event) {
          return $(document).on(event, "[data-gf-" + event + "]", function(e) {
            var $target, method, view;
            $target = $(e.target).closest("[data-gf-" + event + "]");
            method = $target.attr("data-gf-" + event);
            view = Giraffe.View.getClosestView($target);
            return view.invoke(method, e);
          });
        })(event));
      }
      return _results;
    };

    /*
    * Equivalent to `Giraffe.View.setDocumentEvents(null)`.
    */


    View.removeDocumentEvents = function() {
      var event, _i, _len, _ref, _ref1;
      if (!((_ref = Giraffe.View._currentDocumentEvents) != null ? _ref.length : void 0)) {
        return;
      }
      _ref1 = Giraffe.View._currentDocumentEvents;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        event = _ref1[_i];
        $(document).off(event, "[data-gf-" + event + "]");
      }
      return Giraffe.View._currentDocumentEvents = null;
    };

    /*
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
    */


    View.setTemplateStrategy = function(strategy, instance) {
      var strategyType, templateStrategy;
      strategyType = typeof strategy;
      if (strategyType === 'function') {
        templateStrategy = strategy;
      } else if (strategyType !== 'string') {
        return error('Unrecognized template strategy', strategy);
      } else {
        switch (strategy.toLowerCase()) {
          case 'underscore-template-selector':
            templateStrategy = function() {
              var selector,
                _this = this;
              if (!this.template) {
                return '';
              }
              if (!this._templateFn) {
                switch (typeof this.template) {
                  case 'string':
                    selector = this.template;
                    this._templateFn = _.template($(selector).html() || '');
                    break;
                  case 'function':
                    this._templateFn = function(locals) {
                      selector = _this.template();
                      return _.template($(selector).html() || '', locals);
                    };
                    break;
                  default:
                    throw new Error('this.template must be string or function');
                }
              }
              return this._templateFn(this.serialize.apply(this, arguments));
            };
            break;
          case 'underscore-template':
            templateStrategy = function() {
              var _this = this;
              if (!this.template) {
                return '';
              }
              if (!this._templateFn) {
                switch (typeof this.template) {
                  case 'string':
                    this._templateFn = _.template(this.template);
                    break;
                  case 'function':
                    this._templateFn = function(locals) {
                      return _.template(_this.template(), locals);
                    };
                    break;
                  default:
                    throw new Error('this.template must be string or function');
                }
              }
              return this._templateFn(this.serialize.apply(this, arguments));
            };
            break;
          case 'jst':
            templateStrategy = function() {
              var html;
              if (!this.template) {
                return '';
              }
              if (!this._templateFn) {
                switch (typeof this.template) {
                  case 'string':
                    html = this.template;
                    this._templateFn = function() {
                      return html;
                    };
                    break;
                  case 'function':
                    this._templateFn = this.template;
                    break;
                  default:
                    throw new Error('this.template must be string or function');
                }
              }
              return this._templateFn(this.serialize.apply(this, arguments));
            };
            break;
          default:
            throw new Error('Unrecognized template strategy: ' + strategy);
        }
      }
      if (instance) {
        return instance.templateStrategy = templateStrategy;
      } else {
        return Giraffe.View.prototype.templateStrategy = templateStrategy;
      }
    };

    return View;

  })(Backbone.View);

  Giraffe.View.setTemplateStrategy('underscore-template-selector');

  Giraffe.View.setDocumentEvents(['click', 'change']);

  /*
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
  * @param {Object} [options]
  */


  Giraffe.App = (function(_super) {
    __extends(App, _super);

    function App(options) {
      this._onUnload = __bind(this._onUnload, this);
      this.app = this;
      if (options != null ? options.routes : void 0) {
        this.routes = options.routes;
      }
      this._initializers = [];
      this.started = false;
      App.__super__.constructor.apply(this, arguments);
    }

    App.prototype._cache = function() {
      if (this.routes) {
        this.router = new Giraffe.Router({
          app: this,
          triggers: this.routes
        });
      }
      if (Giraffe.app == null) {
        Giraffe.app = this;
      }
      Giraffe.apps[this.cid] = this;
      $(window).on("unload", this._onUnload);
      return App.__super__._cache.apply(this, arguments);
    };

    App.prototype._uncache = function() {
      if (this.router) {
        this.router = null;
      }
      if (Giraffe.app === this) {
        Giraffe.app = null;
      }
      delete Giraffe.apps[this.cid];
      $(window).off("unload", this._onUnload);
      return App.__super__._uncache.apply(this, arguments);
    };

    App.prototype._onUnload = function() {
      return this.dispose();
    };

    /*
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
    */


    App.prototype.appEvents = null;

    /*
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
    */


    App.prototype.routes = null;

    /*
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
    */


    App.prototype.addInitializer = function(fn) {
      if (this.started) {
        fn.call(this, this.options);
      } else {
        this._initializers.push(fn);
      }
      return this;
    };

    /*
    * Starts the app by executing each initializer in the order it was added,
    * passing `options` through the initializer queue. Triggers the `appEvents`
    * `'app:initializing'` and `'app:initialized'`.
    *
    * @param {Object} [options]
    */


    App.prototype.start = function(options) {
      var next,
        _this = this;
      if (options == null) {
        options = {};
      }
      this.trigger('app:initializing', options);
      next = function(err) {
        var fn;
        if (err) {
          return error(err);
        }
        fn = _this._initializers.shift();
        if (fn) {
          if (fn.length === 2) {
            return fn.call(_this, options, next);
          } else {
            fn.call(_this, options);
            return next();
          }
        } else {
          _.extend(_this.options, options);
          _this.started = true;
          return _this.trigger('app:initialized', options);
        }
      };
      next();
      return this;
    };

    /*
    * See [`Giraffe.View#dispose`](#View-dispose).
    */


    App.prototype.dispose = function() {
      return App.__super__.dispose.apply(this, arguments);
    };

    return App;

  })(Giraffe.View);

  /*
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
  * @param {Object} [options]
  */


  Giraffe.Router = (function(_super) {
    __extends(Router, _super);

    function Router(options) {
      if (options == null) {
        options = {};
      }
      this.app = options.app || Giraffe.app;
      if (!this.app) {
        return error('Giraffe routers require an app! Please create an instance of Giraffe.App before creating a router.');
      }
      this.app.addChild(this);
      Giraffe.bindEventMap(this, this.app, this.appEvents);
      if (options.triggers) {
        this.triggers = options.triggers;
      }
      if (typeof this.triggers === 'function') {
        this.triggers = this.triggers();
      }
      if (!this.triggers) {
        return error('Giraffe routers require a `triggers` map of routes to app events.');
      }
      if (options.parentRouter) {
        this.parentRouter = options.parentRouter;
      }
      if (options.namespace) {
        this.namespace = options.namespace;
      } else if (!this.namespace) {
        this.namespace = Giraffe.Router.defaultNamespace;
      }
      this._routes = {};
      this._bindTriggers();
      Router.__super__.constructor.apply(this, arguments);
    }

    Router.defaultNamespace = '';

    Router.prototype._fullNamespace = function() {
      if (this.parentRouter) {
        return this.parentRouter._fullNamespace() + '/' + this.namespace;
      } else {
        return this.namespace;
      }
    };

    /*
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
    */


    Router.prototype.triggers = null;

    Router.prototype._bindTriggers = function() {
      var appEvent, fullNs, route, _fn, _ref,
        _this = this;
      if (!this.triggers) {
        error('Expected router to implement `triggers` hash in the form {route: appEvent}');
      }
      fullNs = this._fullNamespace();
      if (fullNs.length > 0) {
        fullNs += '/';
      }
      _ref = this.triggers;
      _fn = function(route, appEvent, fullNs) {
        var callback;
        if (_.indexOf(appEvent, '-> ') === 0) {
          callback = function() {
            var redirect;
            redirect = appEvent.slice(3);
            return _this.navigate(redirect, {
              trigger: true
            });
          };
        } else if (_.indexOf(appEvent, '=> ') === 0) {
          callback = function() {
            var redirect;
            redirect = appEvent.slice(3);
            return _this.navigate(fullNs + redirect, {
              trigger: true
            });
          };
        } else {
          route = fullNs + route;
          callback = function() {
            var args, _ref1;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return (_ref1 = _this.app).trigger.apply(_ref1, [appEvent].concat(__slice.call(args), [route]));
          };
          _this._registerRoute(appEvent, route);
        }
        return _this.route(route, appEvent, callback);
      };
      for (route in _ref) {
        appEvent = _ref[route];
        _fn(route, appEvent, fullNs);
      }
      return this;
    };

    Router.prototype._unbindTriggers = function() {
      var triggers;
      triggers = this._getTriggerRegExpStrings();
      return Backbone.history.handlers = _.reject(Backbone.history.handlers, function(handler) {
        return _.contains(triggers, handler.route.toString());
      });
    };

    Router.prototype._getTriggerRegExpStrings = function() {
      return _.map(_.keys(this.triggers), function(route) {
        return Backbone.Router.prototype._routeToRegExp(route).toString();
      });
    };

    /*
    * If `this.triggers` has a route that maps to `appEvent`, the router navigates
    * to the route, triggering the `appEvent`. If no such matching route exists,
    * `cause` acts as an alias for `this.app.trigger`.
    *
    * @param {String} appEvent App event name.
    * @param {Object} [any] Optional parameters.
    */


    Router.prototype.cause = function() {
      var any, appEvent, route, _ref;
      appEvent = arguments[0], any = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      route = this.getRoute.apply(this, [appEvent].concat(__slice.call(any)));
      if (route != null) {
        return Backbone.history.navigate(route, {
          trigger: true
        });
      } else {
        return (_ref = this.app).trigger.apply(_ref, [appEvent].concat(__slice.call(any)));
      }
    };

    /*
    * Returns true if the current `window.location` matches the route that the
    * given app event and optional arguments map to in this router's `triggers`.
    *
    * @param {String} appEvent App event name.
    * @param {Object} [any] Optional parameters.
    */


    Router.prototype.isCaused = function() {
      var any, appEvent, route;
      appEvent = arguments[0], any = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      route = this.getRoute.apply(this, [appEvent].concat(__slice.call(any)));
      if (route != null) {
        if (Backbone.history._hasPushState) {
          return window.location.pathname.slice(1) === route;
        } else {
          return window.location.hash === route;
        }
      } else {
        return false;
      }
    };

    /*
    * Converts an app event and optional arguments into a url mapped in
    * `this.triggers`. Useful to build links to the routes in your app without
    * manually manipulating route strings.
    *
    * @param {String} appEvent App event name.
    * @param {Object} [any] Optional parameter.
    */


    Router.prototype.getRoute = function() {
      var any, appEvent, route;
      appEvent = arguments[0], any = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      route = this._routes[appEvent];
      if (route != null) {
        route = this._reverseHash.apply(this, [route].concat(__slice.call(any)));
        if (route) {
          if (Backbone.history._hasPushState) {
            return route;
          } else {
            return '#' + route;
          }
        } else if (route === '') {
          return '';
        } else {
          return null;
        }
      } else {
        return null;
      }
    };

    Router.prototype._registerRoute = function(appEvent, route) {
      return this._routes[appEvent] = route;
    };

    Router.prototype._reverseHash = function() {
      var args, first, result, route, wildcards;
      route = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      first = args[0];
      if (first == null) {
        return route;
      }
      wildcards = /:\w+|\*\w+/g;
      if (_.isObject(first)) {
        result = route.replace(wildcards, function(token, index) {
          var key;
          key = token.slice(1);
          return first[key] || '';
        });
      } else {
        result = route.replace(wildcards, function(token, index) {
          return args.shift() || '';
        });
      }
      return result;
    };

    /*
    * Performs a page refresh. If `url` is defined, the router first silently
    * navigates to it before refeshing.
    *
    * @param {String} [url]
    */


    Router.prototype.reload = function(url) {
      if (url) {
        Backbone.history.stop();
        window.location = url;
      }
      return window.location.reload();
    };

    /*
    * See [`Giraffe.App#appEvents`](#App-appEvents).
    */


    Router.prototype.appEvents = null;

    /*
    * Removes registered callbacks.
    *
    */


    Router.prototype.dispose = function() {
      return Giraffe.dispose(this, function() {
        return this._unbindTriggers();
      });
    };

    return Router;

  })(Backbone.Router);

  /*
  * __Giraffe.Model__ and __Giraffe.Collection__ are thin wrappers that add lifecycle management and `appEvents` support. To add lifecycle management to an arbitrary object, simply give it a `dispose` method and add it to a view via `addChild`. To use this functionality in your own objects, see [`Giraffe.dispose`](#dispose) and [`Giraffe.bindEventMap`](#bindEventMap).
  *
  * @param {Object} [attributes]
  * @param {Object} [options]
  */


  Giraffe.Model = (function(_super) {
    __extends(Model, _super);

    function Model(attributes, options) {
      this.app || (this.app = (options != null ? options.app : void 0) || Giraffe.app);
      Giraffe.bindEventMap(this, this.app, this.appEvents);
      Model.__super__.constructor.apply(this, arguments);
    }

    /*
    * See [`Giraffe.App#appEvents`](#App-appEvents).
    */


    Model.prototype.appEvents = null;

    /*
    * Removes event listeners and removes this model from its collection.
    */


    Model.prototype.dispose = function() {
      return Giraffe.dispose(this, function() {
        var _ref;
        return (_ref = this.collection) != null ? _ref.remove(this) : void 0;
      });
    };

    return Model;

  })(Backbone.Model);

  /*
  * See [`Giraffe.Model`](#Model).
  *
  * @param {Array} [models]
  * @param {Object} [options]
  */


  Giraffe.Collection = (function(_super) {
    __extends(Collection, _super);

    Collection.prototype.model = Giraffe.Model;

    function Collection(models, options) {
      this.app || (this.app = (options != null ? options.app : void 0) || Giraffe.app);
      Giraffe.bindEventMap(this, this.app, this.appEvents);
      Collection.__super__.constructor.apply(this, arguments);
    }

    /*
    * See [`Giraffe.App#appEvents`](#App-appEvents).
    */


    Collection.prototype.appEvents = null;

    /*
    * Removes event listeners and disposes of all models, which removes them from the collection.
    */


    Collection.prototype.dispose = function() {
      return Giraffe.dispose(this, function() {
        var model, _i, _len, _ref, _results;
        _ref = this.models;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          model = _ref[_i];
          _results.push(model.dispose());
        }
        return _results;
      });
    };

    return Collection;

  })(Backbone.Collection);

  /*
  * Disposes of a object. Calls `Backbone.Events#stopListening` and sets `obj.app` to null. Also triggers `'disposing'` and `'disposed'` events on `obj` before and after the disposal. Takes an optional `fn` argument to do additional work, and optional `args` that are passed through to the events and `fn`.
  *
  * @param {Object} obj The object to dispose.
  * @param {Function} [fn] A callback to perform additional work in between the `'disposing'` and `'disposed'` events.
  * @param {Any} [args...] A list of arguments to by passed to the `fn` and disposal events.
  */


  Giraffe.dispose = function() {
    var args, fn, obj;
    obj = arguments[0], fn = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (typeof obj.trigger === "function") {
      obj.trigger.apply(obj, ['disposing', obj].concat(__slice.call(args)));
    }
    if (fn != null) {
      fn.apply(obj, args);
    }
    if (typeof obj.stopListening === "function") {
      obj.stopListening();
    }
    obj.app = null;
    if (typeof obj.trigger === "function") {
      obj.trigger.apply(obj, ['disposed', obj].concat(__slice.call(args)));
    }
    return obj;
  };

  /*
  * Uses `Backbone.Events.listenTo` to make `contextObj` listen for `eventName` on `targetObj` with the callback `cb`, which can be a function or the string name of a method on `contextObj`.
  *
  * @param {Backbone.Events} contextObj The object doing the listening.
  * @param {Backbone.Events} targetObj The object to listen to.
  * @param {String/Function} eventName The name of the event to listen to.
  * @param {Function} cb The event's callback.
  */


  Giraffe.bindEvent = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _setEventBindings.apply(null, args.concat('listenTo'));
  };

  /*
  * The `stopListening` equivalent of `bindEvent`.
  *
  * @param {Backbone.Events} contextObj The object doing the listening.
  * @param {Backbone.Events} targetObj The object to listen to.
  * @param {String/Function} eventName The name of the event to listen to.
  * @param {Function} cb The event's callback.
  */


  Giraffe.unbindEvent = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _setEventBindings.apply(null, args.concat('stopListening'));
  };

  /*
  * Makes `contextObj` listen to `targetObj` for the events of `eventMap` in the form `eventName: method`, where `method` is a function or the name of a function on `contextObj`.
  *
  *     Giraffe.bindEventMap(this, this.app, this.appEvents);
  *
  * @param {Backbone.Events} contextObj The object doing the listening.
  * @param {Backbone.Events} targetObj The object to listen to.
  * @param {Object} eventMap A map of events to callbacks in the form {eventName: methodName/methodFn} to listen to.
  */


  Giraffe.bindEventMap = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _setEventMapBindings.apply(null, args.concat('listenTo'));
  };

  /*
  * The `stopListening` equivalent of `bindEventMap`.
  *
  * @param {Backbone.Events} contextObj The object doing the listening.
  * @param {Backbone.Events} targetObj The object to listen to.
  * @param {Object} eventMap A map of events to callbacks in the form {eventName: methodName/methodFn} to listen to.
  */


  Giraffe.unbindEventMap = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _setEventMapBindings.apply(null, args.concat('stopListening'));
  };

  _setEventBindings = function(contextObj, targetObj, eventName, cb, bindOrUnbindFnName) {
    if (!(targetObj && contextObj && eventName && bindOrUnbindFnName)) {
      return;
    }
    if (typeof cb === 'string') {
      cb = contextObj[cb];
    }
    if (typeof cb !== 'function') {
      error("callback for `'" + eventName + "'` not found", contextObj, targetObj, cb);
      return;
    }
    return contextObj[bindOrUnbindFnName](targetObj, eventName, cb);
  };

  _setEventMapBindings = function(contextObj, targetObj, eventMap, bindOrUnbindFnName) {
    var cb, eventName;
    if (typeof eventMap === 'function') {
      eventMap = eventMap();
    }
    if (!eventMap) {
      return;
    }
    for (eventName in eventMap) {
      cb = eventMap[eventName];
      _setEventBindings(contextObj, targetObj, eventName, cb, bindOrUnbindFnName);
    }
    return null;
  };

}).call(this);
