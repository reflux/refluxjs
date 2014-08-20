var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q');

chai.use(require('chai-as-promised'));

describe('Managing subscriptions via ListenerMixin', function() {
    var component,
        action,
        promise,
        store;

    beforeEach(function() {
      // simulate ReactJS component instantiation and mounting
      component = Object.create(Reflux.ListenerMixin);
      component.componentWillMount();

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

    describe('when unmounting', function() {

        beforeEach(function() {
            component.componentWillUnmount();
        });

        it('the component should unsubscribe', function(done) {
            var resolved = false;
            promise.then(function() {
                resolved = true;
            });

            action(1337, 'ninja');

            setTimeout(function() {
                assert.equal(resolved, false);
                done();
            }, 200);
        });
    });

    describe('get default data', function () {
        beforeEach(function() {
            component.componentWillUnmount();
        });
        function mountComponent() {
            component.componentWillMount();
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

});
