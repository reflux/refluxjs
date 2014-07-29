var _ = require('./utils');

/**
 * Creates an action functor object
 */
module.exports = function() {

    var action = new _.EventEmitter(),
        eventLabel = "action",
        functor;

    functor = function() {
        action.emit(eventLabel, arguments);
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

    return functor;

};
