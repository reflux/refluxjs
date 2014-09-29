var Reflux = require('../src'),
    sinon = require('sinon'),
    assert = require('chai').assert;

describe("overriding preEmit",function(){
    describe("for lone action",function(){
        describe("by using the definition object",function(){
            var spy = sinon.spy(),
                action = Reflux.createAction({preEmit:spy});
            action();
            it("should work",function(){
                assert.equal(1,action.preEmit.callCount);
            });
        });
        describe("by setting preEmit after creation",function(){
            var action = Reflux.createAction();
            action.preEmit = sinon.spy();
            action();
            it("should work",function(){
                assert.equal(1,action.preEmit.callCount);
            });
        });
    });
    describe("for an action created with createActions",function(){
        describe("by setting preEmit after creation",function(){
            var action = Reflux.createActions(["load","loadComplete","loadError"]).load;
            action.preEmit = sinon.spy();
            action();
            it("should work",function(){
                assert.equal(1,action.preEmit.callCount);
            });
        });
    });
});