var assert = require('chai').assert,
    sinon = require('sinon'),
    connect = require('../src/connect'),
    Reflux = require('../src'),
    _ = Reflux.utils;

describe('using the connect(...) mixin',function(){

    it("should be exposed in Reflux",function(){
        assert.equal(connect, Reflux.connect);
    });

    describe("when calling with action",function() {
        var listenable = {
                listen: sinon.spy()
            },
            context = {setState: sinon.spy()};
        _.extend(context,connect(listenable, "KEY"));

        it("should pass empty object to state",function(){
            assert.deepEqual({},context.getInitialState());
        });
    });

    describe("when calling without key",function(){

        it("should throw.",function(){

            var listenable = {
                listen: function() {},
                getInitialState: function() {}
            };

            assert.throws(function () {
                connect(listenable);
            }, 'Reflux.connect() requires a key.');
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
});
