'use strict';

var $websocket;

describe('Testing ng-websocket-service', function () {
    beforeEach(module('ngWebsocket'));
    beforeEach(inject(function (_$websocket_) {
        $websocket = _$websocket_;
    }));

    describe('Testing base definitions', function () {
        it('should have $new and $get methods', function () {
            expect($websocket.$new).toBeDefined();
            expect($websocket.$get).toBeDefined();
        });
    });

    describe('Testing $new operator', function () {
        it('should return a ng-websocket instance', function () {
            var ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true
            });

            expect(ws).toBeDefined();
            expect(ws.$emit).toBeDefined();
            expect(ws.$on).toBeDefined();
        });
    });

    describe('Testing $new operator with just the url', function () {
        it('should return a ng-websocket instance', function () {
            var ws = $websocket.$new('ws://localhost:12345');

            expect(ws).toBeDefined();
            expect(ws.$emit).toBeDefined();
            expect(ws.$on).toBeDefined();
        });
    });

    describe('Testing $new operator with the url and a protocol', function () {
        it('should return a ng-websocket instance', function () {
            var ws = $websocket.$new('ws://localhost:12345', 'base64');

            expect(ws).toBeDefined();
            expect(ws.$emit).toBeDefined();
            expect(ws.$on).toBeDefined();
        });
    });

    describe('Testing $new operator with the url and two protocols', function () {
        it('should return a ng-websocket instance', function () {
            var ws = $websocket.$new('ws://localhost:12345', ['base64', 'bin']);

            expect(ws).toBeDefined();
            expect(ws.$emit).toBeDefined();
            expect(ws.$on).toBeDefined();
        });
    });

    describe('Testing $get operator', function () {
        it('should return the same ng-websocket instance', function () {
            var url = 'ws://localhost:12345';
            var ws = $websocket.$new({
                url: url,
                mock: true
            });

            var wsObj = $websocket.$get(url);

            expect(wsObj).toEqual(ws);
        });

        it('should not return the same ng-websocket instance', function () {
            var url = 'ws://localhost:12345';
            var ws = $websocket.$new({
                url: url,
                mock: true
            });

            var wsObj = $websocket.$get(url + ' foo');

            expect(wsObj).not.toEqual(ws);
        });
    });
});