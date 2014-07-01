var EventEmitter = require('events').EventEmitter;

/**
 * Creates an action functor object
 */
module.exports = function() {

    var action = new EventEmitter(),
        eventLabel = "action",
        functor;

    functor = function() {
        action.emit(eventLabel, Array.prototype.slice.call(arguments, 0));
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
