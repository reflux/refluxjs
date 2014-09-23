var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    sinon = require('sinon');

describe("using the publisher methods mixin",function(){
    var pub = Reflux.PublisherMethods;

    describe("the listen method",function(){
        var emitter = {
                addListener:sinon.spy(),
                removeListener:sinon.spy()
            },
            context = {
                emitter: emitter,
                eventLabel: "LABEL",
            },
            callback = sinon.spy(),
            cbcontext = {foo:"BAR"},
            result = pub.listen.call(context,callback,cbcontext);

        it("should call addListener correctly",function(){
            var args = emitter.addListener.firstCall.args;
            assert.equal(args[0],context.eventLabel);
            assert.isFunction(args[1]);
            args[1](["ARG1","ARG2"]);
            assert.deepEqual(callback.firstCall.args,["ARG1","ARG2"]);
            assert.equal(callback.firstCall.thisValue,cbcontext);
        });

        describe("the returned value",function(){

            it("should be a function",function(){
                assert.isFunction(result);
            });

            it("should remove the listener correctly",function(){
                result();
                assert.deepEqual(emitter.removeListener.firstCall.args,[context.eventLabel,emitter.addListener.firstCall.args[1]]);
            });
        });
    });

    describe("the trigger method",function(){

        describe("when shouldEmit returns true",function(){

            describe("when preEmit returns undefined",function(){
                var emitter = {
                        emit: sinon.spy()
                    },
                    context = {
                        eventLabel: "LABEL",
                        preEmit:sinon.spy(),
                        shouldEmit:sinon.stub().returns(true),
                        emitter: emitter
                    };
                pub.trigger.call(context,"FOO","BAR");

                it("should call preEmit correctly",function(){
                    assert.deepEqual(context.preEmit.firstCall.args,["FOO","BAR"]);
                });

                it("should call shouldEmit correctly",function(){
                    assert.deepEqual(context.shouldEmit.firstCall.args,["FOO","BAR"]);
                });

                it("should call emit on the emitter",function(){
                    // args are weird because it is an arguments object
                    var args = emitter.emit.firstCall.args;
                    assert.deepEqual(args[0],"LABEL");
                    assert.deepEqual(args[1][0],"FOO");
                    assert.deepEqual(args[1][1],"BAR");
                });
            });

            describe("when preEmit returns an array of new args",function(){
                var emitter = {
                        emit: sinon.spy()
                    },
                    oldargs = ["what","ever"],
                    newargs = ["foo","bar"],
                    context = {
                        eventLabel: "LABEL",
                        preEmit:sinon.stub().returns(newargs),
                        shouldEmit:sinon.stub().returns(true),
                        emitter: emitter
                    };
                pub.trigger.apply(context,oldargs);

                it("should call shouldEmit with the changed args",function(){
                    assert.deepEqual(context.shouldEmit.firstCall.args,newargs);
                });

                it("should call emit on the emitter with the changed args",function(){
                    // args are weird because it is an arguments object
                    var args = emitter.emit.firstCall.args;
                    assert.deepEqual(args[0],"LABEL");
                    assert.deepEqual(args[1],newargs);
                });
            });

            describe("when preEmit returns the arguments array",function(){
                var emitter = {
                        emit: sinon.spy()
                    },
                    oldargs = ["what","ever"],
                    context = {
                        eventLabel: "LABEL",
                        preEmit:function(){return arguments;},
                        shouldEmit:sinon.stub().returns(true),
                        emitter: emitter
                    };
                pub.trigger.apply(context,oldargs);

                it("should correctly call shouldEmit as if we returned an array",function(){
                    assert.deepEqual(oldargs,context.shouldEmit.firstCall.args);
                });

                it("should call emit the same way too",function(){
                    var args = emitter.emit.firstCall.args;
                    assert.deepEqual(args[0],"LABEL");
                    assert.deepEqual(args[1][0],oldargs[0]);
                    assert.deepEqual(args[1][1],oldargs[1]);
                });
            });

            describe("when preEmit returns a string",function(){
                var emitter = {
                        emit: sinon.spy()
                    },
                    oldargs = ["what","ever"],
                    newarg = "I SHOULD BE USED AS A SINGLE ARG",
                    context = {
                        eventLabel: "LABEL",
                        preEmit:sinon.stub().returns(newarg),
                        shouldEmit:sinon.stub().returns(true),
                        emitter: emitter
                    };
                pub.trigger.apply(context,oldargs);

                it("should call shouldEmit with the string",function(){
                    assert.deepEqual([newarg],context.shouldEmit.firstCall.args);
                });

                it("should call emit with the string too",function(){
                    var args = emitter.emit.firstCall.args;
                    assert.deepEqual(args[0],"LABEL");
                    assert.deepEqual(args[1],[newarg]);
                });
            });

            describe("when preEmit returns a number",function(){
                var emitter = {
                        emit: sinon.spy()
                    },
                    oldargs = ["what","ever"],
                    newarg = 12345,
                    context = {
                        eventLabel: "LABEL",
                        preEmit:sinon.stub().returns(newarg),
                        shouldEmit:sinon.stub().returns(true),
                        emitter: emitter
                    };
                pub.trigger.apply(context,oldargs);

                it("should call shouldEmit with the number",function(){
                    assert.deepEqual([newarg],context.shouldEmit.firstCall.args);
                });

                it("should call emit with the number too",function(){
                    var args = emitter.emit.firstCall.args;
                    assert.deepEqual(args[0],"LABEL");
                    assert.deepEqual(args[1],[newarg]);
                });
            });

            describe("when preEmit returns false",function(){
                var emitter = {
                        emit: sinon.spy()
                    },
                    oldargs = ["what","ever"],
                    newarg = false,
                    context = {
                        eventLabel: "LABEL",
                        preEmit:sinon.stub().returns(newarg),
                        shouldEmit:sinon.stub().returns(true),
                        emitter: emitter
                    };
                pub.trigger.apply(context,oldargs);

                it("should call shouldEmit with false",function(){
                    assert.deepEqual([newarg],context.shouldEmit.firstCall.args);
                });

                it("should call emit with false too",function(){
                    var args = emitter.emit.firstCall.args;
                    assert.deepEqual(args[0],"LABEL");
                    assert.deepEqual(args[1],[newarg]);
                });
            });

            describe("when preEmit returns an object",function(){
                var emitter = {
                        emit: sinon.spy()
                    },
                    oldargs = ["what","ever"],
                    newarg = {a:"foo",b:"bar"},
                    context = {
                        eventLabel: "LABEL",
                        preEmit:sinon.stub().returns(newarg),
                        shouldEmit:sinon.stub().returns(true),
                        emitter: emitter
                    };
                pub.trigger.apply(context,oldargs);

                it("should call shouldEmit with the object",function(){
                    assert.deepEqual([newarg],context.shouldEmit.firstCall.args);
                });

                it("should call emit with the object too",function(){
                    var args = emitter.emit.firstCall.args;
                    assert.deepEqual(args[0],"LABEL");
                    assert.deepEqual(args[1],[newarg]);
                });
            });

            describe("when preEmit returns a function",function(){
                var emitter = {
                        emit: sinon.spy()
                    },
                    oldargs = ["what","ever"],
                    newarg = function(foo,bar){console.log(foo,bar);},
                    context = {
                        eventLabel: "LABEL",
                        preEmit:sinon.stub().returns(newarg),
                        shouldEmit:sinon.stub().returns(true),
                        emitter: emitter
                    };
                pub.trigger.apply(context,oldargs);

                it("should call shouldEmit with the function",function(){
                    assert.deepEqual([newarg],context.shouldEmit.firstCall.args);
                });

                it("should call emit with the function too",function(){
                    var args = emitter.emit.firstCall.args;
                    assert.deepEqual(args[0],"LABEL");
                    assert.deepEqual(args[1],[newarg]);
                });
            });
        });

        describe("when shouldEmit returns false",function(){
            var emitter = {
                    emit: sinon.spy()
                },
                context = {
                    preEmit:sinon.spy(),
                    shouldEmit:sinon.stub().returns(false),
                    emitter: emitter
                };
            pub.trigger.call(context,"FOO","BAR");

            it("should not emit anything",function(){
                assert.equal(emitter.emit.callCount,0);
            });
        });
    });
});
