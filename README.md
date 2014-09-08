ng-websocket
============

AngularJS HTML5 WebSocket powerful library

# Index

  - [Introduction](#introduction)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [$websocketProvider](#$websocketProvider)
      - [$setup](#$setup)
    - [$websocket](#$websocket)
      - [$new](#$new)
      - [$get](#$get)
    - [ngWebsocket](#ngWebsocket)
      - [Constructor](#constructor)
      - [Constants](#constants)
      - [Events](#events)
      - [$on](#$on)
      - [$un](#$un)
      - [$emit](#$emit)
      - [$open](#$open)
      - [$close](#$close)
      - [$status](#$status)
      - [$ready](#$ready)
      - [$mockup](#$mockup)
    - [$$mockWebsocket](#$$mockWebsocket)
      - [Constructor](#constructor)
  - [License](#license)

# Requirements

The only needed requirement is [AngularJS]() that you can install it via [Bower]().

# Installation

Use [Bower]() to install this module:

```bash
$ bower install ng-websocket
```

Or simply `git clone` the repo:

```bash
$ git clone https://github.com/wilk/ngWebsocket
```

# Usage

After the [Installation](#installation), require it in your Angular application.

Firstly, in your `index.html`:

```html
<html>
    <head>
        <script src="bower_components/ng-websocket/ng-websocket.js"></script>
    </head>
</html>
```

Then, in your Angular application definition (assumed `app.js`):

```javascript
    `use strict';

    angular.module('MyApp', ['ngWebsocket']);
```

Now, you're ready to use it!

# API

ngWebsocket APIs are composed by four different modules:

 - $websocketProvider
 - $websocket
 - ngWebsocket
 - $$mockWebsocket (internal but configurable)

## $websocketProvider

Following the API of ngWebsocket Provider

### $setup

## $websocket

Following the API of ngWebsocket Service

### $get

### $new

## ngWebsocket

Following the core API

### Constructor

### Constants

### Events

### $on

### $un

### $emit

### $open

### $close

### $status

### $ready

### $mockup

## $$mockWebsocket

Following the API to configure the internal mocked ngWebsocket server

### Constructor

# License

Check out LICENSE file (MIT)