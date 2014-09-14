'use strict';

var $websocket, $httpBackend;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('Testing ng-websocket', function () {
    beforeEach(module('ngWebsocket'));
    beforeEach(inject(function (_$websocket_, _$httpBackend_) {
        $websocket = _$websocket_;
        $httpBackend = _$httpBackend_;
    }));

    describe('Testing an offline $websocket', function () {
        var ws;

        beforeEach(function () {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should remain in a CONNECTING state', function () {
            expect(ws).toBeDefined();
            expect(ws.$status()).toEqual(ws.$CONNECTING);
        });

        it('should not raise an Error when calling $emit', function () {
            var error;

            try {
                ws.$emit('test', 'data');
            }
            catch (err) {
                error = err;
            }

            expect(error).toBeUndefined();
            expect(ws.$status()).not.toEqual(ws.$OPEN);
        });
    });

    describe('Testing an online $websocket', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true
            });

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should be in an OPEN state', function (done) {
            expect(ws.$status()).toEqual(ws.$OPEN);
            expect(ws.$ready()).toBeTruthy();
            done();
        });

        it('should not to throw an Error when calling $emit', function () {
            var error;

            try {
                ws.$emit('test', 'data');
            }
            catch (err) {
                error = err;
            }

            expect(ws.$status()).toEqual(ws.$OPEN);
            expect(error).toBeUndefined();
        });
    });

    describe('Testing $mockup check', function () {
        it('should return a mock up websocket', function () {
            var ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true
            });

            expect(ws.$mockup()).toBeTruthy();
        });
    });

    describe('Testing a parrot websocket server', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true
            });

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should have received the same message', function (done) {
            ws.$emit('custom event', 'hello world');

            ws.$on('$message', function (message) {
                expect(message.event).toEqual('custom event');
                expect(message.data).toEqual('hello world');

                done();
            });
        });

        it('should have received the same message on the same event', function (done) {
            ws.$emit('custom event', 'hello world');

            ws.$on('custom event', function (message) {
                expect(message).toEqual('hello world');

                done();
            });
        });
    });

    describe('Testing $on, $un, $emit functions', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true
            });

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should set a listener on $close general event', function (done) {
            ws.$close();

            ws.$on('$close', function () {
                expect(ws.$status()).toEqual(ws.$CLOSED);

                done();
            });
        });

        it('should set a list of listeners on $close general event', function (done) {
            var listeners = 3,
                counter = 0;

            ws.$close();

            ws.$on('$close', function () {
                expect(ws.$status()).toEqual(ws.$CLOSED);

                counter++;
              })
              .$on('$close', function () {
                expect(ws.$status()).toEqual(ws.$CLOSED);

                counter++;
              })
              .$on('$close', function () {
                expect(ws.$status()).toEqual(ws.$CLOSED);

                counter++;

                expect(counter).toEqual(listeners);
                done();
              });
        });

        it('should unset a listener on $close general event', function (done) {
            ws.$close();

            var noUpdate = true;
            ws.$on('$close', function () {
                noUpdate = false;
            });

            setTimeout(function () {
                expect(noUpdate).toBeTruthy();
                done();
            }, 4000);

            ws.$un('$close');
        });

        it('should emit a custom event', function (done) {
            ws.$emit('custom event', 'hello world');

            ws.$on('custom event', function (message) {
                expect(message).toEqual('hello world');

                done();
            });
        });
    });

    describe('Testing a lazy websocket', function () {
        var ws;

        beforeEach(function () {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true,
                lazy: true
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should be in a CLOSE state', function () {
            expect(ws.$status()).toEqual(ws.$CLOSED);
        });

        it('should not throw an error on $emit', function () {
            var error;

            try {
                ws.$emit('test', 'data');
            }
            catch (err) {
                error = err;
            }

            expect(error).not.toBeDefined();
            expect(ws.$status()).toEqual(ws.$CLOSED);
        });

        it('should open the connection when invoking $open', function () {
            ws.$open();

            ws.$on('$open', function () {
                expect(ws.$status()).toEqual(ws.$OPEN);
            });
        });
    });

    describe('Testing an open lazy websocket', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true,
                lazy: true
            });

            ws.$open();

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should be open', function (done) {
            expect(ws.$status()).toEqual(ws.$OPEN);
            done();
        });

        it('should send data via $emit', function (done) {
            var error;

            try {
                ws.$emit('event', 'data');
            }
            catch (err) {
                error = err;
            }

            expect(error).toBeUndefined();
            done();
        });

        it('should have received the same message on the same event', function (done) {
            ws.$emit('custom event', 'hello lazy world');

            ws.$on('$message', function (message) {
                expect(message.event).toEqual('custom event');
                expect(message.data).toEqual('hello lazy world');
                done();
            });
        });
    });

    describe('Testing enqueue feature', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: {
                    messageInterval: 500
                },
                lazy: true,
                enqueue: true
            });

            done();
        });

        afterEach(function () {
            ws.$close();
        });

        it('should enqueue the message and flush it when is ready', function (done) {
            ws.$on('my event', function (msg) {
                expect(ws.$ready()).toBeTruthy();
                expect(msg).toEqual('hello world');
                done();
            });

            ws.$emit('my event', 'hello world');
            setTimeout(function () {
                ws.$open();
            }, 2500);
        });

        it('should enqueue every message and flush all of them when is ready', function (done) {
            var counter = 5,
                eventCounter = 0;

            ws.$on('my event', function (msg) {
                expect(ws.$ready()).toBeTruthy();
                expect(msg).toEqual('Data #' + eventCounter);

                eventCounter++;
            });

            ws.$on('another event', function (msg) {
                expect(ws.$ready()).toBeTruthy();
                expect(msg).toEqual('hello world');

                expect(eventCounter).toEqual(counter);

                done();
            });

            for (var i = 0; i < counter; i++) ws.$emit('my event', 'Data #' + i);

            ws.$emit('another event', 'hello world');

            setTimeout(function () {
                ws.$open();
            }, 500);
        });
    });

    describe('Testing mock fixtures feature', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: {
                    fixtures: {
                        'fixture event': {
                            event: 'fixture response event',
                            data: {
                                fixture: 'response data'
                            }
                        },
                        'custom event': {
                            data: {
                                hello: 'world',
                                number: 10
                            }
                        }
                    }
                }
            });

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should responde with fixtures data', function (done) {
            ws.$on('custom event', function (msg) {
                expect(msg).toBeDefined();
                expect(msg.hello).toEqual('world');
                expect(msg.number).toEqual(10);
                done();
            });

            ws.$emit('custom event');
        });

        it('should responde with fixtures data on a fixture event', function (done) {
            ws.$on('fixture response event', function (msg) {
                expect(msg).toBeDefined();
                expect(msg.fixture).toEqual('response data');
                done();
            });

            ws.$emit('fixture event');
        });
    });

    describe('Testing mock remote fixtures feature', function () {
        var ws;

        it('should make an HTTP GET request and retrieve fixtures', function (done) {
            $httpBackend.when('GET', '/fixtures.json')
                .respond({
                    hello: {
                        event: 'world',
                        data: 'hi there'
                    }
                });
            $httpBackend.expectGET('/fixtures.json');

            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: {
                    fixtures: '/fixtures.json'
                }
            });

            ws.$on('$open', function () {
                ws.$emit('hello');
              })
              .$on('world', function (message) {
                expect(message).toEqual('hi there');

                done();
              });

            $httpBackend.flush();
        });

        afterEach(function () {
            ws.$close();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    // BUG: this test doesn't work because of setInterval and setTimeout in the $websocket.$new
    // and in the $websocket.$new({mock:true}) instances
    xdescribe('Testing reconnect feature', function () {
        var ws;

        beforeEach(function (done) {
            ws = $websocket.$new({
                url: 'ws://localhost:12345',
                mock: true,
                reconnect: true
            });

            ws.$on('$open', function () {
                done();
            });
        });

        afterEach(function () {
            ws.$close();
        });

        it('should reopen the connection', function (done) {
            ws.$emit('$close');

            setTimeout(function () {
                expect(ws.$ready()).toBeTruthy();

                done();
            }, 8000);
        });

        it('should not reopen the connection in time', function (done) {
            ws.$emit('$close');

            setTimeout(function () {
                expect(ws.$status()).toEqual(ws.$CONNECTING);

                done();
            }, 8000);
        });

        it('should not reopen the connection', function (done) {
            ws.$close();

            expect(ws.$status()).toEqual(ws.$CLOSING);

            setTimeout(function () {
                expect(ws.$status()).toEqual(ws.$CLOSED);
                done();
            }, 4000);
        });
    });
});