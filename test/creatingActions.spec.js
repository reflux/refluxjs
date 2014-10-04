var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q'),
    sinon = require('sinon');

chai.use(require('chai-as-promised'));

describe('Creating action', function() {

    it("should implement the publisher API",function(){
        var action = Reflux.createAction();
        for(var apimethod in Reflux.PublisherMethods){
            assert.equal(Reflux.PublisherMethods[apimethod],action[apimethod]);
        }
    });

    it("should copy properties from the definition into the action",function(){
        var def = {preEmit:"PRE",shouldEmit:"SHO",random:"RAN"},
            action = Reflux.createAction(def);
        assert.equal(action.preEmit, def.preEmit);
        assert.equal(action.shouldEmit, def.shouldEmit);
        assert.equal(action.random, def.random);
    });

    it("should throw an error if you overwrite any API other than preEmit and shouldEmit",function(){
        assert.throws(function(){
            Reflux.createAction({listen:"FOO"});
        });
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

    describe("the synchronisity",function(){
        var syncaction = Reflux.createAction({sync:true}),
            asyncaction = Reflux.createAction(),
            synccalled = false,
            asynccalled = false,
            store = Reflux.createStore({
                sync: function(){synccalled=true;},
                async: function(){asynccalled=true;}
            });
        store.listenTo(syncaction,"sync");
        store.listenTo(asyncaction,"async");
        it("should be asynchronous when not specified",function(){
            asyncaction();
            assert.equal(false,asynccalled);
        });
        it("should be synchronous if requested",function(){
            syncaction();
            assert.equal(true,synccalled);
        });
        describe("when changed during lifetime",function(){
            var syncaction = Reflux.createAction({sync:true}),
            asyncaction = Reflux.createAction(),
            synccalled = false,
            asynccalled = false,
            store = Reflux.createStore({
                sync: function(){synccalled=true;},
                async: function(){asynccalled=true;}
            });
            store.listenTo(syncaction,"sync");
            store.listenTo(asyncaction,"async");
            it("should be asynchronous if initial sync was overridden",function(){
                syncaction.sync = false;
                syncaction();
                assert.equal(false,synccalled);
            });
            it("should be synchronous if set during lifetime",function(){
                asyncaction.sync = true;
                asyncaction();
                assert.equal(true,asynccalled);
            });
        });
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
