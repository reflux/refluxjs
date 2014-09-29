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

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter(),
        _isAction: true
    },definition,Reflux.PublisherMethods,{
        preEmit: definition.preEmit || Reflux.PublisherMethods.preEmit,
        shouldEmit: definition.shouldEmit || Reflux.PublisherMethods.shouldEmit
    });

    var functor = function() {
        functor.triggerAsync.apply(functor, arguments);
    };

    _.extend(functor,context);

    Keep.createdActions.push(functor);

    return functor;

};
