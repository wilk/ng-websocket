'use strict';

angular
    .module('demo', ['ngWebSocket'])
    .config(function ($webSocketProvider) {
        $webSocketProvider.baseUrl('ws://localhost');
    })
    .run(function ($webSocket) {
        var ws = $webSocket.$new('ws://localhost:12345');

        ws.$on('$message', function (data) {

        });

        ws.$on('my own event', function (data) {
           $scope.myData = data;
        });

        ws.$bind('my data event', $scope.myData);

        ws.$un('an event');

        ws.$emit('an event', data);

        ws.$close();

        $webSocket.$get('ws:url');
    });