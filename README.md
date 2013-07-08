# Backbone.Giraffe

## Introduction

**Backbone.Giraffe** is a lightweight library that extends [**Backbone.js**](http://documentcloud.github.com/backbone/) to new heights. Giraffe's goal is to follow the Backbone philosophy of simplicity and flexibilty to provide commonly needed features with few assumptions. It differs from other Backbone libraries like Marionette and Chaplin in its reduced scope and size, and it takes a different approach to the problems of route handling, object lifecycles, event aggregation, and view management.

## Overview

Giraffe extends the base Backbone classes with lifecycle management, event aggregation for app-wide communication and route handling, and some features we at [Barc](https://barc.com) find useful.

- **Giraffe.View** is a nestable, disposable, and flexible class that provides lifecycle management and some useful features.

- **Giraffe.App** is a special view that helps your views, models, collections, and routers communicate.

- **Giraffe.Router** leverages an app's events to provide routing events that any object can listen for and programmatic route encapsulation.

- **Giraffe.Model** and **Giraffe.Collection** are thin wrappers that add Giraffe's lifecycle management and app events.

## Download

[backbone.giraffe.js](https://raw.github.com/barc/backbone.giraffe/master/dist/backbone.giraffe.js) *48.8k* **(version 0.1)**

[backbone.giraffe.min.js](https://raw.github.com/barc/backbone.giraffe/master/dist/backbone.giraffe.min.js) *14.6k*

## Building

    npm install projmate-cli@0.1.0-dev -g
    pm run all

## License

Copyright (c) 2013 Barc Inc.

See the file [LICENSE](license.html) for copying permission.
