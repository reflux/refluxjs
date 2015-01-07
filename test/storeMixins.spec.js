var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    sinon = require('sinon');

describe('Creating stores with mixins', function () {
    describe('with one simple mixin', function () {
        var mixin = {
                foo: 'FOO'
            },
            def = {
                mixins: [mixin],
                bar: 'BAR'
            },
            store = Reflux.createStore(def);

        it('should extend store with mixins props', function () {
            assert.equal(store.foo, mixin.foo);
            assert.equal(store.bar, def.bar);
        });
    });
    describe('with mixin with same property key', function () {
        var bar = 'BAR',
            baz = 'BAZ',
            mixin = {
                foo: 'FOO',
                init: sinon.spy(),
                preEmit: sinon.stub().returns(bar),
                shouldEmit: sinon.stub().returns(true)
            },
            def = {
                mixins: [mixin],
                foo: 'DEF_FOO',
                init: sinon.spy(),
                preEmit: sinon.stub().returns(baz),
                shouldEmit: sinon.stub().returns(true)
            },
            store = Reflux.createStore(def),
            listener = sinon.spy();

        store.listen(listener);
        store.trigger('triggered');

        it('should use def over mixin', function () {
            assert.equal(store.foo, def.foo);
        });
        it('should call both init', function () {
            assert.equal(mixin.init.callCount, 1);
            assert.equal(def.init.callCount, 1);
        });
        it('should call mixin init before def init', function () {
            assert(mixin.init.calledBefore(def.init));
        });
        it('should compose preEmit', function () {
            assert.equal(mixin.preEmit.callCount, 1);
            assert.equal(def.preEmit.callCount, 1);

            assert(mixin.preEmit.calledWith('triggered'));
            assert(def.preEmit.calledWith(bar));
            assert(listener.calledWith(baz));

            assert(mixin.preEmit.calledBefore(def.preEmit));
        });
        it('should compose shouldEmit', function () {
            assert.equal(mixin.shouldEmit.callCount, 1);
            assert.equal(def.shouldEmit.callCount, 1);

            assert(mixin.shouldEmit.calledWith(baz));
            assert(def.shouldEmit.calledWith(baz));

            assert(mixin.shouldEmit.calledBefore(def.shouldEmit));
        });
    });
    describe('with falsey shouldEmit in mixin', function () {
        var mixin = {
                shouldEmit: sinon.stub().returns(false)
            },
            def = {
                mixins: [mixin],
                shouldEmit: sinon.stub().returns(true)
            },
            store = Reflux.createStore(def),
            listener = sinon.spy();

        store.listen(listener);
        store.trigger('triggered');

        it('should not trigger', function () {
            assert.equal(mixin.shouldEmit.callCount, 1);
            assert.equal(listener.callCount, 0);
        });
        it('should not call def shouldEmit', function () {
            assert.equal(def.shouldEmit.callCount, 0);
        });
    });
    describe('with void preEmit in mixin', function () {
        var mixin = {
                preEmit: sinon.spy()
            },
            def = {
                mixins: [mixin],
                preEmit: sinon.spy()
            },
            store = Reflux.createStore(def),
            listener = sinon.spy();

        store.listen(listener);
        store.trigger('triggered');

        it('should not change triggered value', function () {
            assert.equal(mixin.preEmit.callCount, 1);
            assert.equal(def.preEmit.callCount, 1);

            assert(mixin.preEmit.calledWith('triggered'));
            assert(def.preEmit.calledWith('triggered'));
            assert(listener.calledWith('triggered'));

            assert(mixin.preEmit.calledBefore(def.preEmit));
        });
    });
    describe('with mixins in mixin', function () {
        var bar = 'BAR',
            baz = 'BAZ',
            goo = 'GOO',
            subMixin = {
                subFoo: 'SUB_FOO',
                subBar: 'SUB_BAR',
                init: sinon.spy(),
                preEmit: sinon.stub().returns(goo),
                shouldEmit: sinon.stub().returns(true)
            },
            mixin = {
                mixins: [subMixin],
                foo: 'FOO',
                subFoo: 'SUB_FOO_PARENT',
                init: sinon.spy(),
                preEmit: sinon.stub().returns(bar),
                shouldEmit: sinon.stub().returns(true)
            },
            def = {
                mixins: [mixin],
                foo: 'DEF_FOO',
                init: sinon.spy(),
                preEmit: sinon.stub().returns(baz),
                shouldEmit: sinon.stub().returns(true)
            },
            store = Reflux.createStore(def),
            listener = sinon.spy();

        store.listen(listener);
        store.trigger('triggered');

        it('should extend store with props from subMixin', function () {
            assert.equal(store.subBar, subMixin.subBar);
        });
        it('should use mixin over subMixin', function () {
            assert.equal(store.subFoo, mixin.subFoo);
        });
        it('should call all inits', function () {
            assert.equal(subMixin.init.callCount, 1);
            assert.equal(mixin.init.callCount, 1);
            assert.equal(def.init.callCount, 1);
        });
        it('should call subMixin init before mixin init', function () {
            assert(subMixin.init.calledBefore(mixin.init));
        });
        it('should compose preEmit', function () {
            assert.equal(subMixin.preEmit.callCount, 1);
            assert.equal(mixin.preEmit.callCount, 1);
            assert.equal(def.preEmit.callCount, 1);

            assert(subMixin.preEmit.calledWith('triggered'));
            assert(mixin.preEmit.calledWith(goo));
            assert(def.preEmit.calledWith(bar));
            assert(listener.calledWith(baz));

            assert(subMixin.preEmit.calledBefore(mixin.preEmit));
            assert(mixin.preEmit.calledBefore(def.preEmit));
        });
        it('should compose shouldEmit', function () {
            assert.equal(subMixin.shouldEmit.callCount, 1);
            assert.equal(mixin.shouldEmit.callCount, 1);
            assert.equal(def.shouldEmit.callCount, 1);

            assert(subMixin.shouldEmit.calledWith(baz));
            assert(mixin.shouldEmit.calledWith(baz));
            assert(def.shouldEmit.calledWith(baz));

            assert(subMixin.shouldEmit.calledBefore(mixin.shouldEmit));
            assert(mixin.shouldEmit.calledBefore(def.shouldEmit));
        });
    });
});
