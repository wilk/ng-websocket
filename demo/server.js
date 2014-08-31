'use strict';

var WebSocketServer = require('ws').Server;

function Server () {
    var me = this;

    me.start = function () {
        var wss = new WebSocketServer({port: 12345});

        wss.on('connection', function (ws) {
            ws.on('message', ws.send);
        });

        return wss;
    };

    me.stop = function () {
        process.exit(0);
    };

    return me;
}

var server = module.exports = new Server();

if (require.main === module) {
    server.start();
}