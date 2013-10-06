## Changelog

### 0.1.4

- Added the function `Giraffe.configure` which adds __Giraffe__ features to any
  object. It abstracts out common functionality and can be considered a mixin.

- `omittedOptions` can be used to prevent `Giraffe.configure` from extending
  particular properties

- `beforeDispose`, `afterDispose`, `beforeInitialize`, and `afterInitialize`
  are empty functions that can be filled in on configured object.
  `Giraffe.wrapFn` adds before and after hooks to a function.