var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    sinon = require('sinon');

chai.use(require('chai-as-promised'));

describe("using the store methods mixin",function(){

    describe("the setState method",function(){

        describe("when setState is called",function(){

            var store = Reflux.createStore({});

            sinon.spy(store, 'trigger');

            store.setState({ foo: 'bar' });

            it("should update the state",function(){
                assert.deepEqual(store.state.toJS(), { foo: 'bar' });
            });

            it("should call trigger",function(){
                var args = store.trigger.firstCall.args;
                assert.deepEqual(args, [ { foo: 'bar' } ]);
            });
        });

        describe("when setState is called and state exists",function(){

            var store = Reflux.createStore({});

            sinon.spy(store, 'trigger');

            store.setState({ foo: 'bar' });
            store.setState({ baz: { qux: 'quux' } });

            it("should update the state",function(){
                assert.deepEqual(store.state.toJS(), { foo: 'bar', baz: { qux: 'quux' } });
            });

            it("should call trigger",function(){
                var args = store.trigger.secondCall.args;
                assert.deepEqual(args, [ { foo: 'bar', baz: { qux: 'quux' } } ]);
            });
        });
    });

    describe("the replaceState method",function(){

        describe("when replaceState is called",function(){

            var store = Reflux.createStore({});

            sinon.spy(store, 'trigger');

            store.replaceState({ foo: 'bar' });

            it("should update the state",function(){
                assert.deepEqual(store.state.toJS(), { foo: 'bar' });
            });

            it("should call trigger",function(){
                var args = store.trigger.firstCall.args;
                assert.deepEqual(args, [ { foo: 'bar' } ]);
            });
        });

        describe("when replaceState is called and state exists",function(){

            var store = Reflux.createStore({});

            sinon.spy(store, 'trigger');

            store.setState({ foo: 'bar' });
            store.replaceState({ baz: { qux: 'quux' } });

            it("should update the state",function(){
                assert.deepEqual(store.state.toJS(), { baz: { qux: 'quux' } });
            });

            it("should call trigger",function(){
                var args = store.trigger.secondCall.args;
                assert.deepEqual(args, [ { baz: { qux: 'quux' } } ]);
            });
        });
    });

    describe("if getInitialState is defined",function(){

        var store = Reflux.createStore({
            getInitialState: function() {
                return { foo: 'bar' };
            }
        });

        it("should set the initial state",function(){
            assert.deepEqual(store.state.toJS(), { foo: 'bar' });
        });
    });
});
