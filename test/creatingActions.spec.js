var assert = require('chai').assert,
    Reflux = require('../src'),
    Q = require('q');

describe('Creating action', function() {

    var action;

    beforeEach(function () {
        action = Reflux.createAction();
    });

    it('should be a callable functor', function() {
        assert.isFunction(action);
    });

    describe('when listening to action', function() {

        var promise;

        beforeEach(function() {
            promise = Q.promise(function(resolve) {
                action.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                });
            });
        });

        describe('and when calling the action with arbitrary params', function() {

            var testArgs = [1337, 'test'];

            beforeEach(function() {
                action(testArgs[0], testArgs[1]);
            });

            it('should receive the correct arguments', function(done) {
                promise.then(function(args) {
                    assert.equal(args[0], testArgs[0]);
                    assert.equal(args[1], testArgs[1]);
                    done();
                }).catch(done);
            });

        });

    });

});