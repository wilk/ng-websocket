'use strict';

var $websocket;

describe('Testing ng-websocket', function () {
    beforeEach(module('ngWebsocket'));
    beforeEach(inject(function (_$websocket_) {
        $websocket = _$websocket_;
    }));

    describe('Testing a non-working websocket', function () {
        var ws;

        beforeEach(function () {
            ws = $websocket.$new('ws://localhost:12345');
        });

        afterEach(function () {
            ws.$close();
        });

        it('should create a connecting WebSocket', function () {
            expect(ws).toBeDefined();
            expect(ws.$status()).toEqual(ws.$CONNECTING);
        });
    });

    describe('Testing $websocket service', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new('ws://localhost:12345');

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should have an open connection', function (done) {
            expect(ws.$status()).toEqual(ws.$OPEN);
            done();
        });
    });
});