var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src');

describe('Using BaconJS-like eventstreams', function() {

    var baconStream,
        hasCalledUnsubscribe,
        subscribedCallback;

    beforeEach(function () {
        hasCalledUnsubscribe = false;
        var unsubscribeCallback = function() {
            hasCalledUnsubscribe = true;
        };
        baconStream = {
            subscribe: function(cb) {
                subscribedCallback = cb;
                return unsubscribeCallback;
            }
        };
    });

    describe('when a store listens to it', function() {

        var store,
            actualUnsub,
            hasRetainedThis,
            actualArgs;

        beforeEach(function () {
            hasRetainedThis = false;
            store = Reflux.createStore({
                init: function() {
                    actualUnsub = this.listenTo(baconStream, this.callback);
                },
                callback: function() {
                    this.retainThis.apply(this, arguments);
                },
                retainThis: function() {
                    actualArgs = Array.prototype.splice.call(arguments, 0);
                    hasRetainedThis = true;
                }
            });
        });

        it('should pass the unsubscribe from the bacon stream', function() {
            store.stopListeningTo(baconStream);
            assert.isTrue(hasCalledUnsubscribe);
        });

        it('should retain this when bacon is calling', function() {
            subscribedCallback('ninja', 1337);
            assert.isTrue(hasRetainedThis);
        });

    });

});
