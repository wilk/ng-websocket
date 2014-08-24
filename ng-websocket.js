'use strict';

angular
    .module('ngWebSocket', [])
    .provider('$webSocket', function () {
        var wsp = this;

        function $webSocketManager () {
            var wsm = this;

            wsm.$new = function (cfg) {
                return new $webSocket(cfg);
            };
        }

        function $webSocket (cfg) {
            var me = this;

            me._eventMap = {};

            me._fireEvent = function () {
                var event = arguments[0],
                    handler = me._eventMap[event];

                if (typeof handler === 'function') handler.call(me, arguments);
            };

            me._init = function (cfg) {
                if (typeof cfg === 'undefined') throw new Error('An url must be specified for WebSocket');

                if (typeof cfg === 'string') {
                    me.ws = new WebSocket(cfg);

                    me.ws.onmessage = function (message) {
                        try {
                            var decoded = JSON.parse(message.data);
                            me._fireEvent(decoded.event, decoded.data);
                            me._fireEvent('$message', decoded);
                        }
                        catch (err) {
                            me._fireEvent('$message', message.data);
                        }
                    };

                    me.ws.onerror = function (error) {
                        me._fireEvent('$error', error);
                    };

                    me.ws.onopen = function () {
                        me._fireEvent('$open');
                    };

                    me.ws.onclose = function () {
                        me._fireEvent('$close');
                    };
                }

                return me;
            };

            me.$CONNECTING = 0
            me.$OPEN = 1;
            me.$CLOSING = 2;
            me.$CLOSED = 3;

            me.$on = function (event, handler) {
                if (typeof event !== 'string' || typeof handler !== 'function') throw new Error('$on accept two parameters: a String and a Function');

                me._eventMap[event] = handler;

                return me;
            };

            me.$un = function (event) {
                if (typeof event !== 'string') throw new Error('$un accept just a String');

                delete me._eventMap[event];

                return me;
            };

            me.$emit = function (event, data) {
                if (!(typeof event === 'string' && typeof data !== 'undefined')) throw new Error('$emit needs two parameter: a String and a Object or a String');

                var message = {
                    event: event,
                    data: data
                };

                me.ws.send(JSON.stringify(message));

                return me;
            };

            me.$close = function () {
                me.ws.close();

                return me;
            };

            me.$status = function () {
                return me.ws.readyState;
            };

            me.$ready = function () {
                return me.$status() === me.$OPEN;
            };

            return me._init(cfg);
        }

        wsp.$get = function () {
            return new $webSocketManager();
        };
    });