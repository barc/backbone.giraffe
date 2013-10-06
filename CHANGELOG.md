## Changelog

### 0.1.4

- Added the function `Giraffe.configure` which mixes __Giraffe__ features into
  any function/class instance.

- `omittedOptions` can be used to prevent `Giraffe.configure` from extending
  particular properties

- `beforeDispose`, `afterDispose`, `beforeInitialize`, and `afterInitialize`
  are empty functions that can be filled in on a configured object.
  `Giraffe.wrapFn` adds before and after hooks to a function.