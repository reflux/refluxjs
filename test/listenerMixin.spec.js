var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q'),
    sinon = require('sinon');

chai.use(require('chai-as-promised'));

describe('Managing subscriptions via listenerMixin', function() {
    var component,
        action,
        promise,
        store;

    beforeEach(function() {
      // simulate ReactJS component instantiation and mounting
      component = Object.create(Reflux.listenerMixin);
      delete component.subscriptions;

      action = Reflux.createAction();

      promise = Q.Promise(function(resolve) {
          component.listenTo(action, function() {
              resolve(Array.prototype.slice.call(arguments, 0));
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

    describe('get default data', function () {
        beforeEach(function() {
            component.componentWillUnmount();
        });
        function mountComponent() {
            delete component.subscriptions;
            promise = Q.Promise(function(resolve) {
                var setData = function () {
                    resolve(Array.prototype.slice.call(arguments, 0));
                };
                component.listenTo(store, setData, setData);
            });
        }
        it('should get default data from getDefaultData()', function () {
            store = Reflux.createStore({
                getDefaultData: function () {
                    return 'default data';
                }
            });
            mountComponent();
            return assert.eventually.equal(promise, 'default data');
        });
        it('should get default data from getDefaultData() returned promise', function () {
            store = Reflux.createStore({
                getDefaultData: function () {
                    return Q.Promise(function (resolve) {
                        setTimeout(function () {
                            resolve('default data');
                        }, 20);
                    });
                }
            });
            mountComponent();
            return assert.eventually.equal(promise, 'default data');
        });
    });

    it("should include listenerMethods",function(){
        for(var m in Reflux.listenerMethods){
            assert.equal(Reflux.createStore({})[m],Reflux.listenerMethods[m]);
        }
    });

    describe('when unmounting', function() {
        var unsub1 = sinon.spy(),
            unsub2 = sinon.spy(),
            ctx = {subscriptions:[unsub1,unsub2]};
        Reflux.listenerMixin.componentWillUnmount.call(ctx);
        it('the component should unsubscribe all functors in the subscriptions array', function() {
            assert.equal(unsub1.callCount,1);
            assert.equal(unsub1.firstCall.args[0],true);
            assert.equal(unsub2.callCount,1);
            assert.equal(unsub2.firstCall.args[0],true);
        });
    });

});
