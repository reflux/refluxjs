var _ = require('./utils'),
    Reflux = require('../src'),
    keep = require('./keep');

/**
 * Creates an action functor object
 */
module.exports = function(definition) {

    definition = definition || {};

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter()
    },definition,Reflux.publisherMethods,{
        preEmit: definition.preEmit || Reflux.publisherMethods.preEmit,
        shouldEmit: definition.shouldEmit || Reflux.publisherMethods.shouldEmit
    });

    var functor = function() {
        context.triggerAsync.apply(context,arguments);
    };

    _.extend(functor,context);

    keep.createdActions.push(functor);

    return functor;

};
