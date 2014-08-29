'use strict';

angular
    .module('ngWebsocket', [])
    .provider('$websocket', function () {
        var wsp = this;

        function $websocketManager () {
            var wsm = this;

            wsm.$$websocketList = {};
            wsm.$$config = {
                url: undefined,
                lazy: false
            };

            wsm.$setup = function (cfg) {
                cfg = cfg || {};
                wsm.$$config.lazy = cfg.lazy || wsm.$$config.lazy;
            };

            wsm.$new = function (cfg) {
                var wsCfg = angular.copy(wsm.$$config);

                if (typeof cfg === 'string') {
                    wsCfg.url = cfg;
                }
                else if (typeof cfg === 'object') {
                    for (var prop in cfg) {
                        if (wsCfg.hasOwnProperty(prop)) wsCfg[prop] = cfg[prop];
                    }
                }

                var ws = new $websocket(wsCfg);
                wsm.$$websocketList[wsCfg.url] = ws;

                return ws;
            };
        }

        function $websocket (cfg) {
            var me = this;

            me.$$eventMap = {};
            me.$$config = cfg;
            me.$$ws = undefined;

            me.$$fireEvent = function () {
                var args = [];

                Array.prototype.push.apply(args, arguments);

                var event = args.shift(),
                    handler = me.$$eventMap[event];

                if (typeof handler === 'function') handler.apply(me, args);
            };

            me.$$init = function (cfg) {
                if (typeof cfg === 'undefined') throw new Error('An url must be specified for WebSocket');

                me.$$ws = new WebSocket(cfg.url);

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
                    me.$$fireEvent('$open');
                };

                me.$$ws.onclose = function () {
                    me.$$fireEvent('$close');
                };

                return me;
            };

            me.$CONNECTING = 0;
            me.$OPEN = 1;
            me.$CLOSING = 2;
            me.$CLOSED = 3;

            me.$open = function () {
                if (me.$status() !== me.$OPEN) me.$$init(me.$$config);
                return me;
            };

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

            me.$emit = function (event, data) {
                if (!(typeof event === 'string' && typeof data !== 'undefined')) throw new Error('$emit needs two parameter: a String and a Object or a String');

                var message = {
                    event: event,
                    data: data
                };

                me.$$ws.send(JSON.stringify(message));

                return me;
            };

            me.$close = function () {
                if (me.$status() !== me.$CLOSED) me.$$ws.close();

                return me;
            };

            me.$status = function () {
                if (typeof me.$$ws === 'undefined') return me.$CLOSED;
                else return me.$$ws.readyState;
            };

            me.$ready = function () {
                return me.$status() === me.$OPEN;
            };

            if (!me.$$config.lazy) me.$$init(me.$$config);

            return me;
        }

        wsp.$get = function () {
            return new $websocketManager();
        };
    });