var _ = require('./utils');

/**
 * Creates an action functor object
 */
module.exports = function() {

    var action = new _.EventEmitter(),
        eventLabel = "action",
        functor;

    functor = function() {
        setTimeout.call(functor, function(args) {
            functor.preEmit.apply(functor, args);
            if (functor.shouldEmit.apply(functor, args)) {
                action.emit(eventLabel, args);
            }
        }, 0, arguments);
    };

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    functor.listen = function(callback, bindContext) {
        var eventHandler = function(args) {
            callback.apply(bindContext, args);
        };
        action.addListener(eventLabel, eventHandler);

        return function() {
            action.removeListener(eventLabel, eventHandler);
        };
    };

    /**
     * Hook used by the action functor that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with.
     */
    functor.preEmit = function() {};

    /**
     * Hook used by the action functor after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    functor.shouldEmit = function() { return true; };

    return functor;

};
