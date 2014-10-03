var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Action = Reflux.createAction,
    Store = Reflux.createStore,
    _ = require('../src/utils'),
    fn = function(){};

describe('Stopping',function(){
    describe('a single listen', function(){
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
        describe('which has already been removed from the list somehow',function(){
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
    });
});
