var assert = require('chai').assert,
    sinon = require('sinon'),
    connect = require('../src/connect'),
    _ = require('../src/utils'),
    Reflux = require('../src');

describe('using the connect(...) mixin',function(){

    it("should be exposed in Reflux",function(){
        assert.equal(connect, Reflux.connect);
    });

    describe("when calling with action",function() {
        var listenable = {
                listen: sinon.spy()
            },
            context = {setState: sinon.spy()};
        _.extend(context,connect(listenable));

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
            result = _.extend(context,connect(listenable));

        it("should add getInitialState and componentDidMount and WillUnmount",function(){
            assert.isFunction(context.getInitialState);
            assert.isFunction(context.componentDidMount);
            assert.isFunction(context.componentWillUnmount);
            assert.equal(context.componentWillUnmount,Reflux.ListenerMethods.stopListeningToAll);
        });

        it("should pass initial state to state",function(){
            assert.deepEqual(initialstate,context.getInitialState());
        });

        result.componentDidMount();

        it("should call listen on the listenable correctly",function(){
            assert.equal(1,listenable.listen.callCount);
            assert.equal(context.setState,listenable.listen.firstCall.args[0]);
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
            result = _.extend(context,connect(listenable,key));

        it("should pass initial state to state correctly",function(){
            assert.deepEqual({KEY:initialstate},context.getInitialState());
        });

        result.componentDidMount();

        it("should call listen on the listenable correctly",function(){
            assert.equal(1,listenable.listen.callCount);
            assert.isFunction(listenable.listen.firstCall.args[0]);
            assert.equal(context,listenable.listen.firstCall.args[1]);
        });

        it("should send listenable callback which calls setState correctly",function(){
            listenable.listen.firstCall.args[0](triggerdata);
            assert.deepEqual([_.object([key],[triggerdata])],context.setState.firstCall.args);
        });
    });
    describe("when calling with falsy key",function(){
        var triggerdata = "TRIGGERDATA",
            key = 0,
            listenable = {listen: sinon.spy()},
            context = {setState: sinon.spy()},
            result = _.extend(context,connect(listenable,key));
        result.componentDidMount();
        it("should send listenable callback which calls setState correctly",function(){
            listenable.listen.firstCall.args[0](triggerdata);
            assert.deepEqual([_.object([key],[triggerdata])],context.setState.firstCall.args);
        });
    });
    describe("together with ListenerMixin in a React component",function(){
        var store = Reflux.createStore({}),
            def = {setState:function(){}},
            fakecomponent = _.extend(def,Reflux.connect(store),Reflux.ListenerMethods);
        it("should log a warning)",function(){
            sinon.spy(console,"warn");
            fakecomponent.componentDidMount();
            assert(console.warn.calledOnce);
            console.warn.restore();
        });
    });
});
