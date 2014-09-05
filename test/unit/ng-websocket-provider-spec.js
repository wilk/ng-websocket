'use strict';

var $websocketProvider;

describe('Testing ng-websocket-provider', function () {
    beforeEach(function () {
        angular
            .module('test', [])
            .config(function (_$websocketProvider_) {
                $websocketProvider = _$websocketProvider_;
            });

        module('ngWebsocket', 'test');

        inject(function () {});
    });

    describe('Testing the provider', function () {
        it('should be defined', function () {
            expect($websocketProvider).toBeDefined();
            expect($websocketProvider.$get).toBeDefined();
        });
    });

    describe('Testing $get operator', function () {
        it('should return a ng-websocket service', function () {
            var wsm = $websocketProvider.$get();

            expect(wsm).toBeDefined();
            expect(wsm.$new).toBeDefined();
        });
    });

    describe('Testing $setup operator', function () {
        it('should setup the default of each $websocket', function () {
            $websocketProvider.$setup({
                mock: true
            });

            var $websocket = $websocketProvider.$get(),
                ws = $websocket.$new('ws://localhost:12345'),
                ws2 = $websocket.$new('ws://localhost:44444');

            expect(ws.$mockup()).toBeTruthy();
            expect(ws2.$mockup()).toBeTruthy();
        });
    });
});