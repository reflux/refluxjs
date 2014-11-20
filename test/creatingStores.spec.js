var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    _ = require('../src/utils'),
    Q = require('q'),
    sinon = require('sinon');

chai.use(require('chai-as-promised'));

describe('Creating stores', function() {

    describe('with one store listening to a simple action', function() {
        var action,
            store,
            promise,
            unsubCallback;

        beforeEach(function() {
            Reflux.StoreMethods = {};

            promise = Q.Promise(function(resolve) {
                action = Reflux.createAction();
                store = Reflux.createStore({
                    init: function() {
                        unsubCallback = this.listenTo(action, this.actionCalled);
                    },
                    actionCalled: function() {
                        var args = Array.prototype.slice.call(arguments, 0);
                        this.trigger(args);
                        resolve(args);
                    }
                });
            });
        });

        it('should get argument given on action', function() {
            action('my argument');

            return assert.eventually.equal(promise, 'my argument');
        });

        it('should get any arbitrary arguments given on action', function() {
            action(1337, 'ninja');

            return assert.eventually.deepEqual(promise, [1337, 'ninja']);
        });

        it('should throw an error when it listens on itself', function() {
            assert.throws(function() {
                store.listenTo(store, function() {});
            }, Error);
        });

        describe('and with listener unsubscribed', function() {

            beforeEach(function() {
                unsubCallback.stop();
            });

            it('shouldn\'t have been called when action is called', function(done) {
                var resolved = false;
                promise.then(function() {
                    resolved = true;
                });

                action(1337, 'ninja');

                setTimeout(function() {
                  assert.isFalse(resolved);
                  done();
                }, 20);
            });

            it('can listenTo the same action again', function() {
                store.listenTo(action, store.actionCalled);
                action(1337, 'ninja');

                return assert.eventually.deepEqual(promise, [1337, 'ninja']);
            });

        });

        it('should be able to reuse action again further down the chain', function() {
            Reflux.createStore({
                init: function() {
                    this.listenTo(store, this.trigger);
                    this.listenTo(action, this.trigger);
                }
            });

            action(1337);

            return assert.eventually.deepEqual(promise, [1337]);
        });

        describe('listening to the store', function() {
            var unsubStoreCallback, storeListenPromise;

            beforeEach(function() {
                storeListenPromise = Q.promise(function(resolve) {
                    unsubStoreCallback = store.listen(function() {
                        resolve(Array.prototype.slice.call(arguments, 0));
                    });
                });
            });

            it('should pass when triggered', function() {
                action(1337, 'ninja');

                assert.eventually.deepEqual(storeListenPromise, [1337, 'ninja']);
            });

            describe('and unsubscribed', function() {
                beforeEach(function () {
                    unsubStoreCallback();
                });

                it('shouldn\'t have been called when action is called', function(done) {
                    var resolved = false;
                    storeListenPromise.then(function() {
                        resolved = true;
                    });

                    action(1337, 'ninja');

                    setTimeout(function() {
                      assert.isFalse(resolved);
                      done();
                    }, 20);
                });
            });
        });
    });

    describe('with one store listening to another store', function() {
        var action,
            baseDefinition;

        beforeEach(function () {
            action = Reflux.createAction();
            baseDefinition = {
                init: function() {
                    this.listenTo(action, this.actionCalled);
                },
                actionCalled: function() {
                    var args = Array.prototype.slice.call(arguments, 0);
                    this.trigger(args);
                }
            };
        });

        function createPromiseForTest(store) {
            return Q.Promise(function(resolve) {
                var storeTriggered = function (args) {
                    args = args.map(function (arg) {
                      return '[...] ' + arg;
                    });
                    this.trigger(args);
                    resolve(args);
                };
                Reflux.createStore({
                    init: function() {
                        this.listenTo(store, this.storeTriggered, storeTriggered);
                    },
                    storeTriggered: storeTriggered
                });
            });
        }

        it('should be triggered with argument from upstream store', function() {
            var promise = createPromiseForTest(Reflux.createStore(baseDefinition));
            action('my argument');
            return assert.eventually.equal(promise, '[...] my argument');
        });

        it('should be triggered with arbitrary arguments from upstream store', function() {
            var promise = createPromiseForTest(Reflux.createStore(baseDefinition));
            action(1337, 'ninja');
            return assert.eventually.deepEqual(promise, ['[...] 1337', '[...] ninja']);
        });

        it('should get initial state from getInitialState()', function() {
            var store = Reflux.createStore(_.extend(baseDefinition, {
                getInitialState: function () {
                    return ['initial state'];
                }
            }));
            var promise = createPromiseForTest(store);
            return assert.eventually.equal(promise, '[...] initial state');
        });

        it('should get initial state from getInitialState() returned promise', function() {
            var store = Reflux.createStore(_.extend(baseDefinition, {
                getInitialState: function () {
                    return Q.Promise(function (resolve) {
                        setTimeout(function () {
                            resolve(['initial state']);
                        }, 20);
                    });
                }
            }));
            var promise = createPromiseForTest(store);
            return assert.eventually.equal(promise, '[...] initial state');
        });

    });

    describe("the listenables property",function(){

        describe("when given a single object",function(){
            var initialbarstate = "DEFAULTBARDATA",
                initialbazstate = "DEFAULTBAZDATA",
                listenables = {
                    foo: {listen:sinon.spy()},
                    bar: {
                        listen:sinon.spy(),
                        getInitialState:sinon.stub().returns(initialbarstate)
                    },
                    baz: {
                        listen:sinon.spy(),
                        getInitialState:sinon.stub().returns(initialbazstate)
                    },
                    missing: {
                        listen:sinon.spy()
                    }
                },
                def = {
                    onFoo:"methodFOO",
                    bar:sinon.spy(),
                    onBaz:sinon.spy(),
                    onBazDefault:sinon.spy(),
                    listenables:listenables
                },
                store = Reflux.createStore(def);

            it("should listenTo all listenables with the corresponding callbacks",function(){
                assert.deepEqual(listenables.foo.listen.firstCall.args,[def.onFoo,store]);
                assert.deepEqual(listenables.bar.listen.firstCall.args,[def.bar,store]);
                assert.deepEqual(listenables.baz.listen.firstCall.args,[def.onBaz,store]);
            });

            it("should not try to listen to actions without corresponding props in the store",function(){
                assert.equal(listenables.missing.listen.callCount,0);
            });

            it("should call main callback if listenable has getInitialState but listener has no default-specific cb",function(){
                assert.equal(listenables.bar.getInitialState.callCount,1);
                assert.equal(def.bar.firstCall.args[0],initialbarstate);
            });

            it("should call default callback if exist and listenable has getInitialState",function(){
                assert.equal(listenables.baz.getInitialState.callCount,1);
                assert.equal(def.onBaz.callCount,0);
                assert.equal(def.onBazDefault.firstCall.args[0],initialbazstate);
            });
        });

        describe("when given an array",function(){
            var first = {foo:{listen:sinon.spy()}},
                second = {bar:{listen:sinon.spy()},baz:{listen:sinon.spy()}},
                arr = [first,second],
                def = {foo:"foo",bar:"bar",baz:"baz",listenables:arr},
                store = Reflux.createStore(def);

            it("should add listeners from all objects in the array",function(){
                assert.deepEqual(first.foo.listen.firstCall.args,[def.foo,store]);
                assert.deepEqual(second.bar.listen.firstCall.args,[def.bar,store]);
                assert.deepEqual(second.baz.listen.firstCall.args,[def.baz,store]);
            });

        });
    });

    it("should copy all props from definition",function(){
        var def = {random:"FOO",preEmit:"BAZ",blah:"BAH"},
            store = Reflux.createStore(def);
        assert.equal(store.random,def.random);
        assert.equal(store.preEmit,def.preEmit);
        assert.equal(store.blah,def.blah);
    });

    it("should fail when trying to override API methods",function(){
        assert.throws(function(){
            Reflux.createStore({listenTo:"FOO"});
        });
        assert.throws(function(){
            Reflux.createStore({listen:"BAR"});
        });
    });

    it("should include ListenerMethods",function(){
        for(var m in Reflux.ListenerMethods){
            assert.equal(Reflux.createStore({})[m],Reflux.ListenerMethods[m]);
        }
    });

    it("should include PublisherMethods",function(){
        for(var m in Reflux.PublisherMethods){
            assert.equal(Reflux.createStore({})[m],Reflux.PublisherMethods[m]);
        }
    });

    it("should copy properties from Reflux.StoreMethods into the store",function(){
        Reflux.StoreMethods = {preEmit: function() {}, exampleFn: function() {}};
        var store = Reflux.createStore();
        assert.equal(store.preEmit, Reflux.StoreMethods.preEmit);
        assert.equal(store.exampleFn, Reflux.StoreMethods.exampleFn);
    });

    it("should fail when trying to override API methods in Reflux.StoreMethods",function(){
        Reflux.StoreMethods = { listen: "BAR" };
        assert.throws(function(){
            Reflux.createStore({});
        });
    });

    it("should not mix in its own methods into ListenerMethods",function(){
        assert.isUndefined(Reflux.ListenerMethods.listen);
        assert.isUndefined(Reflux.ListenerMethods.trigger);
    });

    describe('store methods', function() {
        var store;

        beforeEach(function() {
            store = Reflux.createStore({
                reflect: function() {
                    return this;
                }
            });
        });

        it('should be bound to store instance', function() {
            var reflect = store.reflect;
            return assert.equal(store, reflect());
        });
    });
});
