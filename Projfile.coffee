fs = require('fs')

COMMON =
  """
  :::@ --hide

  ```html
  <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
  <script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js"></script>
  <script src="http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js"></script>
  <script src="../../backbone.giraffe.js" type="text/javascript"></script>
  ```
  """

exports.server =
  dirname: 'dist/'


exports.project = (pm) ->
  {f, $, Utils} = pm

  changeToDist = f.tap (asset) ->
    asset.filename = asset.filename.replace(/^src/, 'dist')

  changeExtname = (extname) ->
    return f.tap (asset) ->
      asset.filename = Utils.changeExtname(asset.filename, extname)

  all: ['clean', 'giraffe', 'miniGiraffe', 'docs', 'stylesheets', 'staticFiles']

  giraffe:
    desc: 'Builds Giraffe'
    files: 'src/backbone.giraffe.coffee'
    dev: [
      f.coffee
      changeToDist
      f.writeFile
    ]

  miniGiraffe:
    desc: 'Builds Minified Giraffe'
    files: 'src/backbone.giraffe.coffee'
    dev: [
      f.coffee
      f.uglify
      f.writeFile _filename: 'dist/backbone.giraffe.min.js'
    ]

  # _docs
  _copyReadmeAsIndex:
    desc: 'Copies README.md as the source for index.html'
    files: ['README.md', 'LICENSE']
    dev: [
      f.tap (asset) ->
        asset.filename = switch asset.filename
          when 'README.md' then 'src/docs/index.md'
          when 'LICENSE' then 'src/docs/LICENSE.md'
      f.writeFile
    ]


  _deleteTempIndex:
    desc: 'Deletes copied README.md'
    dev: ->
      $.rm 'src/docs/index.md'
      $.rm 'src/docs/license.md'

  _toc:
    files: 'src/docs/_toc.md'
    dev: [
      f.tutdown assetsDirname: 'dist/docs/_assets'
      f.writeFile _filename: 'dist/docs/_toc.html'
    ]

  _docs:
    desc: 'Builds docs'
    deps: ['_toc']
    files: [
      'src/docs/*.md'
      '!src/docs/_toc.md'
    ]
    dev: [
      f.tap (asset) ->
        asset.filename = asset.filename.replace(/^src/, 'dist')
        asset.text = asset.text.replace(/{{{COMMON}}}/g, COMMON)
      f.tutdown
        exampleLayoutFile: 'src/docs/_example.mustache'
        assetsDirname: 'dist/docs/_assets'
      f.tap (asset) ->
        asset.nav = fs.readFileSync('dist/docs/_toc.html')
      f.template
        delimiters: 'mustache'
        layout: 'src/docs/_layout.mustache'
        navHeader: ''
      f.writeFile
    ]

  _api:
    desc: 'Builds API documentation'
    deps: ['stylesheets', 'staticFiles']
    files: ['src/backbone.giraffe.coffee']
    dev: [
      f.tutdown commentFiller: '* '
      f.template
        delimiters: 'mustache'
        layout: 'src/docs/_layout.mustache'
        navHeader:
          """
          <h2><a href="index.html">Examples</a></h2>
          <h2><a href="api.html">API</a></h2>
          """
      f.writeFile _filename: 'dist/docs/api.html'
    ]

  docs:
    desc: 'Builds the docs'
    deps: ['prep', '_copyReadmeAsIndex', '_docs', '_deleteTempIndex', '_api']

  stylesheets:
    desc: 'Builds less files'
    files: ['src/docs/css/*.less']
    dev: [
      f.less
      changeToDist
      f.writeFile
    ]

  staticFiles:
    desc: 'Copies static files'
    dev: ->
      $.cp '-rf', 'src/docs/img', 'dist/docs'

  prep: ->
    $.mkdir '-p', 'dist/docs/_assets'

  clean: ->
    $.rm '-rf', 'dist'
