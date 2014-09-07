'use strict';

/**
 * @ngdoc module
 * @name $websocket
 * @module ngWebsocket
 * @description
 * HTML5 WebSocket module for AngularJS
 */
angular
    .module('ngWebsocket', [])
    /**
     * @ngdoc provider
     * @name $websocketProvider
     * @module ngWebsocket
     * @description
     * HTML5 WebSocket provider for AngularJS
     */
    .provider('$websocket', function () {
        var wsp = this;

        /**
         * @ngdoc service
         * @name $websocket
         * @module ngWebsocket
         * @description
         * HTML5 Websocket service for AngularJS
         */
        function $websocketService (cfg) {
            var wss = this;

            wss.$$websocketList = {};
            wss.$$config = cfg || {};

            wss.$get = function (url) {
                return wss.$$websocketList[url];
            };

            wss.$new = function (cfg) {
                cfg = cfg || {};

                if (typeof cfg === 'string') cfg = {url: cfg};

                var wsCfg = angular.extend({}, wss.$$config, cfg);

                var ws = new $websocket(wsCfg);
                wss.$$websocketList[wsCfg.url] = ws;

                return ws;
            };
        }

        function $$mockWebsocket (cfg) {
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
                }
                else throw new Error('WebSocket is already in CLOSING or CLOSED state.');
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

            me.onmessage = function () {};
            me.onerror = function () {};
            me.onopen = function () {};
            me.onclose = function () {};

            setInterval(function () {
                if (messageQueue.length > 0) {
                    var message = messageQueue.shift(),
                        msgObj = JSON.parse(message);

                    switch (msgObj.event) {
                        case 'close':
                            me.close();
                            break;
                        default:
                            var fixture = fixtures[msgObj.event];

                            if (fixture) {
                                msgObj.data = fixture;
                                message = JSON.stringify(msgObj);
                            }

                            me.onmessage({
                                data: message
                            });
                    }
                }
            }, messageInterval);

            setTimeout(function () {
                me.readyState = me.OPEN;
                me.onopen();
            }, openTimeout);

            return me;
        }

        /**
         * @ngdoc class
         * @name $websocket
         * @module ngWebsocket
         * @description
         * HTML5 Websocket wrapper class for AngularJS
         */
        function $websocket (cfg) {
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
                mock: false
            };

            me.$$fireEvent = function () {
                var args = [];

                Array.prototype.push.apply(args, arguments);

                var event = args.shift(),
                    handler = me.$$eventMap[event];

                if (typeof handler === 'function') handler.apply(me, args);
            };

            me.$$init = function (cfg) {
                me.$$ws = cfg.mock ? new $$mockWebsocket(cfg.mock) : new WebSocket(cfg.url);

                me.$$ws.onmessage = function (message) {
                    try {
                        var decoded = JSON.parse(message.data);
                        me.$$fireEvent(decoded.event, decoded.data);
                        me.$$fireEvent('$message', decoded);
                    }
                    catch (err) {
                        me.$$fireEvent('$message', message.data);
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

                me.$$ws.onclose = function () {
                    // Activate the reconnect task
                    if (me.$$config.reconnect) {
                        me.$$reconnectTask = setInterval(function () {
                            if (me.$status() === me.$CLOSED) me.$open();
                        }, me.$$config.reconnectInterval);
                    }

                    me.$$fireEvent('$close');
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

            me.$on = function (event, handler) {
                if (typeof event !== 'string' || typeof handler !== 'function') throw new Error('$on accept two parameters: a String and a Function');

                me.$$eventMap[event] = handler;

                return me;
            };

            me.$un = function (event) {
                if (typeof event !== 'string') throw new Error('$un accept just a String');

                delete me.$$eventMap[event];

                return me;
            };

            me.$$send = function (message) {
                if (me.$ready()) me.$$ws.send(JSON.stringify(message));
                else if (me.$$config.enqueue) me.$$queue.push(message);
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

        wsp.$$config = {
            lazy: false,
            reconnect: true,
            reconnectInterval: 2000,
            mock: false,
            enqueue: false
        };

        wsp.$setup = function (cfg) {
            cfg = cfg || {};
            wsp.$$config = angular.extend({}, wsp.$$config, cfg);

            return wsp;
        };

        wsp.$get = function () {
            return new $websocketService(wsp.$$config);
        };
    });