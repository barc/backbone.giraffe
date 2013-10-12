

Giraffe.plugins.add


  name: 'Extendable'
  description: """
    Extends `obj` with `options` during `Giraffe.configure`.
    Omits `omittedOptions` from the extended properties.
    If `omittedOptions` is `true`, no options are extended.
  """
  author: 'github.com/ryanatkn'


  initialize: ->
    console.log "ADD PARSE"
    Giraffe.Model.defaultOptions.omittedOptions ?= [] # TODO super hacky
    Giraffe.Model.defaultOptions.omittedOptions.push 'parse'
    Giraffe.Collection.defaultOptions.omittedOptions ?= []
    Giraffe.Collection.defaultOptions.omittedOptions.push 'parse'

  
  beforeConfigure: (obj, opts) ->
    options = _.extend {},
      Giraffe.defaultOptions,
      obj.constructor?.defaultOptions,
      obj.defaultOptions,
      opts

    # Extend the object with `options` minus `omittedProperties` unless `omittedOptions` is `true`.
    omittedOptions = options.omittedOptions ? obj.omittedOptions
    if omittedOptions isnt true
      _.extend obj, _.omit(options, omittedOptions) # TODO allow a `extendTargetObj` option, e.g. the prototype?