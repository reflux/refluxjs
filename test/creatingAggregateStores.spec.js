var assert = require('chai').assert,
    Reflux = require('../src'),
    Q = require('q');

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

        it('should get argument given by action', function(done) {
            action('my argument');

            promise.then(function(args) {
                assert.deepEqual(args, ['my argument']);
                done();
            }).catch(done);
        });

        it('should get any arbitrary arguments given on action', function(done) {
            action(1337, 'ninja');

            promise.then(function(args){
                assert.deepEqual(args, [1337, 'ninja']);
                done();
            }).catch(done);
        });
    });

});