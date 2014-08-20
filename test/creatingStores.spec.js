var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
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

});
