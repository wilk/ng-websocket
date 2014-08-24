'use strict';

angular
    .module('demo', ['ngWebsocket'])
    .config(function ($websocketProvider) {
        //$webSocketProvider.baseUrl('ws://localhost');
    })
    .run(function ($websocket) {
        var ws = $websocket.$new('ws://localhost:12345');

        ws.$on('$message', function (message) {
            console.log('$message');
            console.log(message);
        });

        ws.$on('test', function (message) {
            console.log('test');
            console.log(message);
        });

        ws.$on('$open', function () {
            console.log('Websocket opened');

            ws.$emit('test', {hi: 'dude'})
              .$emit('test', 'asd');
        });

        /*ws.$on('$message', function (data) {

        });

        ws.$on('my own event', function (data) {
           $scope.myData = data;
        });

        ws.$bind('my data event', $scope.myData);

        ws.$un('an event');

        ws.$emit('an event', data);

        ws.$close();

        $webSocket.$get('ws:url');*/
    });