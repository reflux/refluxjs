var _ = require('./utils');
var Namespace = require('./Namespace');

/**
 * Creates an action functor object
 *
 * @param  {Namespace} [optional] context The context that this action shall join to.
 * @param  {String} [optional] name Unique name of the object.
 * @return {Function} Callable action function.
 */
module.exports = function(context, name) {

    if(typeof name !== 'string')
        name = 'action';

    // An independent single action is a context of itself.
    if(!(context instanceof Namespace)) {
        context = new Namespace();
    }

    if(context.contains(name)) {
        throw new Error(name + ': Action name already exists within given namespace.');
    }

    context.add(name);

    functor = function() {
        context.emit(name, arguments);
    };

    // functor.context = function(newContext) {
    //     if(newContext instanceof Namespace) {
    //         context = newContext;
    //     }

    //     return context;
    // };

    functor.actionName = name;

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
