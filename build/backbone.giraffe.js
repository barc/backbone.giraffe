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
    $ = window.$;
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

  /**
  * **Giraffe.View** is optimized for simplicity and flexibility. It provides lifecycle management for all `children`, which can be any object that implements a `dispose` method. The `attachTo` method automatically sets up parent-child relationships between views to allow nesting with no extra work, and any other object can have its lifecycle managed via `addChild`. When a view is disposed, it disposes of all of its `children`, allowing us to destroy anything from a single view to an entire application with a single method call. When a view renders, it first calls `detach` on all of its children, and when a view is detached, the default behavior is to dispose of that view. To overried this behavior and keep a view cached even when its parent renders, you can set the cached view's `options.disposeOnDetach` to `false`.
  *
  * Views can move around the DOM safely and freely with the `attachTo` method, which accepts any selector, DOM element, or view, as well as an optional jQuery insertion method like `'prepend'`, `'after'`, or `'html'`. The default is `'append'`.
  *
  * The **Giraffe.View** gets much of its smarts by way of the `data-view-cid` attribute attached to `view.$el`. This attribute allows us to find a view's parent when attached to a selector or DOM element and safely detach views when they would otherwise be clobbered. Currently, Giraffe has only one class that extends **Giraffe.View**, **Giraffe.App**, which encapsulates app-wide messenging and routing.
  *
  * @param {Object} [options]
  */


  Giraffe.View = (function(_super) {
    __extends(View, _super);

    View.defaultOptions = {
      disposeOnDetach: true,
      alwaysRender: false,
      saveScrollPosition: false,
      documentTitle: null
    };

    function View(options) {
      if (options == null) {
        options = {};
      }
      this.render = __bind(this.render, this);
      _.defaults(options, Giraffe.View.defaultOptions);
      this.app || (this.app = options.app || Giraffe.app);
      /**
      * Similar to the `events` hash of **Backbone.View**, the `appEvents` hash maps events on `this.app` to methods on the view. App events can be triggered from routes or by any object in your application. If a **Giraffe.App** has been created, every view has a reference to the global **Giraffe.app** instance at `this.app`, and a specific app instance can be set by passing `options.app` to the view. The instance of `this.app` is used to bind `appEvents`, and these bindings are automatically cleaned up when a view is disposed. See **Giraffe.App** and **Giraffe.Router** for more.
      */

      Giraffe.bindEventMap(this.app, this.appEvents, this);
      /**
      * When one view is attached to another, the child view is added to the parent's `children` array. When a view renders, it first calls `detach` on its `children`. By default, `dispose` is called on a view when it is detached if `options.disposeOnDetach` is `true`, which is the default setting. After a view renders, any child views with `options.disposeOnDetach` set to `false` will be in `children`, ready to be attached. When `dispose` is called on a view, it disposes of all of its `children`. Any object with a `dispose` method can be added to a view's `children` via `addChild` to take advantage of lifecycle management.
      */

      this.children = [];
      /**
      * Child views have a reference to their parent view.
      */

      this.parent = null;
      this._renderedOnce = false;
      this._isAttached = false;
      this._createEventsFromUIElements();
      this._wrapInitialize();
      View.__super__.constructor.call(this, options);
    }

    View.prototype._wrapInitialize = function() {
      var _this = this;
      return this.initialize = _.wrap(this.initialize, function(initialize) {
        _this._cache();
        _this.$el.attr('data-view-cid', _this.cid);
        initialize.apply(_this, Array.prototype.slice.call(arguments, 1));
        return _this._bindDataEvents();
      });
    };

    View.prototype._attachMethods = ['append', 'prepend', 'html', 'after', 'before', 'insertAfter', 'insertBefore'];

    View.prototype._siblingAttachMethods = ['after', 'before', 'insertAfter', 'insertBefore'];

    /**
    * Attaches this view to `el`, which can be a selector, DOM element, or view. If `el` has a parent view, a parent-child relationship is set up. If the view has not yet been rendered when attached, `render` is called. This render behavior can be overridden through the options `forceRender` and `suppressRender`. Before a view renders, it calls `detach` on all of its `children`, and when a view is detached, it is also disposed, unless `options.disposeOnDetach` is set to false.
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

    /**
    * `attach` is an inverted way to call `attachTo`. Unlike `attachTo`, calling this function requires a parent view. It's here only for aesthetics.
    * @param {View} view
    * @param {Object} [options]
    */


    View.prototype.attach = function(view, options) {
      var childEl;
      if (options != null ? options.el : void 0) {
        childEl = this.$el.find(options.el);
        if (childEl.length) {
          view.attachTo(childEl, options);
        } else if (this.$el.is(options.el)) {
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
    * This is an empty function for you to implement. Used in fewer situations than `afterRender`, but helpful in circumstances where the DOM has state that need to be preserved across renders. For example, if a view with a dropdown menu is rendering, you may want to save its open state in `beforeRender` and reapply it in `afterRender`.
    * @caption Implement this function in your views.
    */


    View.prototype.beforeRender = function() {};

    /**
    * Giraffe implements `render` so it can do some helpful things, but you can still call it like you normally would. It consumes the method `getHTML`, a method your views should implement that returns a view's HTML as a string.
    * @caption Do not override unless you know what you're doing!
    */


    View.prototype.render = function(options) {
      this.beforeRender.apply(this, arguments);
      this._renderedOnce = true;
      this.detachChildren(options != null ? options.preserve : void 0);
      this.$el.empty().html(this.getHTML.apply(this, arguments) || '');
      this._cacheUiElements();
      this.afterRender.apply(this, arguments);
      return this;
    };

    /**
    * This is an empty function for you to implement. After a view renders, `afterRender` is called. Child views are normally attached to the DOM here. Views that are cached by setting `options.disposeOnDetach` to true will be in `view.children` in `afterRender`, but will not be attached to the parent's `$el`.
    * @caption Implement this function in your views.
    */


    View.prototype.afterRender = function() {};

    /**
    * Giraffe implements its own `render` function which calls `getHTML` to get the HTML string to put inside `view.$el`. Your views can either define a `template`, which uses **Underscore** templates by default, or override `getHTML`, returning a string of HTML from your favorite templating engine.
    * @caption Override this function in your views to get full control over what goes into view.$el during `render`.
    */


    View.prototype.getHTML = function() {
      var compiledTemplate, html, template;
      html = '';
      if (this.template) {
        template = typeof this.template === 'function' ? this.template.apply(this, arguments) : this.template;
        if (typeof template === 'string') {
          compiledTemplate = this.compileTemplate(template);
          if (typeof compiledTemplate === 'function') {
            html = compiledTemplate(this.serialize.apply(this, arguments));
            if (typeof html !== 'string') {
              error('Expected compiled template to return a string', html);
              html = '';
            }
          } else {
            error('Unable to compile template to a function', template);
          }
        } else {
          error('Invalid template - expected a string or function returning a string', this.template);
        }
      }
      return html;
    };

    /**
    * Consumed by `getHTML` to get a compiled template function, pulling from the cache if it's already been compiled.
    * @caption Override this function in your views to specify a custom template compiler/cache.
    */


    View.prototype.compileTemplate = function(template) {
      var cache, _base;
      cache = (_base = Giraffe.View).cachedTemplates != null ? (_base = Giraffe.View).cachedTemplates : _base.cachedTemplates = {};
      return cache[template] || (cache[template] = this.templateFunction(template));
    };

    /**
    * Consumed by `compileTemplate` to get the template function for `render`. Defaults to `_.template`.
    * @caption Override this function in your views to specify a custom render function that's compatible with `_.template`.
    */


    View.prototype.templateFunction = _.template;

    /**
    * Gets the data passed to the `templateFunction`. By default, returns an object with direct references to the view's `model` and `collection`.
    * @caption Override this function to pass custom data to a view's `templateFunction`.
    */


    View.prototype.serialize = function() {
      return {
        collection: this.collection,
        model: this.model
      };
    };

    /**
    * Detaches the view from the DOM. If `options.disposeOnDetach` is true, which is the default, `dispose` will be called on the view and its `children` unless `preserve` is true. `preserve` defaults to false.
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

    /**
    * Calls `detach` on each object in `children`, passing the `preserve` parameter through.
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

    /**
    * Adds `child` to this view's `children` and assigns this view as `child.parent`. If `child` implements `dispose`, it will be called when the view is disposed. If `child` implements `detach`, it will be called before the view renders.
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

    /**
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

    /**
    * Removes an object from this view's `children`. If `preserve` is `false`, the default, Giraffe will attempt to call `dispose` on the child. If `preserve` is true, Giraffe will attempt to call `detach` on the child.
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

    /**
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

    /**
    * Sets a new parent for a view. `parent` can be `null` or `undefined` to remove the current parent.
    *
    * @param {Giraffe.View} [parent]
    */


    View.prototype.setParent = function(parent) {
      if (parent) {
        parent.addChild(this);
      } else if (this.parent) {
        this.parent.removeChild(this, true);
        this.parent = null;
      }
      return this;
    };

    /**
    * If `el` is `null` or `undefined`, tests if the view is somewhere on the DOM by calling `$(document).find(this.$el)`. If `el` is defined, tests if `el` is the immediate parent of the view.
    *
    * @param {String} [el] Optional selector, DOM element, or view to test against the view's immediate parent.
    * @returns {Boolean}
    */


    View.prototype.isAttached = function(el) {
      if (el) {
        if (el.$el) {
          return this.parent === el;
        } else {
          return this.$el.parent().is(el);
        }
      } else {
        return $(document).find(this.$el).length > 0;
      }
    };

    /**
    * The optional `ui` object maps names to selectors, e.g. `{$someName: '#some-selector'}`. If a view defines `ui`, the jQuery objects it names will be cached and updated every `render`. For example, declaring `this.ui = {$button: '#button'}` in a view makes `this.$button` always available once `render` has been called.
    */


    View.prototype.ui = null;

    View.prototype._cacheUiElements = function() {
      var name, selector, _ref;
      if (this.ui) {
        _ref = this.ui;
        for (name in _ref) {
          selector = _ref[name];
          this[name] = this.$(selector);
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
        Giraffe.bindEvent(targetObj, eventName, cb, this);
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

    /**
    * Calls `method` on the view, or if not found, up the view hierarchy, passing `args` through. Used by Giraffe to call the methods defined for the events bound in `setDocumentEvents`.
    *
    * @param {String} method
    * @param {Any} [args...]
    */


    View.prototype.invoke = function() {
      var args, method, view;
      method = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      view = this;
      while (view && !view[method]) {
        view = view.parent;
      }
      if (view != null ? view[method] : void 0) {
        return view[method].apply(view, args);
      } else {
        error('No such method in view hierarchy', method, args, this);
        return true;
      }
    };

    /**
    * Define `appEvents` on any Giraffe object to listen to events on `this.app`, which is either the option passed in `{app: myApp}` or the first instance of **Giraffe.App** created on the page, which is globally assigned to `Giraffe.app`. Any object with a reference to an app can `trigger` arbitrary `appEvents`, and any object with a reference to a router can `cause` an app event and navigate to its corresponding route.
    */


    View.prototype.appEvents = null;

    /**
    * Destroys a view, unbinding its events and freeing its resources. Calls the `remove` method defined by **Backbone.View** and calls `dispose` on all `children`.
    */


    View.prototype.dispose = function() {
      return Giraffe.dispose(this, function() {
        this.setParent(null);
        this.removeChildren();
        this._uncacheUiElements();
        this._uncache();
        this.remove();
        return this.$el = null;
      });
    };

    /**
    * Detaches the top-level views inside `el`, which can be a selector, element, jQuery object, or **Giraffe.View**. Used internally by Giraffe to remove views that would otherwise be clobbered when the `method` option `'html'` is used to attach a view. Uses the `data-view-cid` attribute to correlate DOM nodes to view instances.
    *
    * @param {Element/jQuery/Giraffe.View} el
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

    /**
    * Gets the closest parent view of `el`, which can be a selector, element, jQuery object, or **Giraffe.View**. Uses the `data-view-cid` attribute to correlate DOM nodes to view instances.
    *
    * @param {Element/jQuery/Giraffe.View} el
    */


    View.getClosestView = function(el) {
      var $el, cid;
      $el = Giraffe.View.to$El(el);
      cid = $el.closest('[data-view-cid]').attr('data-view-cid');
      return Giraffe.View.getByCid(cid);
    };

    /**
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

    /**
    * Using the form `data-gf-event`, DOM elements can be configured to call view methods on DOM events. By default, Giraffe only binds the most common events to keep things lean. To configure your own set of events, use Giraffe.View.setDocumentEvents to reset the bindings to the events of your choosing. For example, if you want only the click and mousedown events, call Giraffe.View.setDocumentEvents(['click', 'mousedown']). If you wish to remove Giraffe's document event features completely, call `removeDocumentEvents`. It is not necessary to call this method before setting new ones. Setting document events removes the current ones.
    */


    View.removeDocumentEvents = function() {
      var event, _i, _len, _ref, _ref1;
      if (!((_ref = View._currentDocumentEvents) != null ? _ref.length : void 0)) {
        return;
      }
      _ref1 = View._currentDocumentEvents;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        event = _ref1[_i];
        $(document).off(event, "[data-gf-" + event + "]");
      }
      return View._currentDocumentEvents = null;
    };

    /**
    * Giraffe provides a convenient high-performance way to declare view method calls in your HTML markup. Using the form `data-gf-eventName='methodName'`, when a bound DOM event is triggered, Giraffe looks for the defined method on the element's view. For example, putting `data-gf-click='submitForm'` on a button calls the method `submitForm` on its view on `'click'`. If the view does not define the method, Giraffe searches up the view hierarchy until it finds it or runs out of views. By default, only the `click` and `change` events are bound by Giraffe, but `setDocumentEvents` allows you to set a custom list of events, first unbinding the existing ones and then setting the ones you give it, if any.
    *
    *     Giraffe.View.setDocumentEvents(['click', 'change', 'keydown']);
    *
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
      View.removeDocumentEvents();
      View._currentDocumentEvents = events;
      _results = [];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        event = events[_i];
        _results.push((function(event) {
          return $(document).on(event, "[data-gf-" + event + "]", function(e) {
            var $target, method, view;
            $target = $(e.target).closest("[data-gf-" + event + "]");
            method = $target.attr("data-gf-" + event);
            view = View.getClosestView($target);
            return view.invoke(method, e);
          });
        })(event));
      }
      return _results;
    };

    View.setDocumentEvents(['click', 'change']);

    return View;

  })(Backbone.View);

  /**
  * **Giraffe.App** is a special **Giraffe.View** that provides encapsulation for an entire application. Like all Giraffe views, the app has lifecycle management for all `children`, so calling `dispose` on an app will destroy all views, models, collections, and routers that have been added as `children` of the app or its descendents. The first **Giraffe.App** created on a page is available globally at `Giraffe.app`, and by default all Giraffe objects reference this app as `this.app` unless they're passed a different app in `options.app`. This app reference is used to bind `appEvents`, a hash that all Giraffe objects can implement which uses the app as an event aggregator for communication and routing. The app also provides synchronous and asynchronous initializers with `addInitializer` and `start`.
  *
  * @param {Object} [options]
  */


  Giraffe.App = (function(_super) {
    __extends(App, _super);

    function App() {
      var _this = this;
      this.app = this;
      this._initializers = [];
      this.started = false;
      $(window).unload(function() {
        return _this.dispose();
      });
      App.__super__.constructor.apply(this, arguments);
    }

    App.prototype._cache = function() {
      var _ref;
      if (Giraffe.app == null) {
        Giraffe.app = this;
      }
      this._name = ((_ref = this.options) != null ? _ref.name : void 0) || this.cid;
      Giraffe.apps[this._name] = this;
      this.$el.attr('data-gf-app', this._name);
      return App.__super__._cache.apply(this, arguments);
    };

    App.prototype._uncache = function() {
      if (Giraffe.app === this) {
        Giraffe.app = null;
      }
      delete Giraffe.apps[this._name];
      return App.__super__._uncache.apply(this, arguments);
    };

    /**
    * Queues up the provided function to be run on `start`. The functions you provide are called with the same `options` object passed to `start`. If the provided function has two arguments, the options and a callback, the app's initialization will wait until you call the callback. If the callback is called with a truthy first argument, an error will be logged and initialization will halt. If the app has already started when you call `addInitializer`, the function is called immediately.
    *
    *     app.addInitializer(function(options, cb) {
    *         doAsyncStuff(cb);
    *     });
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

    /**
    * Starts the app by executing each initializer in the order it was added, passing `options` through the initializer queue. Triggers the `appEvents` `'app:initializing'` and `'app:initialized'`.
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

    return App;

  })(Giraffe.View);

  /**
  * The **Giraffe.Router** integrates with a **Giraffe.App** to decouple your router and route handlers and to provide programmatic encapsulation for your routes. A route can be handled by any Giraffe object by subscribing to the corresponding app event defined in `triggers`. The `cause` method navigates to a route and triggers the corresponding app event, and you can ask the router if a given app event is currently caused via `isCaused`. Additionally, rather than building anchor links and window locations manually, you can build routes from app events and optional parameters with `getRoute`.
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
      Giraffe.bindEventMap(this.app, this.appEvents, this);
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

    /**
    * The `triggers` hash is similar to the `routes` hash of **Backbone.Router**, but instead of `route: method` the **Giraffe.Router** expects `route: appEvent`, e.g. `'someUrl/:andItsParams': 'some:appEvent'`. See the **Giraffe.App** and its `appEvents` for more.
    *
    *     var router = new Giraffe.Router({triggers: {'route': 'appEvent'}});
    *
    *     var MyRouter = Giraffe.Router.extend({triggers: {'route': 'appEvent'}});
    *     var myRouter = new MyRouter();
    */


    Router.prototype.triggers = null;

    /**
    * Performs a page refresh. If `url` is defined, the router first silently navigates to it before refeshing.
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

    /**
    * Triggers an app event with optional arguments. If `this.triggers` has a matching route, `Backbone.history` navigates to it.
    *
    * @param {String} appEvent App event name.
    * @param {Object} [any] Optional parameters.
    */


    Router.prototype.cause = function(appEvent, any) {
      var route;
      route = this.getRoute(appEvent, any);
      if (route != null) {
        return Backbone.history.navigate(route, {
          trigger: true
        });
      } else {
        return this.app.trigger(appEvent, any);
      }
    };

    /**
    * Returns true if the current `window.location` matches the route that the given app event and optional arguments map to.
    *
    * @param {String} appEvent App event name.
    * @param {Object} [any] Optional parameters.
    */


    Router.prototype.isCaused = function(appEvent, any) {
      var route;
      route = this.getRoute(appEvent, any);
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

    /**
    * Converts an app event and optional arguments into a url mapped in `this.triggers`. Useful if you want to programmatically encapsulate your routes, so you don't need to manually build anchor links and window locations to navigate to.
    *
    * @param {String} appEvent App event name.
    * @param {Object} [any] Optional parameter.
    */


    Router.prototype.getRoute = function(appEvent, any) {
      var route;
      route = this._routes[appEvent];
      if (route != null) {
        route = this._reverseHash(route, any);
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

    Router.prototype._reverseHash = function(route, any) {
      var key, match, matches, regex, val, _i, _len;
      if (!any) {
        return route;
      }
      regex = /:(\w+)\b/g;
      matches = route.match(regex);
      if (matches) {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          match = matches[_i];
          key = match.slice(1);
          if (any instanceof Backbone.Model) {
            val = any.get(key);
          } else if (_.isObject(any)) {
            val = any[key];
          } else {
            val = any;
          }
          route = route.replace(RegExp("" + match, "g"), val);
        }
      }
      return route;
    };

    /**
    * Define `appEvents` on any Giraffe object to listen to events on `this.app`, which is either the option passed in `{app: myApp}` or the first instance of **Giraffe.App** created on the page, which is globally assigned to `Giraffe.app`. Any object with a reference to an app can `trigger` arbitrary `appEvents`, and any object with a reference to a router can `cause` an app event and navigate to its corresponding route.
    */


    Router.prototype.appEvents = null;

    /**
    * Removes registered callbacks.
    *
    */


    Router.prototype.dispose = function() {
      return Giraffe.dispose(this, function() {});
    };

    return Router;

  })(Backbone.Router);

  /**
  * **Giraffe.Model** and **Giraffe.Collection** are thin wrappers that add lifecycle management and `appEvents` support. To add lifecycle management to an arbitrary object, simply give it a `dispose` method and add it to a view via `addChild`. The function `Giraffe.dispose` can be used to perform some useful disposal work. The helper function `Giraffe.bindEventMap` adds `appEvents` bindings for any object, and Backbone's `stopListening` will unbind them.
  *
  * @param {Object} [attributes]
  * @param {Object} [options]
  */


  Giraffe.Model = (function(_super) {
    __extends(Model, _super);

    function Model(attributes, options) {
      this.app || (this.app = (options != null ? options.app : void 0) || Giraffe.app);
      Giraffe.bindEventMap(this.app, this.appEvents, this);
      Model.__super__.constructor.apply(this, arguments);
    }

    /**
    * Define `appEvents` on any Giraffe object to listen to events on `this.app`, which is either the option passed in `{app: myApp}` or the first instance of **Giraffe.App** created on the page, which is globally assigned to `Giraffe.app`. Any object with a reference to an app can `trigger` arbitrary `appEvents`, and any object with a reference to a router can `cause` an app event and navigate to its corresponding route.
    */


    Model.prototype.appEvents = null;

    /**
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

  /**
  * **Giraffe.Model** and **Giraffe.Collection** are thin wrappers that add lifecycle management and `appEvents` support. To add lifecycle management to an arbitrary object, simply give it a `dispose` method and add it to a view via `addChild`. The function `Giraffe.dispose` can be used to perform some useful disposal work. The helper function `Giraffe.bindEventMap` adds `appEvents` bindings for any object, and Backbone's `stopListening` will unbind them.
  *
  * @param {Array} [models]
  * @param {Object} [options]
  */


  Giraffe.Collection = (function(_super) {
    __extends(Collection, _super);

    Collection.prototype.model = Giraffe.Model;

    function Collection(models, options) {
      this.app || (this.app = (options != null ? options.app : void 0) || Giraffe.app);
      Giraffe.bindEventMap(this.app, this.appEvents, this);
      Collection.__super__.constructor.apply(this, arguments);
    }

    /**
    * Define `appEvents` on any Giraffe object to listen to events on `this.app`, which is either the option passed in `{app: myApp}` or the first instance of **Giraffe.App** created on the page, which is globally assigned to `Giraffe.app`. Any object with a reference to an app can `trigger` arbitrary `appEvents`, and any object with a reference to a router can `cause` an app event and navigate to its corresponding route.
    */


    Collection.prototype.appEvents = null;

    /**
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

  /**
  * Disposes of a object. Calls Backbone's `obj.stopListening()` and sets `obj.app` to null. Also triggers `'disposing'` and `'disposed'` events on `obj` before and after the disposal. Takes an optional `fn` argument to do additional work, and optional `args` that are passed through to the events and `fn`.
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

  /**
  * Makes `contextObj` listen for `eventName` on `targetObj` with the callback `cb`.
  *
  * @param {Backbone.Events} targetObj The object to listen to.
  * @param {String/Function} eventName The name of the event to listen to.
  * @param {Function} cb The event's callback.
  * @param {Backbone.Events} contextObj The object doing the listening.
  */


  Giraffe.bindEvent = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _setEventBindings.apply(null, args.concat('listenTo'));
  };

  /**
  * The `stopListening` equivalent of `bindEvent`.
  *
  * @param {Backbone.Events} targetObj The object to listen to.
  * @param {String/Function} eventName The name of the event to listen to.
  * @param {Function} cb The event's callback.
  * @param {Backbone.Events} contextObj The object doing the listening.
  */


  Giraffe.unbindEvent = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _setEventBindings.apply(null, args.concat('stopListening'));
  };

  /**
  * Binds an event map of the form `{eventName: methodName}` to `targetObj` with `contextObj` being the listening object.
  *
  * @param {Backbone.Events} targetObj The object to listen to.
  * @param {Object} eventMap A map of events to callbacks in the form {eventName: methodName/methodFn} to listen to.
  * @param {Function} cb The event's callback.
  * @param {Backbone.Events} contextObj The object doing the listening.
  */


  Giraffe.bindEventMap = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _setEventMapBindings.apply(null, args.concat('listenTo'));
  };

  /**
  * The `stopListening` equivalent of `bindEventMap`.
  *
  * @param {Backbone.Events} targetObj The object to listen to.
  * @param {Object} eventMap A map of events to callbacks in the form {eventName: methodName/methodFn} to listen to.
  * @param {Function} cb The event's callback.
  * @param {Backbone.Events} contextObj The object doing the listening.
  */


  Giraffe.unbindEventMap = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return _setEventMapBindings.apply(null, args.concat('stopListening'));
  };

  _setEventBindings = function(targetObj, eventName, cb, contextObj, bindOrUnbindFnName) {
    if (!(targetObj && contextObj && eventName && bindOrUnbindFnName)) {
      return;
    }
    if (typeof cb === 'string') {
      cb = contextObj[cb];
    }
    if (!cb) {
      error("callback for `" + eventName + "` not found: " + cb, contextObj, targetObj);
      return;
    }
    return contextObj[bindOrUnbindFnName](targetObj, eventName, cb);
  };

  _setEventMapBindings = function(targetObj, eventMap, contextObj, bindOrUnbindFnName) {
    var cb, eventName;
    if (typeof eventMap === 'function') {
      eventMap = eventMap();
    }
    if (!eventMap) {
      return;
    }
    for (eventName in eventMap) {
      cb = eventMap[eventName];
      _setEventBindings(targetObj, eventName, cb, contextObj, bindOrUnbindFnName);
    }
    return null;
  };

}).call(this);
