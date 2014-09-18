var _ = require('./utils'),
    Reflux = require('../src'),
    keep = require('./keep');

/**
 * Creates an action functor object. It is mixed in with functions
 * from the `listenableMethods` mixin. `preEmit` and `shouldEmit` may
 * be overridden in the definition object.
 *
 * @param {Object} definition The action object definition
 */
module.exports = function(definition) {

    definition = definition || {};

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter()
    },definition,Reflux.listenableMethods,{
        preEmit: definition.preEmit || Reflux.listenableMethods.preEmit,
        shouldEmit: definition.shouldEmit || Reflux.listenableMethods.shouldEmit
    });

    var functor = function() {
        functor.triggerAsync.apply(functor,arguments);
    };

    _.extend(functor,context);

    keep.createdActions.push(functor);

    return functor;

};
