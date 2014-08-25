'use strict';

describe('Testing ng-websocket', function () {
    beforeEach(module('ngWebsocket'));

    describe('Testing $websocket service', function () {
        it('should create a connecting WebSocket', inject(function ($websocket) {
            var ws = $websocket.$new('ws://localhost:12345');

            expect(ws).toBeDefined();
            expect(ws.$status()).toEqual(ws.$CONNECTING);
        }));
    });
});