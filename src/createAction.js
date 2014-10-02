var _ = require('./utils'),
    Reflux = require('../src'),
    Keep = require('./Keep');

/**
 * Creates an action functor object. It is mixed in with functions
 * from the `PublisherMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} definition The action object definition
 */
module.exports = function(definition) {

    definition = definition || {};

    for(var d in definition){
        if (d!=="preEmit" && d!=="shouldEmit" && Reflux.PublisherMethods[d]){
            if (d!=="preEmit" && d!=="shouldEmit" && Reflux.PublisherMethods[d]) {
                throw new Error("Cannot override API method " + d + 
                    " in action creation. Use another method name or override it on Reflux.PublisherMethods instead."
                );
            }
        }
    }

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    },Reflux.PublisherMethods,definition);

    var functor = function() {
        functor.triggerAsync.apply(functor, arguments);
    };

    _.extend(functor,context);

    Keep.createdActions.push(functor);

    return functor;

};
