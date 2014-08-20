var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    _ = require('../src/utils'),
    Q = require('q');

chai.use(require('chai-as-promised'));

describe('Creating stores', function() {

    describe('with one store listening to a simple action', function() {
        var action,
            store,
            promise,
            unsubCallback;

        beforeEach(function() {
            promise = Q.Promise(function(resolve) {
                action = Reflux.createAction();
                store = Reflux.createStore({
                    init: function() {
                        unsubCallback = this.listenTo(action, this.actionCalled);
                    },
                    actionCalled: function() {
                        var args = Array.prototype.slice.call(arguments, 0);
                        this.trigger(args);
                        resolve(args);
                    }
                });
            });
        });

        it('should get argument given on action', function() {
            action('my argument');

            return assert.eventually.equal(promise, 'my argument');
        });

        it('should get any arbitrary arguments given on action', function() {
            action(1337, 'ninja');

            return assert.eventually.deepEqual(promise, [1337, 'ninja']);
        });

        it('should throw an error when it listens on itself', function() {
            assert.throws(function() {
                store.listenTo(store, function() {});
            }, Error);
        });

        describe('and with listener unsubscribed', function() {

            beforeEach(function() {
                unsubCallback();
            });

            it('shouldn\'t have been called when action is called', function(done) {
                var resolved = false;
                promise.then(function() {
                    resolved = true;
                });

                action(1337, 'ninja');

                setTimeout(function() {
                  assert.isFalse(resolved);
                  done();
                }, 20);
            });

            it('can listenTo the same action again', function() {
                store.listenTo(action, store.actionCalled);
                action(1337, 'ninja');

                return assert.eventually.deepEqual(promise, [1337, 'ninja']);
            });

        });

        describe('listening to the store', function() {
            var unsubStoreCallback, storeListenPromise;

            beforeEach(function() {
                storeListenPromise = Q.promise(function(resolve) {
                    unsubStoreCallback = store.listen(function() {
                        resolve(Array.prototype.slice.call(arguments, 0));
                    });
                });
            });

            it('should pass when triggered', function() {
                action(1337, 'ninja');

                assert.eventually.deepEqual(storeListenPromise, [1337, 'ninja']);
            });

            describe('and unsubscribed', function() {
                beforeEach(function () {
                    unsubStoreCallback();
                });

                it('shouldn\'t have been called when action is called', function(done) {
                    var resolved = false;
                    storeListenPromise.then(function() {
                        resolved = true;
                    });

                    action(1337, 'ninja');

                    setTimeout(function() {
                      assert.isFalse(resolved);
                      done();
                    }, 20);
                });
            });
        });
    });

    describe('with one store listening to another store', function() {
        var action,
            baseDefinition;

        beforeEach(function () {
            action = Reflux.createAction();
            baseDefinition = {
                init: function() {
                    this.listenTo(action, this.actionCalled);
                },
                actionCalled: function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    this.trigger(args);
                }
            };
        });

        function createPromiseForTest(store) {
            return Q.Promise(function(resolve) {
                var storeTriggered = function (args) {
                    args = args.map(function (arg) {
                      return '[...] ' + arg;
                    });
                    this.trigger(args);
                    resolve(args);
                };
                Reflux.createStore({
                    init: function() {
                        this.listenTo(store, this.storeTriggered, storeTriggered);
                    },
                    storeTriggered: storeTriggered
                });
            });
        }

        it('should be triggered with argument from upstream store', function() {
            var promise = createPromiseForTest(Reflux.createStore(baseDefinition));
            action('my argument');
            return assert.eventually.equal(promise, '[...] my argument');
        });

        it('should be triggered with arbitrary arguments from upstream store', function() {
            var promise = createPromiseForTest(Reflux.createStore(baseDefinition));
            action(1337, 'ninja');
            return assert.eventually.deepEqual(promise, ['[...] 1337', '[...] ninja']);
        });

        it('should get default data from getDefaultData()', function() {
            var store = Reflux.createStore(_.extend(baseDefinition, {
                getDefaultData: function () {
                    return ['default data'];
                }
            }));
            var promise = createPromiseForTest(store);
            return assert.eventually.equal(promise, '[...] default data');
        });

        it('should get default data from getDefaultData() returned promise', function() {
            var store = Reflux.createStore(_.extend(baseDefinition, {
                getDefaultData: function () {
                    return Q.Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(['default data']);
                        }, 20);
                    });
                }
            }));
            var promise = createPromiseForTest(store);
            return assert.eventually.equal(promise, '[...] default data');
        });

    });

});
