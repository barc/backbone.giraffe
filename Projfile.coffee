fs = require('fs')
doxdown = require('./src/docs/doxdown.coffee')

COMMON = """
  ```html --hide
  <script src="http://code.jquery.com/jquery-1.9.1.min.js"></script>
  <script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js"></script>
  <script src="http://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js"></script>
  <script src="../../backbone.giraffe.js" type="text/javascript"></script>
  ```

  ```css --hide
  /**
   * Eric Meyer's Reset CSS v2.0 (http://meyerweb.com/eric/tools/css/reset/)
   * http://cssreset.com
   */
  html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldset,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{margin:0;padding:0;border:0;font-size:100%;font:inherit;vertical-align:baseline}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:'';content:none}table{border-collapse:collapse;border-spacing:0}
  ```
"""

exports.server =
  dirname: 'build/'


exports.project = (pm) ->
  {f, $, Utils} = pm

  changeToBuild = f.tap (asset) ->
    asset.filename = asset.filename.replace(/^src/, 'build')

  changeExtname = (extname) ->
    return f.tap (asset) ->
      asset.filename = Utils.changeExtname(asset.filename, extname)

  doxdownFilter = f.tap (asset, options, cb) ->
    options =
      navHeaderTemplate: (t, data) ->
        t.a href:"index.html", ->
          t.div class:"nav-title", "Backbone.Giraffe"
      contentHeaderTemplate: (t, data) ->
        t.a href:"index.html", ->
          t.img id:"logo", src:"img/logo.png"
      contentFooterTemplate: (t, data) ->
        t.script """
          (function() {
            var b = document.createElement("script"); b.type = "text/javascript"; b.async = true;
            b.src = "//barc.com/js/libs/barc/barc.js";
            var s = document.getElementsByTagName("script")[0]; s.parentNode.insertBefore(b, s);
          })();
        """
      coffeeScript: asset.extname == '.coffee'
    doxdown.generate asset.text, options, (html) ->
      cb null, html

  all: ['clean', 'giraffe', 'miniGiraffe', 'api', 'docs', 'stylesheets', 'staticFiles']

  giraffe:
    desc: 'Builds Giraffe'
    files: 'src/backbone.giraffe.coffee'
    dev: [
      f.coffee
      changeToBuild
      f.writeFile
    ]

  miniGiraffe:
    desc: 'Builds Minified Giraffe'
    files: 'src/backbone.giraffe.coffee'
    dev: [
      f.coffee
      f.uglify
      f.writeFile _filename: 'build/backbone.giraffe.min.js'
    ]

  _copyReadmeAsIndex:
    desc: 'Copies README.md as the source for index.html'
    dev: ->
      $.cp 'README.md', 'src/docs/index.md'

  _deleteTempIndex:
    desc: 'Deletes copied README.md'
    dev: ->
      $.rm 'src/docs/index.md'

  _docs:
    desc: 'Builds docs'
    files: ['src/docs/*.md']
    dev: [

      f.tap (asset) ->
        asset.filename = asset.filename.replace(/^src/, 'build')
        asset.text = asset.text.replace('{{{COMMON}}}', COMMON)
      f.tutdown layout: __dirname + '/src/docs/_tutdownLayout.mustache'
      f.template delimiters: 'mustache', layout: 'src/docs/_layout.mustache'
      f.writeFile
    ]

  docs:
    desc: 'Builds the docs'
    deps: ['_copyReadmeAsIndex', '_docs', '_deleteTempIndex']

  api:
    desc: 'Builds API documentation'
    deps: ['stylesheets', 'staticFiles']
    files: ['src/backbone.giraffe.coffee']
    dev: [
      doxdownFilter
      f.template delimiters: 'mustache', layout: 'src/docs/_layout.mustache'
      f.writeFile _filename: 'build/docs/api.html'
    ]

  stylesheets:
    desc: 'Builds less files'
    files: ['src/docs/css/style.less']
    dev: [
      f.less
      changeToBuild
      f.writeFile
    ]

  staticFiles:
    desc: 'Copies static files'
    dev: ->
      $.cp '-rf', 'src/docs/img', 'build/docs'

  clean: ->
    $.rm '-rf', 'build'
