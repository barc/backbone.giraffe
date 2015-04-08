## Changelog

### 0.2.8

- Fixed AMD loader.
- Added `Giraffe.noConflict` and `Giraffe.Contrib.noConflict`.
- `Contrib` now attaches itself as `root.GiraffeContrib` in addition to the existing `Giraffe.Contrib`.

### 0.2.7

- Fixed module loader for r.js optimizer.

### 0.2.6

- Configured objects (including all Giraffe objects) now have the following
  no-op function hooks for you to implement:
  `beforeDispose`, `afterDispose`, `beforeInitialize`, and `afterInitialize`.

- Disposed objects have a new property `_dispose` set to `true`.

### 0.2.5

- Support optional params for Router#isCaused and Router#cause. Optional static routes remain unsupported. See [issue 19](https://github.com/barc/backbone.giraffe/issues/19) for more.
- Contrib can now be required from the root: `require('backbone.giraffe/contrib')`.
- All invariants now throw errors instead of logging.

### 0.2.4

- Allow passing routing options to Giraffe.Router#cause.

### 0.2.3

- Fixed support for 0 as a path param.

### 0.2.2

- Added Backbone and Underscore CommonJS requires to Giraffe.Contrib.

### 0.2.1

- Fixed AMD loader check.

### 0.2.0

- Added support for AMD and node-style loaders.

- Put contributors in one place, the AUTHORS file.

- Using accurate semantic versioning, starting...now.

### 0.1.5

- Added events around several view methods: `rendering`, `rendered`,
  `attaching`, `attached`, `detaching`, `detached`

- ___BREAKING CHANGE:___ `dispose` now acts on `this` instead of taking the
  target object as an argument. Removed `disposeThis` as it's now redundant.

- Registered as a Bower package: `bower install backbone.giraffe`

### 0.1.4

- Added the function `Giraffe.configure` which 
  [mixes several Giraffe features](http://barc.github.io/backbone.giraffe/backbone.giraffe.html#configure)
  into any object. Used in the constructors of all Giraffe objects.

- `omittedOptions` can be used to prevent `Giraffe.configure` from extending
  particular properties. If the value is `true`, all properties are omitted.

- The document event prefix `'data-gf-'` is now configurable via
  `Giraffe.View.setDocumentEventPrefix` and as a parameter to 
  `Giraffe.View.setDocumentEvents` and `Giraffe.View.removeDocumentEvents`.

- ___BREAKING CHANGE:___ `dispose` is now mixed into configured objects
  with a default function, and is only copied if it doesn't exist.
  As a result, calls to super in `dispose` no longer make sense.
  Use `Giraffe.dispose` instead.

- `beforeDispose`, `afterDispose`, `beforeInitialize`, and `afterInitialize`
  are called if defined on all configured objects. Some are used by Giraffe
  objects so override with care.

- Added `Giraffe.wrapFn` which calls 'beforeFnName' and 'afterFnName' versions
  of a function name on an object. Here's a reference for future development - 
  [__Backbone.Advice__](https://github.com/rhysbrettbowen/Backbone.Advice)