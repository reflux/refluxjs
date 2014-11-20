var assert = require('chai').assert,
    sinon = require('sinon'),
    listenTo = require('../src/listenTo'),
    _ = require('../src/utils'),
    Reflux = require('../src');

describe('the listenTo shorthand',function(){

    describe("when calling the factory",function(){
        var unsubscriber = sinon.spy(),
            initialstate = "DATA",
            listenable = {
                listen: sinon.stub().returns(unsubscriber),
                getInitialState: sinon.stub().returns(initialstate)
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

            it("should add all methods from ListenerMethods",function(){
                for(var m in Reflux.ListenerMethods){
                    assert.equal(result[m],Reflux.ListenerMethods[m]);
                }
            });

            it("should add a subscriptions array",function(){
                assert.isArray(result.subscriptions);
            });

            it("should call listen on the listenable correctly (via listenTo)",function(){
                assert.equal(listenable.listen.callCount,1);
                assert.deepEqual(listenable.listen.firstCall.args,[callback,result]);
            });

            it("should send listenable initial state to initial cb (via listenTo)",function(){
                assert.equal(listenable.getInitialState.callCount,1);
                assert.equal(initial.callCount,1);
                assert.equal(initial.firstCall.args[0],initialstate);
            });
        });

        describe("the componentWillUnmount method",function(){
            it("should be the same as ListenerMethods stopListeningToAll",function(){
                assert.equal(assert.equal(result.componentWillUnmount,Reflux.ListenerMethods.stopListeningToAll));
            });
        });
    });
});
