fs = require("fs")
coffee = require("coffee-script")
dox = require("dox")
Funcd = require("funcd")
_ = require("underscore")
_.str = require("underscore.string")


exports.generateFromFileName = (fileName, options = {}, cb) ->
  if typeof options is "function"
    cb = options
    options = {}
  source = fs.readFileSync(fileName, "utf8")
  options.coffeeScript ?= _.str.endsWith(fileName, ".coffee")
  exports.generate source, options, cb


exports.generate = (source, options = {}, cb) ->
  if typeof options is "function"
    cb = options
    options = {}
  js = if options.coffeeScript then coffee.compile(source) else source
  json = dox.parseComments(js)
  exports.generateFromDoxJSON json, options, cb


exports.generateFromDoxJSON = (json, options = {}, cb) ->
  if typeof options is "function"
    cb = options
    options = {}
  html = Funcd.render(createHTML, {json, options})
  cb? html
  html


createHTML = (t, data) ->
  {json, options} = data
  options ?= {}
  {navHeaderTemplate, navFooterTemplate, contentHeaderTemplate, contentFooterTemplate} = options

  sections = getSections(json)

  t.div id:"nav", ->
    t.div id:"nav-background"

    navHeaderTemplate? t, data
    
    for section in sections
      headerItem = _.first(section)
      headerItemName = headerItem.ctx.name
      t.div class:"nav-title", ->
        t.a href:"##{headerItemName}", headerItemName
      t.ul ->
        for item in section.slice(1)
          if item.ctx
            itemName = item.ctx.name
            t.li ->
              t.a href:"##{headerItemName}-#{itemName}", ->
                t.span class:"light-text", "."
                t.text item.ctx.name

    navFooterTemplate? t, data

  t.div id:"content", ->
    
    contentHeaderTemplate? t, data

    for section in sections
      t.section ->
        headerItem = _.first(section)
        headerItemName = headerItem.ctx.name
        t.h2 id:"#{headerItemName}", ->
          t.text headerItemName
          t.span class:"caption", getCaption(headerItem, headerItem)
        t.raw headerItem.description.full
        for item in section.slice(1)
          if item.ctx
            itemName = item.ctx.name
            t.h3 id:"#{headerItemName}-#{itemName}", ->
              t.text itemName
              t.span class:"caption", getCaption(item, headerItem)
          t.raw item.description.full

    contentFooterTemplate? t, data


getSections = (json) ->
  sections = []
  for item in json
    if item.ctx?.receiver is "Giraffe"
      sections.push [item]
    else
      _.last(sections).push item
  sections


getCaption = (item, headerItem) ->
  caption = ""

  captionTag = _.find(item.tags, (t) -> t.type is "caption")

  return captionTag.string if captionTag

  if isInstanceMethod(item)
    caption += "#{item.ctx.cons.toLowerCase()}.#{item.ctx.name}"
    caption += getMethodParams(item)
  else if isClass(item, headerItem)
    caption += "new #{item.ctx.string}"
    caption += getMethodParams(item)
  else if isStaticMethod(item, headerItem)
    caption = "#{headerItem.ctx.string}.#{item.ctx.name}"
    caption += getMethodParams(item)
  else if isTopLevelFunction(item, headerItem)
    caption = "#{item.ctx.receiver}.#{item.ctx.name}"
    caption += getMethodParams(item)
  else if isInstanceProperty(item, headerItem)
    caption = "#{headerItem.ctx.name.toLowerCase()}.#{item.ctx.name}"

  caption

isInstanceMethod = (item) ->
  item.ctx.type is "method" and item.ctx.cons

isClass = (item, headerItem) ->
  item is headerItem and
    item.ctx.type is "property" and
    item.ctx.string is "#{item.ctx.receiver}.#{item.ctx.name}" and
    item.ctx.name[0] is item.ctx.name[0].toUpperCase()

isInstanceProperty = (item, headerItem) ->
  !isClass(item, headerItem) and item.ctx.type is "property"

isStaticMethod = (item, headerItem) ->
  item.ctx.type is "method" and
    item.ctx.receiver is headerItem.ctx.name

isTopLevelFunction = (item, headerItem) ->
  item is headerItem and
    item.ctx.type is "method" and
    item.ctx.string is "#{item.ctx.receiver}.#{item.ctx.name}()" and
    item.ctx.name[0] is item.ctx.name[0].toLowerCase()

getMethodParams = (item) ->
  params = "("
  paramCount = 0
  for tag in item.tags
    continue unless tag.type is "param"
    params += ", " if paramCount > 0
    paramCount += 1
    params += tag.name
  params += ")"
  params