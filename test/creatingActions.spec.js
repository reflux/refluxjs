var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q'),
    sinon = require('sinon');

chai.use(require('chai-as-promised'));

describe('Creating action', function() {

    it("should read preEmit, shouldEmit from definition, but not overwrite anything else",function(){
        var def = {preEmit:"PRE",shouldEmit:"SHO",listen:"LIS",random:"RAN"},
            action = Reflux.createAction(def);
        assert.equal(action.preEmit, def.preEmit);
        assert.equal(action.shouldEmit, def.shouldEmit);
        assert.equal(action.random, def.random);
        assert.equal(action.listen, Reflux.PublisherMethods.listen);
    });

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
            var preEmit = sinon.spy(),
                action = Reflux.createAction({preEmit:preEmit});

            action(1337,'test');

            it('should receive arguments from action functor', function() {
                assert.deepEqual(preEmit.firstCall.args,[1337,'test']);
            });
        });

        describe('when adding shouldEmit hook',function(){
            var context = {
                validateListening:function(){},
                fetchDefaultData:function(){}
            };

            describe("when hook returns true",function(){
                var shouldEmit = sinon.stub().returns(true),
                    action = Reflux.createAction({shouldEmit:shouldEmit}),
                    callback = sinon.spy();
                Reflux.ListenerMethods.listenTo.call(context,action,callback);
                action(1337,'test');

                it('should receive arguments from action functor', function() {
                    assert.deepEqual(shouldEmit.firstCall.args,[1337,'test']);
                });

                it('should still trigger to listeners',function(){
                    assert.equal(callback.callCount,1);
                    assert.deepEqual(callback.firstCall.args,[1337,'test']);
                });

            });

            describe("when hook returns false",function(){
                var shouldEmit = sinon.stub().returns(false),
                    action = Reflux.createAction({shouldEmit:shouldEmit}),
                    callback = sinon.spy();
                Reflux.ListenerMethods.listenTo.call(context,action,callback);
                action(1337,'test');

                it('should receive arguments from action functor', function() {
                    assert.deepEqual(shouldEmit.firstCall.args,[1337,'test']);
                });

                it('should not trigger to listeners',function(){
                    assert.equal(callback.callCount,0);
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
