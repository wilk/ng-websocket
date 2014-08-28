'use strict';

var $websocket;

describe('Testing ng-websocket-manager', function () {
    beforeEach(module('ngWebsocket'));
    beforeEach(inject(function (_$websocket_) {
        $websocket = _$websocket_;
    }));

    describe('Testing $new operator', function () {
        it('should return a ng-websocket instance', function () {
            var ws = $websocket.$new('ws://localhost:12345');

            expect(ws).toBeDefined();
            expect(ws.$emit).toBeDefined();
            expect(ws.$on).toBeDefined();
        });
    });
});