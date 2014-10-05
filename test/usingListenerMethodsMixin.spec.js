var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    sinon = require('sinon');

describe("using the ListenerMethods",function(){
    var ListenerMethods = Reflux.ListenerMethods;

    describe("the listenToMany function",function(){
        var listenables = { foo: "FOO", bar: "BAR", baz: "BAZ", missing: "MISSING"},
            context = {
                onFoo:"onFoo",
                bar:"bar",
                onBaz:"onBaz",
                onBazDefault:"onBazDefault",
                listenTo:sinon.spy()
            };
        Reflux.ListenerMixin.listenToMany.call(context,listenables);

        it("should call listenTo for all listenables with corresponding callbacks",function(){
            assert.equal(context.listenTo.callCount,3);
            assert.deepEqual(context.listenTo.firstCall.args,[listenables.foo,"onFoo","onFoo"]);
            assert.deepEqual(context.listenTo.secondCall.args,[listenables.bar,"bar","bar"]);
            assert.deepEqual(context.listenTo.thirdCall.args,[listenables.baz,"onBaz","onBazDefault"]);
        });
    });

    describe("the listenTo function",function(){
        var listenTo = ListenerMethods.listenTo;

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
                listenable = {listen:sinon.stub().returns(unsub)},
                callback = "CALLBACK",
                defaultcallback = "DEFCALL",
                context = {
                    validateListening: function(){},
                    fetchDefaultData: sinon.stub()
                },
                subobj = listenTo.call(context,listenable,callback,defaultcallback);

            it("adds the returned subscription object to a new array if none was there",function(){
                assert.equal(subobj,context.subscriptions[0]);
            });

            it("calls the listen method on the listener",function(){
                assert.deepEqual(listenable.listen.firstCall.args,[callback,context]);
            });

            it("tries to get default data correctly",function(){
                assert.deepEqual(context.fetchDefaultData.firstCall.args,[listenable,defaultcallback]);
            });

            describe("the returned subscription object",function(){
                it("contains the listenable and a stop function",function(){
                    assert.isFunction(subobj.stop);
                    assert.equal(subobj.listenable,listenable);
                });
            });

            describe("when setting a second subscription",function(){
                var secondlistenable = {listen:sinon.stub()},
                    secondsubobj = listenTo.call(context,secondlistenable,callback);
                it("adds the subobj to the existing array",function(){
                    assert.equal(context.subscriptions[1],secondsubobj);
                });
            });

        });
    });

    describe('the fetchDefaultData method',function(){

        describe('when called with method name and publisher with getDefaultData method',function(){
            var defaultdata = "DEFAULTDATA",
                listenable = {
                    getDefaultData: sinon.stub().returns(defaultdata)
                },
                context = {
                    defcb: sinon.spy()
                };
            ListenerMethods.fetchDefaultData.call(context,listenable,"defcb");

            it("calls getDefaultData on the publisher",function(){
                assert.equal(listenable.getDefaultData.callCount,1);
            });

            it("passes the returned data to the named method",function(){
                assert.deepEqual(context.defcb.firstCall.args,[defaultdata]);
            });
        });
    });

    describe('the hasListener method',function(){
        var action1 = Reflux.createAction(),
            action2 = Reflux.createAction(),
            action3 = Reflux.createAction(),
            action4 = Reflux.createAction(),
            store = Reflux.createStore();
        store.listenTo(action1,function(){});
        store.joinLeading(action1,action2,action3,function(){});
        it('should return true if context is listening',function(){
            assert.equal(true,store.hasListener(action1));
        });
        it('should return false if context isn\'t listening',function(){
            assert.equal(false,store.hasListener(action4));
        });
        it('should return true if context is listening to listenable as part of a join',function(){
            assert.equal(true,store.hasListener(action2));
            assert.equal(true,store.hasListener(action3));
        });
    });

});
