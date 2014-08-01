var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q');

chai.use(require('chai-as-promised'));

describe('Combined listenables', function() {
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


    it('should emit multiple times', function(done) {
        var callArgs = [];
        all.listen(function() {
            callArgs.push([].slice.call(arguments));
        }, null);

        action1('a');
        action2('b');
        action3('c');

        action1('x');
        action2('y');
        action3('z');

        setTimeout(function() {
            assert.deepEqual(callArgs, [
                [['a'], ['b'], ['c']],
                [['x'], ['y'], ['z']]
            ]);
            done();
        }, 200);
    });
});
