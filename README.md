# Backbone.Giraffe

## Introduction

**Backbone.Giraffe** is a lightweight library that extends [**Backbone.js**](http://documentcloud.github.com/backbone/) to new heights.


## Why Giraffe?

Giraffe extends the base Backbone classes with lifecycle management, event aggregation, and some features we at [Barc](https://barc.com) find useful. Giraffe's goal is to provide a layer of features and conventions that follow the Backbone philosophy of simplicity and flexibilty.

- **Giraffe.View** is a nestable, disposable, and flexible class that provides lifecycle management and some useful features.
- **Giraffe.App** is a special view that helps your views, models, collections, and routers communicate.
- **Giraffe.Router** leverages an app's events to provide programmatic control over your routes and routing events that any object can listen for.
- **Giraffe.Model** and **Giraffe.Collection** are thin wrappers that add Giraffe's lifecycle management and app events.

## Download

[Giraffe 0.1](...)

## Building

    npm install projmate-cli@0.1.0-dev -g
    npm install -d
    pm run all

## License

Copyright (c) 2013 Barc Inc.

See the file LICENSE for copying permission.
