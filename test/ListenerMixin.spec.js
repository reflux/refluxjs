var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q');

chai.use(require('chai-as-promised'));

describe('Managing subscriptions via ListenerMixin', function() {
    var component,
        action,
        promise;

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

});
