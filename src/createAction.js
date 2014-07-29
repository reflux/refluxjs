var _ = require('./utils');
var Namespace = require('./Namespace');

/**
 * Creates an action functor object
 *
 * @param  {Namespace} [optional] context The context that this action shall join to.
 * @return {Function} Callable action function.
 */
module.exports = function(context) {

    var id = 'action';

    // An independent single action is a context of itself.
    if(!(context instanceof Namespace)) {
        context = new Namespace();
    }

    if(context.contains(id)) {
        id = _.generateID();
    }

    context.add(id);

    functor = function() {
        context.emit(id, arguments);
    };

    functor.context = function(newContext) {
        if(newContext instanceof Namespace) {
            context = newContext;
        }

        return context;
    };

    functor._id = id;

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
        context.addListener(id, eventHandler);

        return function() {
            context.removeListener(id, eventHandler);
        };
    };

    return functor;

};
