

Giraffe.plugins.add


  name: 'Startable'
  description: """
    Adds the `addInitializer` and `start` to (a)synchronously get to a
    state where `this.started = true`.
  """
  author: 'github.com/ryanatkn'
  targetFns: [Giraffe.App] # TODO how can a plugin be easily customized?


  beforeInitialize: ->
    @started = false


  beforeDispose: ->
    @_initializers = null


  # Functions copied to the prototype
  extendPrototype:

    ###
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
    ###
    addInitializer: (fn) ->
      if @started
        fn.call @, @_startOptions
        _.extend @, @_startOptions
      else
        @_initializers ?= []
        @_initializers.push fn
      @


    ###
    * Starts the object by executing each initializer in the order it was added,
    * passing `options` through the initializer queue.
    *
    * @param {Object} [options]
    ###
    start: (options = {}) ->
      @_startOptions = options
      Giraffe.callFn @, 'beforeStart', arguments...

      # Runs all sync/async initializers.
      next = (err) =>
        return error(err) if err

        fn = @_initializers?.shift()
        if fn
          # Allows asynchronous calls
          if fn.length is 2
            fn.call @, options, next
          else
            fn.call @, options
            next()
        else
          _.extend @, options
          @started = true
          Giraffe.callFn @, 'afterStart', arguments...

      next()
      @
