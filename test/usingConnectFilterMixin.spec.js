var assert = require('chai').assert,
    sinon = require('sinon'),
    connectFilter = require('../src/connectFilter'),
    _ = require('../src/utils'),
    Reflux = require('../src');

var dummyFilter = function(value) { return value.slice(0,2); };

describe('using the connectFilter(...) mixin',function(){

    it("should be exposed in Reflux",function(){
        assert.equal(connectFilter, Reflux.connectFilter);
    });

    describe("when calling with action",function() {
        var listenable = {
                listen: sinon.spy()
            },
            context = {setState: sinon.spy()};
        _.extend(context,connectFilter(listenable, dummyFilter));

        it("should pass empty object to state",function(){
            assert.deepEqual({},context.getInitialState());
        });
    });

    describe("when calling without key",function(){
        var initialstate = "DEFAULTDATA",
            listenable = {
                listen: sinon.spy(),
                getInitialState: sinon.stub().returns(initialstate)
            },
            context = {setState: sinon.spy()},
            result = _.extend(context,connectFilter(listenable, dummyFilter));

        it("should add getInitialState and componentDidMount and WillUnmount",function(){
            assert.isFunction(context.getInitialState);
            assert.isFunction(context.componentDidMount);
            assert.isFunction(context.componentWillUnmount);
            assert.equal(context.componentWillUnmount,Reflux.ListenerMethods.stopListeningToAll);
        });

        it("should pass initial state to state",function(){
            assert.deepEqual(initialstate.slice(0,2),context.getInitialState());
        });

        result.componentDidMount();

        it("should call listen on the listenable correctly",function(){
            assert.equal(1,listenable.listen.callCount);
            assert.isFunction(listenable.listen.firstCall.args[0]);
            assert.equal(context,listenable.listen.firstCall.args[1]);
        });

        it("should store the subscription object correctly",function(){
            assert.equal(listenable,context.subscriptions[0].listenable);
        });

    });

    describe("when calling with key",function(){
        var initialstate = "DEFAULTDATA",
            triggerdata = "TRIGGERDATA",
            key = "KEY",
            listenable = {
                listen: sinon.spy(),
                getInitialState: sinon.stub().returns(initialstate)
            },
            context = {setState: sinon.spy()},
            result = _.extend(context,connectFilter(listenable,key,dummyFilter));

        it("should pass initial state to state correctly",function(){
            assert.deepEqual({KEY:initialstate.slice(0,2)},context.getInitialState());
        });

        result.componentDidMount();

        it("should call listen on the listenable correctly",function(){
            assert.equal(1,listenable.listen.callCount);
            assert.isFunction(listenable.listen.firstCall.args[0]);
            assert.equal(context,listenable.listen.firstCall.args[1]);
        });

        it("should send listenable callback which calls setState correctly",function(){
            listenable.listen.firstCall.args[0](triggerdata);
            assert.deepEqual([_.object([key],[triggerdata.slice(0,2)])],context.setState.firstCall.args);
        });
    });
    describe("when calling with falsy key",function(){
        var triggerdata = "TRIGGERDATA",
            key = 0,
            listenable = {listen: sinon.spy()},
            context = {setState: sinon.spy()},
            result = _.extend(context,connectFilter(listenable,key,dummyFilter));
        result.componentDidMount();
        it("should send listenable callback which calls setState correctly",function(){
            listenable.listen.firstCall.args[0](triggerdata);
            assert.deepEqual([_.object([key],[triggerdata.slice(0,2)])],context.setState.firstCall.args);
        });
    });
});

