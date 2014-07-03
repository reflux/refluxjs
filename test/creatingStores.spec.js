var assert = require('chai').assert,
    Reflux = require('../src'),
    Q = require('q');

describe('Creating stores', function() {

    describe('with one store listening to a simple action', function() {
        var action, 
            store,
            promise;

        beforeEach(function() {
            promise = Q.Promise(function(resolve) {
                action = Reflux.createAction();
                store = Reflux.createStore({
                    init: function() {
                        this.listenTo(action, this.actionCalled);
                    },
                    actionCalled: function() {
                        resolve(Array.prototype.slice.call(arguments, 0));
                    }
                });
            });
        });

        it('should get argument given on action', function(done) {
            action('my argument');

            promise.then(function(args) {
                assert.equal(args[0], 'my argument');
                done();
            }).catch(done);
        });

        it('should get any arbitrary arguments given on action', function(done) {
            action(1337, 'ninja');

            promise.then(function(args){
                assert.equal(args[0], 1337);
                assert.equal(args[1], 'ninja');
                done();
            }).catch(done);
        });
    });

});