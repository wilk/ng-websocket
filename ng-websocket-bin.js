'use strict';

(function () {
    /**
     * @ngdoc provider
     * @name $websocketProvider
     * @module ngWebsocket
     * @description
     * HTML5 WebSocket provider for AngularJS
     */
    function $websocketProvider() {
        var wsp = this;

        wsp.$$config = {
            lazy: false,
            reconnect: true,
            reconnectInterval: 2000,
            mock: false,
            enqueue: false,
            protocols: null,
            binary: false
        };

        wsp.$setup = function (cfg) {
            cfg = cfg || {};
            wsp.$$config = angular.extend({}, wsp.$$config, cfg);

            return wsp;
        };

        wsp.$get = ['$http', function ($http) {
            return new $websocketService(wsp.$$config, $http);
        }];
    }

    /**
     * @ngdoc service
     * @name $websocketService
     * @module ngWebsocketService
     * @description
     * HTML5 Websocket service for AngularJS
     */
    function $websocketService(cfg, $http) {
        var wss = this;

        wss.$$websocketList = {};
        wss.$$config = cfg || {};

        wss.$get = function (url) {
            return wss.$$websocketList[url];
        };

        wss.$new = function (cfg) {
            cfg = cfg || {};

            // Url or url + protocols initialization
            if (typeof cfg === 'string') {
                cfg = {
                    url: cfg
                };

                // url + protocols
                if (arguments.length > 1) {
                    if (typeof arguments[1] === 'string' && arguments[1].length > 0) cfg.protocols = [arguments[1]];
                    else if (typeof arguments[1] === 'object' && arguments[1].length > 0) cfg.protocols = arguments[1];
                }
            }

            // If the websocket already exists, return that instance
            var ws = wss.$get(cfg.url);

            if (typeof ws === 'undefined') {
                var wsCfg = angular.extend({}, wss.$$config, cfg);

                ws = new $websocket(wsCfg, $http);
                wss.$$websocketList[wsCfg.url] = ws;
            }

            return ws;
        };
    }

    /**
     * @ngdoc class
     * @name $websocket
     * @module ngWebsocket
     * @description
     * HTML5 Websocket wrapper class for AngularJS
     */
    function $websocket(cfg, $http) {
        var me = this;

        if (typeof cfg === 'undefined' || (typeof cfg === 'object' && typeof cfg.url === 'undefined')) throw new Error('An url must be specified for WebSocket');

        me.$$eventMap = {};
        me.$$ws = undefined;
        me.$$reconnectTask = undefined;
        me.$$reconnectCopy = true;
        me.$$queue = [];
        me.$$config = {
            url: undefined,
            lazy: false,
            reconnect: true,
            reconnectInterval: 2000,
            enqueue: false,
            mock: false,
            protocols: null
        };

        me.$$fireEvent = function () {
            var args = [];

            Array.prototype.push.apply(args, arguments);

            var event = args.shift(),
                handlers = me.$$eventMap[event];

            if (typeof handlers !== 'undefined') {
                for (var i = 0; i < handlers.length; i++) {
                    if (typeof handlers[i] === 'function') handlers[i].apply(me, args);
                }
            }
        };

        function utf8ArrayToStr(array) {
            //console.time('utf8ArrayToStr');
            var out, i, len, c;
            var char2, char3;

            out = "";
            len = array.length;
            i = 0;

            while (i < len) {
                c = array[i++];

                switch (c >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        // 0xxxxxxx
                        out += String.fromCharCode(c);
                        break;
                    case 12:
                    case 13:
                        // 110x xxxx   10xx xxxx
                        char2 = array[i++];
                        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                        break;
                    case 14:
                        // 1110 xxxx  10xx xxxx  10xx xxxx
                        char2 = array[i++];
                        char3 = array[i++];
                        out += String.fromCharCode(((c & 0x0F) << 12) |
                            ((char2 & 0x3F) << 6) |
                            ((char3 & 0x3F) << 0));
                        break;
                }
            }

            //console.timeEnd('utf8ArrayToStr');

            return out;
        }

        function ab2string(ab) {
            //console.time('ab2string');
            var u8a = new Uint8Array(ab);

            //console.timeEnd('ab2string');
            return utf8ArrayToStr(u8a);

            // var decoder = new TextDecoder('UTF-8');
            // return decoder.decode(ab);
        }

        function readBlob(blob, done) {
            //console.time('readBlob');
            var fileReader = new FileReader();

            fileReader.onload = function () {
                var ab = this.result;
                //console.timeEnd('readBlob');

                var decoded = JSON.parse(ab2string(ab));

                done(decoded);
            };

            fileReader.readAsArrayBuffer(blob);
        }

        function readArrayBuffer(ab, done) {
            var decoded = JSON.parse(ab2string(ab));
            done(decoded);
        }

        me.$$init = function (cfg) {
            if (cfg.mock) {
                me.$$ws = new $$mockWebsocket(cfg.mock, $http);
            } else if (cfg.protocols) {
                me.$$ws = new WebSocket(cfg.url, cfg.protocols);
            } else {
                me.$$ws = new WebSocket(cfg.url);
            }

            if(me.$$config.binary === true){
                me.$$ws.binaryType = 'arraybuffer';
            }

            me.$$ws.onmessage = function (message) {
                try {
                    if (me.$$config.binary === true) {
                        if (message.data instanceof Blob) {
                            readBlob(message.data, function (decoded) {
                                me.$$fireEvent(decoded.event, decoded.data);
                                me.$$fireEvent('$message', decoded);
                            });
                        }

                        if (message.data instanceof ArrayBuffer) {
                            readArrayBuffer(message.data, function (decoded) {
                                me.$$fireEvent(decoded.event, decoded.data);
                                me.$$fireEvent('$message', decoded);
                            });
                        }
                    } else {
                        var decoded = JSON.parse(message.data);

                        me.$$fireEvent(decoded.event, decoded.data);
                        me.$$fireEvent('$message', decoded);
                    }
                } catch (err) {
                    console.error('WebSocket parser error', err);
                }
            };

            me.$$ws.onerror = function (error) {
                me.$$fireEvent('$error', error);
            };

            me.$$ws.onopen = function () {
                // Clear the reconnect task if exists
                if (me.$$reconnectTask) {
                    clearInterval(me.$$reconnectTask);
                    delete me.$$reconnectTask;
                }

                // Flush the message queue
                if (me.$$config.enqueue && me.$$queue.length > 0) {
                    while (me.$$queue.length > 0) {
                        if (me.$ready()) me.$$send(me.$$queue.shift());
                        else break;
                    }
                }

                me.$$fireEvent('$open');
            };

            me.$$ws.onclose = function (e) {
                // Activate the reconnect task
                if (me.$$config.reconnect) {
                    me.$$reconnectTask = setInterval(function () {
                        if (me.$status() === me.$CLOSED) me.$open();
                    }, me.$$config.reconnectInterval);
                }

                me.$$fireEvent('$close', e);
            };

            return me;
        };

        me.$CONNECTING = 0;
        me.$OPEN = 1;
        me.$CLOSING = 2;
        me.$CLOSED = 3;

        // TODO: it doesn't refresh the view (maybe $apply on something?)
        /*me.$bind = function (event, scope, model) {
         me.$on(event, function (message) {
         model = message;
         scope.$apply();
         });
         };*/

        me.$on = function () {
            var handlers = [];

            Array.prototype.push.apply(handlers, arguments);

            var event = handlers.shift();

            if (typeof event !== 'string' || handlers.length === 0) throw new Error('$on accept two parameters at least: a String and a Function or an array of Functions');

            me.$$eventMap[event] = me.$$eventMap[event] || [];

            for (var i = 0; i < handlers.length; i++) {
                me.$$eventMap[event].push(handlers[i]);
            }

            return me;
        };

        me.$un = function (event) {
            if (typeof event !== 'string') throw new Error('$un needs a String representing an event.');

            if (typeof me.$$eventMap[event] !== 'undefined') delete me.$$eventMap[event];

            return me;
        };

        function stringToUint(string) {
            var string = encodeURIComponent(string),
                charList = string.split(''),
                uintArray = [];

            for (var i = 0; i < string.length; i++) {
                uintArray.push(charList[i].charCodeAt(0));
            }

            return new Uint8Array(uintArray);
        }

        me.$$send = function (message) {
            if (me.$ready()) {

                var out;

                if (me.$$config.binary === true) {
                    out = stringToUint(JSON.stringify(message))
                } else {
                    out = JSON.stringify(message);
                }

                me.$$ws.send(out);

            } else if (me.$$config.enqueue) {
                me.$$queue.push(message);
            }
        };

        me.$emit = function (event, data) {
            if (typeof event !== 'string') throw new Error('$emit needs two parameter: a String and a Object or a String');

            var message = {
                event: event,
                data: data
            };

            me.$$send(message);

            return me;
        };

        me.$open = function () {
            me.$$config.reconnect = me.$$reconnectCopy;

            if (me.$status() !== me.$OPEN) me.$$init(me.$$config);
            return me;
        };

        me.$close = function () {
            if (me.$status() !== me.$CLOSED) me.$$ws.close();

            if (me.$$reconnectTask) {
                clearInterval(me.$$reconnectTask);
                delete me.$$reconnectTask;
            }

            me.$$config.reconnect = false;

            return me;
        };

        me.$status = function () {
            if (typeof me.$$ws === 'undefined') return me.$CLOSED;
            else return me.$$ws.readyState;
        };

        me.$ready = function () {
            return me.$status() === me.$OPEN;
        };

        me.$mockup = function () {
            return me.$$config.mock;
        };

        // setup
        me.$$config = angular.extend({}, me.$$config, cfg);
        me.$$reconnectCopy = me.$$config.reconnect;

        if (!me.$$config.lazy) me.$$init(me.$$config);

        return me;
    }

    function $$mockWebsocket(cfg, $http) {
        cfg = cfg || {};

        var me = this,
            openTimeout = cfg.openTimeout || 500,
            closeTimeout = cfg.closeTimeout || 1000,
            messageInterval = cfg.messageInterval || 2000,
            fixtures = cfg.fixtures || {},
            messageQueue = [];

        me.CONNECTING = 0;
        me.OPEN = 1;
        me.CLOSING = 2;
        me.CLOSED = 3;

        me.readyState = me.CONNECTING;

        me.send = function (message) {
            if (me.readyState === me.OPEN) {
                messageQueue.push(message);
                return me;
            } else throw new Error('WebSocket is already in CLOSING or CLOSED state.');
        };

        me.close = function () {
            if (me.readyState === me.OPEN) {
                me.readyState = me.CLOSING;

                setTimeout(function () {
                    me.readyState = me.CLOSED;

                    me.onclose();
                }, closeTimeout);
            }

            return me;
        };

        me.onmessage = function () {
        };
        me.onerror = function () {
        };
        me.onopen = function () {
        };
        me.onclose = function () {
        };

        setInterval(function () {
            if (messageQueue.length > 0) {
                var message = messageQueue.shift(),
                    msgObj = JSON.parse(message);

                switch (msgObj.event) {
                    case '$close':
                        me.close();
                        break;
                    default:
                        // Check for a custom response
                        if (typeof fixtures[msgObj.event] !== 'undefined') {
                            msgObj.data = fixtures[msgObj.event].data || msgObj.data;
                            msgObj.event = fixtures[msgObj.event].event || msgObj.event;
                        }

                        message = JSON.stringify(msgObj);

                        me.onmessage({
                            data: message
                        });
                }
            }
        }, messageInterval);

        var start = function (fixs) {
            fixs = fixs || {};
            fixs = fixs instanceof Error ? {} : fixs;

            fixtures = fixs;

            setTimeout(function () {
                me.readyState = me.OPEN;
                me.onopen();
            }, openTimeout);
        };

        // Get fixtures from a server or a file if it's a string
        if (typeof fixtures === 'string') {
            $http.get(fixtures)
                .success(start)
                .error(start);
        } else start(fixtures);

        return me;
    }

    /**
     * @ngdoc module
     * @name $websocket
     * @module ngWebsocket
     * @description
     * HTML5 WebSocket module for AngularJS
     */
    angular
        .module('ngWebsocket', [])
        .provider('$websocket', $websocketProvider);
})();
