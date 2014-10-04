var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    _ = require('../src/utils'),
    Q = require('q');

chai.use(require('chai-as-promised'));

describe('Composed listenables', function() {
    var action1,
        action2,
        action3,
        all;

    beforeEach(function() {
        action1 = Reflux.createAction();
        action2 = Reflux.createAction();
        action3 = Reflux.createAction();
        all = Reflux.all(action1, action2, action3);
    });


    it('should emit when all listenables emit', function() {
        var promise = Q.Promise(function(resolve) {
            all.listen(function() {
                resolve(Array.prototype.slice.call(arguments, 0));
            });
        });

        action1('a', 'x');
        action2('b', 'y');
        action3('c', 'z');

        return assert.eventually.deepEqual(promise, [
            ['a', 'x'],
            ['b', 'y'],
            ['c', 'z']
        ]);
    });


    it('should not emit when only one listenable emits', function(done) {
        var called = false;
        all.listen(function() {
            called = true;
        }, null);

        action3('c');

        setTimeout(function() {
            assert.isFalse(called);
            done();
        }, 200);
    });


    it('should not emit when only two listenable emits', function(done) {
        var called = false;
        all.listen(function() {
            called = true;
        }, null);

        action1('a');
        action3('c');

        setTimeout(function() {
            assert.isFalse(called);
            done();
        }, 200);
    });


    it('should emit multiple times', function() {
        var promise = Q.promise(function(resolve) {
            var callArgs = [];
            all.listen(function() {
                callArgs.push([].slice.call(arguments));
                if (callArgs.length === 2) {
                    resolve(callArgs);
                }
            });
        });

        action1('a');
        action2('b');
        action3('c');

        action1('x');
        action2('y');
        action3('z');

        return assert.eventually.deepEqual(promise, [
          [['a'], ['b'], ['c']],
          [['x'], ['y'], ['z']]
        ]);
    });


    it('should emit with the last arguments it received', function() {
        var promise = Q.Promise(function(resolve) {
          all.listen(function() {
              resolve(Array.prototype.slice.call(arguments, 0));
          });
        });

        action1('a');
        action2('b');
        action1('x');
        action3('c');

        return assert.eventually.deepEqual(promise, [
          ['x'],
          ['b'],
          ['c']
        ]);
    });
});

describe('Composed listenable with stores', function() {
    var action,
        store1,
        store2,
        all;

    beforeEach(function () {
        action = Reflux.createAction();
        store1 = Reflux.createStore({
            init: function() {
                this.listenTo(action, this.trigger);
            }
        });
        store2 = Reflux.createStore({
            init: function() {
                this.listenTo(action, this.trigger);
            }
        });
        all = Reflux.all(store1, store2);
    });

    it('should emit when action is invoked', function() {
        var promise = Q.promise(function(resolve) {
            all.listen(function() {
                resolve(Array.prototype.slice.call(arguments, 0));
            });
        });

        action('a');

        return assert.eventually.deepEqual(promise, [['a'], ['a']]);
    });

    describe('with a store listening to the combined listenable', function() {

        var storeAll;

        beforeEach(function () {
            storeAll = Reflux.createStore({
                init: function() {
                    this.listenTo(all, this.trigger);
                }
            });
        });

        it('should emit when action is invoked', function() {
            var promise = Q.promise(function(resolve) {
                storeAll.listen(function() {
                    resolve(Array.prototype.slice.call(arguments, 0));
                });
            });

            action('a');

            return assert.eventually.deepEqual(promise, [['a'], ['a']]);
        });

        it('should not be able to be listened to by a store in the combined listenable', function() {
            assert.throws(function() {
                store2.listenTo(storeAll, function() {});
            }, Error);
        });

        describe('and with a component listening to other listenables', function() {

            var Component,
                anotherAction;

            beforeEach(function () {
                anotherAction = Reflux.createAction();
                Component = function() {
                    this.listenTo(storeAll, this.trigger);
                    this.listenTo(anotherAction);
                };
                _.extend(Component.prototype, Reflux.ListenerMixin);
            });

            it('should not crash', function() {
                new Component();
            });

        });

    });

});
