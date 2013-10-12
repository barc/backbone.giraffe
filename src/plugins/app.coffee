###
* Tries to find an `app` property and listens for `appEvents`.
###

# To register the plugin with Giraffe:
# Giraffe.addPlugin App

# Maintain the same Giraffe.App API
# class Giraffe.App extends Backbone.View
#   Giraffe.addPlugin @, 'App'




Giraffe.plugins.add


  name: 'App'
  description: 'Adds the `app` object to `obj` and listens for `appEvents`.'
  author: 'github.com/ryanatkn'


  hooks:
    
    afterConfigure:
      # sortOrder: 0.5
      hook: ->
        @app ?= Giraffe.app
        Giraffe.bindAppEvents @ if @appEvents


    beforeDispose: ->
      @app = null