var _ = require('./utils');

/**
 * A module of methods for object that you want to be able to listen to.
 * This module is consumed by `createStore` and `createAction`
 */
module.exports = {	

	/**
     * Hook used by the action functor that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with.
     */
    preEmit: function() {},

    /**
     * Hook used by the action functor after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit: function() { return true; },

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen: function(callback, bindContext) {
        var eventHandler = function(args) {
            callback.apply(bindContext, args);
        };
        this.emitter.addListener(this.eventLabel, eventHandler);

        return (function() {
            this.emitter.removeListener(this.eventLabel, eventHandler);
        }).bind(this);
    },

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    trigger: function() {
        var args = arguments;
        this.preEmit.apply(this, args);
        if (this.shouldEmit.apply(this, args)) {
            this.emitter.emit(this.eventLabel, args);
        }
    },

    /**
     * Tries to publish the event on the next tick
     */
    triggerAsync: function(){
        var args = arguments;
        _.nextTick(function() {
            this.trigger.apply(this, args);
        },this);
    }
};