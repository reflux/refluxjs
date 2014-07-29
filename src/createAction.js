var _ = require('./utils');

/**
 * Creates an action functor object
 *
 * @param  {String} name Name of the action.
 * @param  {_.EventEmitter} [optional] context The context that this action is a part of.
 * @return {Function} Callable action function.
 */
module.exports = function(name, context) {

    if(typeof name !== 'string')
        name = 'action';

    // An independent single action is a context of itself.
    if(!(context instanceof _.EventEmitter))
        context = new _.EventEmitter();

    functor = function() {
        context.emit(name, arguments);
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
        context.addListener(name, eventHandler);

        return function() {
            context.removeListener(name, eventHandler);
        };
    };

    return functor;

};
