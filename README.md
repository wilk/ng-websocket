ng-websocket
============

AngularJS HTML5 WebSocket powerful module

# Index

  - [Introduction](#introduction)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Tutorial](#tutorial)
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

# Introduction

ngWebsocket is a library that provides a provider and a service to handle HTML5 WebSocket with ease
in pure AngularJS style!
The idea behind this module is to give four kinds of object to handle websockets:

  - $websocketProvider: the provider is on top of usage. In fact, you can setup a general configuration for each ngWebsocket you're going to create
  - $websocket: following an Angular service that lets you to handle different websocket instance among your application
  - ngWebsocket: an instance of the HTML5 WebSocket wrapper (this is actually the core of this module): it provides lots of feature to work with websockets
  - $$mockWebsocket: this is a smart implementation of a websocket backend that lets you to developer and test your app without a real responding server

For each of these objects an API is available and fully documented in this document.

# Requirements

The only requirement needed is [AngularJS]() that you can install it via [Bower]().

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

# Tutorial

Need to use HTML5 WebSocket to build your cool web application, huh?
No problem, dude! Check this out!

```javascript
'use strict';

angular.module('MyCoolWebApp', ['ngWebsocket'])
    .run(function ($websocket) {
        var ws = $websocket.$new('ws://localhost:12345'); // instance of ngWebsocket, handled by $websocket service

        ws.$on('$open', function () {
            console.log('Oh my gosh, websocket is really open! Fukken awesome!');

            ws.$emit('ping', 'hi listening websocket server'); // send a message to the websocket server

            var data = {
                level: 1,
                text: 'ngWebsocket rocks!',
                array: ['one', 'two', 'three'],
                nested: {
                    level: 2,
                    deeper: [{
                        hell: 'yeah'
                    }, {
                        so: 'good'
                    }]
                }
            };

            ws.$emit('pong', data);
        });

        ws.$on('pong', function (data) {
            console.log('The websocket server has sent the following data:');
            console.log(data);

            ws.$close();
        });

        ws.$on('$close', function () {
            console.log('Noooooooooou, I want to have more fun with ngWebsocket, damn it!');
        });
    });
```

Easy, right?

Well, let's chain it!

```javascript
'use strict';

angular.module('MyCoolChainedWebApp', ['ngWebsocket'])
    .run(function ($websocket) {
        var ws = $websocket.$new('ws://localhost:12345')
          .$on('$open', function () {
            console.log('Oh my gosh, websocket is really open! Fukken awesome!');

            var data = {
                level: 1,
                text: 'ngWebsocket rocks!',
                array: ['one', 'two', 'three'],
                nested: {
                    level: 2,
                    deeper: [{
                        hell: 'yeah'
                    }, {
                        so: 'good'
                    }]
                }
            };

            ws.$emit('ping', 'hi listening websocket server') // send a message to the websocket server
              .$emit('pong', data);
          })
          .$on('pong', function (data) {
            console.log('The websocket server has sent the following data:');
            console.log(data);

            ws.$close();
          })
          .$on('$close', function () {
            console.log('Noooooooooou, I want to have more fun with ngWebsocket, damn it!');
          });
    });
```

Your back-end team is lazy? No problem: we can do it on our own!

```javascript
'use strict';

angular.module('MyIndipendentCoolWebApp', ['ngWebsocket'])
    .run(function ($websocket) {
        var ws = $websocket.$new({
            url: 'ws://localhost:12345',
            mock: {
                fixtures: {
                    'custom event': 'websocket server mocked response',
                    'another event': {
                        damn: 'dude',
                        that: 'is awesome!'
                    }
                }
            }
        });

        ws.$on('$open', function () {
            ws.$emit('an event', 'a parrot response') // by default it responde with the same incoming data
              .$emit('custom event') // otherwise it uses the given fixtures
              .$emit('another event'); // even for objects
          })
          .$on('an event', function (message) {
            console.log(message); // it prints 'a parrot response'
          })
          .$on('custom event', function (message) {
            console.log(message); // it prints 'websocket server mocked response'
          })
          .$on('another event', function (message) {
            console.log(message); // it prints the object {damn: 'dude', that: 'is awesome!'}
          });
    });
```

# API

ngWebsocket APIs are composed by four different modules:

 - $websocketProvider
 - $websocket
 - ngWebsocket
 - $$mockWebsocket (private but configurable)

## $websocketProvider

Following the API of ngWebsocket Provider

### $setup

If you need to setup your custom default configuration for each ngWebsocket istance, pass it to this method:

```javascript
angular.config(function ($websocketProvider) {
    $websocketProvider.$setup({
        lazy: false,
        reconnect: true,
        reconnectInterval: 2000,
        mock: false,
        enqueue: false
    });
});
```

## $websocket

Following the API of the $websocket Service

### $get

Every ngWebsocket instance created with [$websocket.$new](#$new) method are stored within the $websocket service.
To get one of them, you can use **$get** with the url of the websocket you're looking for:

```javascript
angular.run(function ($websocket) {
    var ws = $websocket.$get('ws://localhost:12345');
});
```

The url is needed because it is stored using the url as the key of an hashmap.

### $new

There are two ways to create a new instance of ngWebsocket:

**string (url)**

The url is always needed and it has to start with the websocket schema (ws:// or wss://):

```javascript
angular.run(function ($websocket) {
    var ws = $websocket.$new('ws://localhost:12345');
});
```

A new instance is returned and the internal WebSocket has already started the connection with the websocket server on the backend.

**object**

All of the following configurations can be changed:

```javascript
angular.run(function ($websocket) {
    var ws = $websocket.$new(
        url: 'ws://localhost:12345',
        lazy: false,
        reconnect: true,
        reconnectInterval: 2000,
        mock: false,
        enqueue: false
    );
});
```

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