var Reflux = require('../src'),
    sinon = require('sinon'),
    assert = require('chai').assert;

describe("not overriding handleCall",function(){
	var spy = sinon.spy();
	beforeEach(function(done){
        var action = Reflux.createAction({
            preEmit: spy,
        });
        Reflux.createStore({
			listenables:{action:action},
			onAction: function() {
				done();
			}
        });
        action();
	});

    it("should not change anything",function(){
        assert.equal(1,spy.callCount);
    });
});
describe("overriding handleCall",function(){
    var spy = sinon.spy();
    describe("by using a noop function",function(){
        var action = Reflux.createAction({
            sync: true,
            preEmit: spy,
            handleCall:function(){}
        });
        action();
        it("should not be triggered",function(){
            assert.equal(0,action.preEmit.callCount);
        });
    });
    describe("by using an async handler",function(){
        it("should not be triggered immediately",function(done){
            var functorWasCalled = false;
            var action = Reflux.createAction({
                preEmit: spy,
                handleCall:function(next,arg1,arg2){
                    functorWasCalled = true;
                    setTimeout(function(){
                        next(arg1,arg2);
                        done();
                    },50);
                }
            });

            Reflux.createStore({
                init: function() {
                    this.listenTo(action,this.onAction);
                },
                onAction: function(arg1,arg2) {
                    assert.equal("arg1",arg1);
                    assert.equal("arg2",arg2);
                }
            });

            action.trigger("arg1","arg2");
            assert.equal(true,functorWasCalled);
            assert.equal(0,spy.callCount);

        });

        it("should eventually be triggered",function(){
            assert.equal(1,spy.callCount);
        });

    });
});
