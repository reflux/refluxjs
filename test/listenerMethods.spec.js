var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    //_ = require('../src/utils'),
    sinon = require('sinon');

describe("the listenerMethods",function(){
    var listenerMethods = Reflux.listenerMethods;
    describe("the listenToMany function",function(){
        var listenables = { foo: "FOO", bar: "BAR", baz: "BAZ", missing: "MISSING"},
            context = {
                onFoo:"onFoo",
                bar:"bar",
                onBaz:"onBaz",
                onBazDefault:"onBazDefault",
                listenTo:sinon.spy()
            };
        Reflux.listenerMixin.listenToMany.call(context,listenables);
        it("should call listenTo for all listenables with corresponding callbacks",function(){
            assert.equal(context.listenTo.callCount,3);
            assert.deepEqual(context.listenTo.firstCall.args,[listenables.foo,"onFoo","onFoo"]);
            assert.deepEqual(context.listenTo.secondCall.args,[listenables.bar,"bar","bar"]);
            assert.deepEqual(context.listenTo.thirdCall.args,[listenables.baz,"onBaz","onBazDefault"]);
        });
    });
    describe("the listenTo function",function(){
        var listenTo = listenerMethods.listenTo;
        it("will throw error if validation of listenable returns text",function(){
            var errormsg = "ERROR! ERROR!",
                context = {validateListening: sinon.stub().returns(errormsg)},
                listenable = "LISTENABLE";
            assert.throws(function() {
                listenTo.call(context,listenable);
            }, errormsg);
            assert.equal(context.validateListening.callCount,1);
            assert.equal(context.validateListening.firstCall.args[0],listenable);
        });
        describe("when setting a subscription",function(){
            var unsub = sinon.spy(),
                defaultdata = "DEFAULTDATA",
                listenable = {listen:sinon.stub().returns(unsub),getDefaultData:sinon.stub().returns(defaultdata)},
                callback = "CALLBACK",
                context = {validateListening: function(){},def:sinon.spy()},
                subobj = listenTo.call(context,listenable,callback,"def");
            it("adds the returned subscription object to a new array if none was there",function(){
                assert.equal(subobj,context.subscriptions[0]);
            });
            it("calls the listen method on the listener",function(){
                assert.deepEqual(listenable.listen.firstCall.args,[callback,context]);
            });
            it("passes default data correctly",function(){
                assert.equal(listenable.getDefaultData.callCount,1);
                assert.equal(context.def.callCount,1);
                assert.equal(context.def.firstCall.args[0],defaultdata);
            });
            describe("the returned subscription object",function(){
                it("contains the listenable and a stop function",function(){
                    assert.isFunction(subobj.stop);
                    assert.equal(subobj.listenable,listenable);
                });
                describe("when the stop method is called with true",function(){
                    subobj.stop(true);
                    it("calls the unsub method from the listenable",function(){
                        assert.equal(unsub.callCount,1);
                    });
                });
            });
            describe("when setting a second subscription",function(){
                var secondlistenable = {listen:sinon.stub()},
                    secondsubobj = listenTo.call(context,secondlistenable,callback);
                it("adds the subobj to the existing array",function(){
                    assert.equal(context.subscriptions[1],secondsubobj);
                });
            });
            describe("when cancelling a subscription without passing true",function(){
                var context = {validateListening:function(){}},
                    unsub = sinon.spy(),
                    listenable = {listen:sinon.stub().returns(unsub)};
                listenTo.call(context,listenable).stop();
                it("still calls unsub for the subscription",function(){
                    assert.equal(unsub.callCount,1);
                });
                it("removes the subscription object from the subscriptions array",function(){
                    assert.deepEqual(context.subscriptions,[]);
                });
            });
        });
    });
});