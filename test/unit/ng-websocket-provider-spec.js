'use strict';

var $$websocketProvider;

describe('Testing ng-websocket-provider', function () {
    beforeEach(function () {
        angular
            .module('test', [])
            .config(function ($websocketProvider) {
                $$websocketProvider = $websocketProvider;
            });

        module('ngWebsocket', 'test');

        inject(function () {});
    });

    describe('Testing the provider', function () {
        it('should be defined', function () {
            expect($$websocketProvider).toBeDefined();
            expect($$websocketProvider.$get).toBeDefined();
        });
    });

    describe('Testing $new operator', function () {
        it('should return a ng-websocket instance', function () {
            var wsm = $$websocketProvider.$get();

            expect(wsm).toBeDefined();
            expect(wsm.$new).toBeDefined();
        });
    });
});