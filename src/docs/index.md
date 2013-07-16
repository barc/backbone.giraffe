# Backbone.Giraffe

## Introduction

__Backbone.Giraffe__ is a light and flexible library that extends
[__Backbone.js__](http://documentcloud.github.com/backbone/) to new heights.
__Giraffe__'s goal is to follow the __Backbone__ philosophy of unopinionated
simplicity to provide commonly needed features with few assumptions. It differs
from other __Backbone__ libraries like __Marionette__ and __Chaplin__ in its
reduced scope and size, and it takes a different approach to the problems of
route handling, object lifecycles, event aggregation, and view management.

## Overview

- __Giraffe.View__ is a nestable and flexible class that provides lifecycle
management and many other useful features. It defaults to __Underscore__
templates and easily supports any form of string templating.

- __Giraffe.App__ is a special view that helps your views, models, collections,
and routers communicate by acting as an event hub. Multiple apps can coexist and
teardown is as simple as it gets.

- __Giraffe.Router__ leverages an app's events to trigger routing events that
any object can listen for.

- __Giraffe.Model__ and __Giraffe.Collection__ are thin wrappers that add
__Giraffe__'s lifecycle management and app events.

## Documentation

Read the [__API docs__](http://barc.github.io/backbone.giraffe/api.html) and
check out our [__live examples__](http://barc.github.io/backbone.giraffe/viewBasics.html).

## How Giraffe is Different

__Giraffe__ was created by the needs of our team as we built
[__Barc__](http://barc.com). We tried many existing libraries but some did way too
much, others added too many layers, and others performed poorly.

__Giraffe__ does not have all the bells and whistles of the larger frameworks.
We found the effort to customize them for our needs was more effort than simply 
building upon __Backbone__ with a minimalist approach. For example, there is no
concept of specialized containers like regions or layouts, as any view in
__Giraffe__ can act as a parent of one or more child views. __Giraffe__ also
has no CollectionView or ItemView, but we are open to suggestions to make
__Giraffe__ as useful as possible to __Backbone__ developers who want an
extension library with few opinions.

Is this framework for you? It depends. We feel __Giraffe__ adds essential
features to make you more productive with __Backbone__.

### Highlights

- __Routes emit events__ instead of being tied to functions. This makes it
extremely simple for a deeply nested view to act on a route.

- __Reverse routes with arguments__ provide a way to trigger actions in the
application without having to know a URL path.

- __App-wide event hub__ with convenient `appEvents` bindings inspired by
`Backbone.View#events`.

- __`Giraffe.View#attachTo(someElement)`__ allows views to move anywhere on the
DOM without clobbering each other's events, and it automatically sets up
parent-child relationships for memory management.

- __Object tracking__ to mitigate memory leaks. It's automatic for nested
__Giraffe.Views__ and can be used for any object with a `dispose` method via
`Giraffe.View#addChild`.

- __(A)sync app initialization__ helps an app reach its ready state. For
example, an app may need to wait for asynchronous bootstrap data or a websocket
connection before starting.

- __Declarative event handling__ in markup for simple one-way binding. (does not
try to be __Knockout__ or __AngularJS__)


## Download

__Version 0.1__

<p>
<a href="https://raw.github.com/barc/backbone.giraffe/master/dist/backbone.giraffe.js" class="big-button">backbone.giraffe.js</a><em class="button-size-label">54.6k</em>
</p>
<p>
<a href="https://raw.github.com/barc/backbone.giraffe/master/dist/backbone.giraffe.min.js" class="big-button">backbone.giraffe.min.js</a><em class="button-size-label">16.1k</em>
</p>

[Giraffe on Github](https://github.com/barc/backbone.giraffe)


## License

Copyright (c) 2013 Barc Inc.

See the file [LICENSE](license.html) for copying permission.
