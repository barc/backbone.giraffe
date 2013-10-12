## Changelog


### 0.2.0

- ___BREAKING CHANGES:___

  - Giraffe.App now emits `after:start` and 'before:start' events instead
    of `app:initializing'` and `'app:initialized'`.
    All configured objects (which includes all Giraffe objects) can now use
    the `addInitializer` and `start` functionality if the `Startable` plugin
    is included.

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
  Use `Giraffe.dispose` instead. If memory consumption is a concern, copy the
  default `Giraffe.disposeThis` to your prototypes (or write your own).

- `beforeDispose`, `afterDispose`, `beforeInitialize`, and `afterInitialize`
  are called if defined on all configured objects. Some are used by Giraffe
  objects so override with care.

- Added `Giraffe.wrapFn` which calls 'beforeFnName' and 'afterFnName' versions
  of a function name on an object. Here's a reference for future development - 
  [__Backbone.Advice__](https://github.com/rhysbrettbowen/Backbone.Advice)