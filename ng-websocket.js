'use strict';

angular
    .module('ngWebSocket', [])
    .provider('$webSocket', function () {
        var me = this;

        function $webSocketManager () {
            var wsm = this;

            wsm.$new = function (cfg) {
                return new $webSocket(cfg);
            };
        }

        function $webSocket (cfg) {
            var ws = this;

            if (typeof cfg === 'undefined') throw new Error('An url must be specified for WebSocket');


        }

        me.$get = function () {
            return new $webSocketManager();
        };
    });