# Backbone.Giraffe

## Introduction

**Backbone.Giraffe** is a lightweight library that extends [**Backbone.js**](http://documentcloud.github.com/backbone/) to new heights. Giraffe's goal is to follow the Backbone philosophy of simplicity and flexibilty to provide commonly needed features with few assumptions. It differs from other Backbone libraries like Marionette and Chaplin in its reduced scope and size, and it takes a different approach to the problems of route handling, object lifecycles, event aggregation, and view management.

## Overview

Giraffe extends the base Backbone classes with lifecycle management, event aggregation for app-wide communication and route handling, and some features we at [Barc](https://barc.com) find useful.

- **Giraffe.View** is a nestable, disposable, and flexible class that provides lifecycle management and some useful features.

- **Giraffe.App** is a special view that helps your views, models, collections, and routers communicate.

- **Giraffe.Router** leverages an app's events to provide routing events that any object can listen for and programmatic route encapsulation.

- **Giraffe.Model** and **Giraffe.Collection** are thin wrappers that add Giraffe's lifecycle management and app events.

## How it is Different

__Giraffe__ was created by the needs of our team as we built [Barc](http://barc.com).
We tried many existing libraries but some did way too much, others
added too many layers, and others performed poorly.

__Giraffe__ does not have all the bells and
whistles of the larger frameworks. For example, there is no CollectionView
or ItemView. We found the effort to customize them for our needs was more
effort than simply attaching child views to a container. In fact, there is
no concept of specialiased containers like regions as any view in __Giraffe__
can act as a parent of one or more child views.

Is this Framework for you? It depends. We feel __Giraffe__ adds essential
features to make you more productive with Backbone.

### Highlights

- __Routes emit events__ and not tied to functions. This makes it extremely
simple for a deeply nested view to act on a route.

- __Reverse routes with arguments__ A way to trigger actions in the
application without having to know a URL path.

- `View.attachTo(someElement)` inverse logic is simpler in most cases and
easier to reattach views.

- (A)sync app initialization (asyncronously fetch bootstrap data)

- Object tracking to mitigate memory leaks

- Application wide event hub

- Declarative event handling in markup (does not try to be Knockdown or AngularJS)


## Download

[backbone.giraffe.js](https://raw.github.com/barc/backbone.giraffe/master/dist/backbone.giraffe.js) *48.8k* **(version 0.1)**

[backbone.giraffe.min.js](https://raw.github.com/barc/backbone.giraffe/master/dist/backbone.giraffe.min.js) *14.6k*

## Building

    npm install projmate-cli@0.1.0-dev -g
    pm run all

## License

Copyright (c) 2013 Barc Inc.

See the file [LICENSE](license.html) for copying permission.
