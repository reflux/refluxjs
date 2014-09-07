var assert = require('chai').assert,
    sinon = require('sinon'),
    Reflux = require('../src');

describe('the listenTo shorthand',function(){
    describe("when calling the factory",function(){
        var unsubscriber = sinon.spy(),
            defaultdata = {foo:"bar"},
            listenable = {listen:sinon.stub().returns(unsubscriber),getDefaultData:sinon.stub().returns(defaultdata)},
            initial = sinon.spy(),
            callback = sinon.spy,
            result = Reflux.listenTo(listenable,"method",initial);
        result["method"] = callback;
        it("should return object with componentDidMount and componentWillUnmount methods",function(){
            assert.equal(Object.keys(result).length,3);
            assert.isFunction(result.componentDidMount);
            assert.isFunction(result.componentWillUnmount);
        });
        describe("when calling the added componentDidMount",function(){
            result.componentDidMount();
            it("should call listen on the listenable correctly",function(){
                assert.equal(listenable.listen.callCount,1);
                assert.deepEqual(listenable.listen.firstCall.args,[callback,result]);
            });
            it("should send listenable default data to initial",function(){
                assert.equal(listenable.getDefaultData.callCount,1);
                assert.equal(initial.callCount,1);
                assert.equal(initial.firstCall.args[0],defaultdata);
            });
        });
        describe("when calling the added componentWillUnmount",function(){
            result.componentWillUnmount();
            it("should called the returned unsubscriber",function(){
                assert.equal(unsubscriber.callCount,1);
            });
        });
    });
});
