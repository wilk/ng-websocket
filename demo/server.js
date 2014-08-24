'use strict';

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: 12345});

wss.on('connection', function (ws) {
    ws.on('message', function (msg) {
        console.dir(msg);
        ws.send(msg);
    });

    console.log('hey');

    setInterval(function () {
        console.log('here');
        ws.send(JSON.stringify({event: 'data', data: 'LOL'}));
    }, 1000);
});