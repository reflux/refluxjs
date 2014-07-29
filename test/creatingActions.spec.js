var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    _ = require('../src/utils'),
    Q = require('q');

chai.use(require('chai-as-promised'));

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


        it('should receive the correct arguments', function() {
            var testArgs = [1337, 'test'];
            action(testArgs[0], testArgs[1]);

            return assert.eventually.deepEqual(promise, testArgs);
        });

    });

    describe('when manually assigning context to action', function() {

        var promise,
            context,
            actionContext,
            actionName;

        beforeEach(function () {

            context = new _.EventEmitter();
            actionName = 'actionName';
            actionContext = Reflux.createAction(actionName, context);

        });

        afterEach(function() {
            context.removeAllListeners(actionName);
        });

        it('should bind listener to context via action', function() {

            var handler = function handler() {
                // some handler
            };

            assert.equal(context.listeners(actionName).length, 0);

            actionContext.listen(handler);

            assert.equal(context.listeners(actionName).length, 1);

        });

        it('should emit to the context', function() {

            var promise, promise2;

            promise = Q.promise(function(resolve) {
                actionContext.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                });
            });

            assert.equal(context.listeners(actionName).length, 1);

            promise2 = Q.promise(function(resolve) {
                context.on(actionName, function() {
                    resolve(Array.prototype.slice.call(arguments[0], 0));
                });
            });

            assert.equal(context.listeners(actionName).length, 2);

            var testArgs = [1337, 'test'];
            actionContext(testArgs[0], testArgs[1]);

            return Q.all([
                assert.eventually.deepEqual(promise, testArgs),
                assert.eventually.deepEqual(promise2, testArgs)
                ]);

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
