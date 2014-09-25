var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q');

chai.use(require('chai-as-promised'));

var slice = Array.prototype.slice;

describe('Creating aggregate stores', function() {

    describe('with one aggregate store listening to a store listening to a simple action', function() {
        var action,
            store,
            aggregateStore,
            promise;

        beforeEach(function() {
            promise = Q.Promise(function(resolve) {
                action = Reflux.createAction();
                store = Reflux.createStore({
                    init: function() {
                        this.listenTo(action, this.trigger);
                        // pass to the trigger function immediately
                    }
                });
                aggregateStore = Reflux.createStore({
                    init: function() {
                        this.listenTo(store, this.storeCalled);
                    },
                    storeCalled: function() {
                        resolve(slice.call(arguments, 0));
                    }
                });
            });
        });

        it('should get argument given by action', function() {
            action('my argument');

            return assert.eventually.deepEqual(promise, ['my argument']);
        });

        it('should get any arbitrary arguments given on action', function() {
            action(1337, 'ninja');

            return assert.eventually.deepEqual(promise, [1337, 'ninja']);
        });

        it('should throw error when circular dependency happens', function() {
            assert.throws(function() {
                store.listenTo(aggregateStore);
            }, Error);
        });

        describe('with a third store', function() {
            var thirdStore;

            beforeEach(function() {
                thirdStore = Reflux.createStore({});
                thirdStore.listenTo(aggregateStore, function() {});
            });

            it('should throw error when a longer circular dependency happens', function() {
                assert.throws(function() {
                    store.listenTo(thirdStore, function() {});
                });
            });


        });
    });

});
