var assert = require('chai').assert,
    Reflux = require('../src'),
    Action = Reflux.createAction,
    Store = Reflux.createStore,
    fn = function(){};

describe('Stopping',function(){
    describe('a single listen', function(){
        describe('by calling stop directly',function(){
            describe('when all is well',function(){
                var store = Store(),
                    action1 = Action(),
                    action3 = Action();
                store.listenTo(action1,fn);
                store.listenTo(Action(),fn);
                store.listenTo(action3,fn);
                it('should remove that listener from the list but keep the others',function(){
                    store.subscriptions[1].stop();
                    assert.equal(2,store.subscriptions.length);
                    assert.equal(action1,store.subscriptions[0].listenable);
                    assert.equal(action3,store.subscriptions[1].listenable);
                });
            });
            describe('when the listener has already been removed from the list somehow',function(){
                var store = Store();
                store.listenTo(Action(),fn);
                store.listenTo(Action(),fn);
                it('should throw an error',function(){
                    assert.throws(function(){
                        store.subscriptions.pop().stop();
                    });
                });
            });
        });
        describe('by using stopListenTo',function(){
            describe('when all is well',function(){
                var store = Store(),
                    action1 = Action(),
                    action2 = Action(),
                    action3 = Action();
                store.listenTo(action1,fn);
                store.listenTo(action2,fn);
                store.listenTo(action3,fn);
                var result = store.stopListeningTo(action2);
                it('should remove that listener from the list but keep the others',function(){
                    assert.equal(2,store.subscriptions.length);
                    assert.equal(action1,store.subscriptions[0].listenable);
                    assert.equal(action3,store.subscriptions[1].listenable);
                });
                it('should return true',function(){
                    assert.equal(true,result);
                });
            });
            describe('when the stop method won\'t remove it from the array',function(){
                var store = Store(),
                    action = Action();
                store.listenTo(action,fn);
                store.subscriptions[0].stop = fn;
                it('should throw an error',function(){
                    assert.throws(function(){
                        store.stopListeningTo(action);
                    });
                });
            });
            describe('when we weren\'t actually listening to the given listenable',function(){
                var action1 = Action(),
                    action2 = Action(),
                    store = Store(),
                    result;
                store.listenTo(action1);
                store.listenTo(action2);
                result = Store().stopListeningTo(Action());
                it('should return false',function(){
                    assert.equal(false,result);
                });
                it('should leave the other listens intact',function(){
                    assert.equal(2,store.subscriptions.length);
                    assert.equal(action1,store.subscriptions[0].listenable);
                    assert.equal(action2,store.subscriptions[1].listenable);
                });
            });
            describe('when we don\'t have a subscriptions list',function(){
                var store = Store(), result;
                delete store.subscriptions;
                result = store.stopListeningTo(Action());
                it('should return false',function(){
                    assert.equal(result,false);
                });
            });
        });
    });
    describe('all listens',function(){
        describe('when all is well',function(){
            var store = Store();
            store.listenTo(Action(),fn);
            store.listenTo(Action(),fn);
            it('should clear the subscriptions list',function(){
                store.stopListeningToAll();
                assert.deepEqual([],store.subscriptions);
            });
        });
        describe('when a stop fails to remove the subscription object from the list',function(){
            var store = Store();
            store.listenTo(Action());
            store.subscriptions[0].stop = fn;
            it('should throw an error',function(){
                assert.throws(function(){
                    store.stopListeningToAll();
                });
            });
        });
        describe('when we don\'t have a subscriptions list',function(){
            var store = Store();
            delete store.subscriptions;
            it('should be a noop',function(){
                store.stopListeningToAll();
            });
        });
    });
});
