var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q');

chai.use(require('chai-as-promised'));

describe('Creating action', function() {

    var action,
        testArgs;

    beforeEach(function () {
        action = Reflux.createAction();
        testArgs = [1337, 'test'];
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


        it('should receive the correct arguments', function() {
            action(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });

        describe('when adding preEmit hook', function() {

            var savedPreEmit,
                promisePreEmit;

            beforeEach(function() {
                savedPreEmit = action.preEmit;

                promisePreEmit = Q.promise(function(resolve) {
                    action.preEmit = function() {
                        receivedArgs = Array.prototype.slice.call(arguments, 0);
                        return resolve(receivedArgs);
                    };
                });
            });

            afterEach(function () {
                action.preEmit = savedPreEmit;
            });

            it('should receive arguments from action functor', function() {
                action.apply(null, testArgs);

                return assert.eventually.deepEqual(promisePreEmit, testArgs);
            });

        });

        describe('when replacing shouldEmit', function() {

            var savedShouldEmit,
                emitReturnValue,
                promiseShouldEmit;

            beforeEach(function () {
                emitReturnValue = true;
                savedShouldEmit = action.shouldEmit;

                promiseShouldEmit = Q.promise(function(resolve) {
                    action.shouldEmit = function() {
                        receivedArgs = Array.prototype.slice.call(arguments, 0);
                        resolve(receivedArgs);
                        return emitReturnValue;
                    };
                });

                hasRun = false;
            });

            afterEach(function() {
                action.shouldEmit = savedShouldEmit;
            });

            it('should receive arguments from action functor', function() {
                action.apply(null, testArgs);

                return assert.eventually.deepEqual(promiseShouldEmit, testArgs);
            });

            describe('when shouldEmit returns false', function() {

                beforeEach(function() {
                    emitReturnValue = false;
                });


                it('should not emit when shouldEmit returns false', function(done) {
                    var resolved = false;
                    promise.then(function() {
                        resolved = true;
                    });

                    action.apply(null, testArgs);

                    setTimeout(function() {
                      assert.isFalse(resolved);
                      done();
                    }, 20);
                });

            });

        });

    });

});

describe('Creating multiple actions to an action definition object', function() {

    var actionNames, actions;

    beforeEach(function () {
        actionNames = ['foo', 'bar'];
        actions = Reflux.createActions(actionNames);
    });

    it('should contain foo and bar properties', function() {
        assert.property(actions, 'foo');
        assert.property(actions, 'bar');
    });

    it('should contain action functor on foo and bar properties', function() {
        assert.isFunction(actions.foo);
        assert.isFunction(actions.bar);
    });

    describe('when listening to any of the actions created this way', function() {

        var promise;

        beforeEach(function() {
            promise = Q.promise(function(resolve) {
                actions.foo.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                });
            });
        });

        it('should receive the correct arguments', function() {
            var testArgs = [1337, 'test'];
            actions.foo(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });

    });

});
