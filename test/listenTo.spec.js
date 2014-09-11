var assert = require('chai').assert,
    sinon = require('sinon'),
    listenTo = require('../src/listenTo'),
    _ = require('../src/utils'),
    Reflux = require('../src');

describe('the listenTo shorthand',function(){
    describe("when calling the factory",function(){
        var unsubscriber = sinon.spy(),
            defaultdata = "DATA",
            listenable = {
                listen: sinon.stub().returns(unsubscriber),
                getDefaultData: sinon.stub().returns(defaultdata)
            },
            initial = sinon.spy(),
            callback = "CALLBACK",
            result = _.extend({method:callback},listenTo(listenable,"method",initial));
        it("should return object with componentDidMount and componentWillUnmount methods",function(){
            assert.isFunction(result.componentDidMount);
            assert.isFunction(result.componentWillUnmount);
        });
        describe("when calling the added componentDidMount",function(){
            result.componentDidMount();
            it("should add all methods from listenerMethods",function(){
                for(var m in Reflux.listenerMethods){
                    assert.equal(result[m],Reflux.listenerMethods[m]);
                }
            });
            it("should add to a subscriptions array",function(){
                assert.isArray(result.subscriptions);
                assert.equal(result.subscriptions[0].listenable,listenable);
            });
            it("should call listen on the listenable correctly (via listenTo)",function(){
                assert.equal(listenable.listen.callCount,1);
                assert.deepEqual(listenable.listen.firstCall.args,[callback,result]);
            });
            it("should send listenable default data to initial (via listenTo)",function(){
                assert.equal(listenable.getDefaultData.callCount,1);
                assert.equal(initial.callCount,1);
                assert.equal(initial.firstCall.args[0],defaultdata);
            });
        });
        describe("the componentWillUnmount method",function(){
            it("should be the same as listenerMethods stopListeningToAll",function(){
                assert.equal(assert.equal(result.componentWillUnmount,Reflux.listenerMethods.stopListeningToAll));
            });
        });
    });
    describe('when called multiple times for the same object',function(){
        var listenable1 = {listen: sinon.spy()},
            listenable2 = {listen: sinon.spy()},
            context = {
                method1:sinon.spy(),
                method2:sinon.spy()
            };
        _.extend(context,listenTo(listenable1,"method1"));
        context.componentDidMount();
        _.extend(context,listenTo(listenable2,"method2"));
        context.componentDidMount();
        it("should add both listeners correctly",function(){
            var subs = context.subscriptions;
            assert.equal(subs.length,2);
            assert.equal(subs[0].listenable,listenable1);
            assert.equal(subs[1].listenable,listenable2);
        });
    });
});
