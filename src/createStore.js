var _ = require('./utils'),
    Reflux = require('../src');

/**
 * Creates an event emitting Data Store
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store functor
 */
module.exports = function(definition) {

    var functor, context, arr, i=0;

    definition = definition || {};

    context = _.extend({
        eventLabel: "change",
        emitter: new _.EventEmitter()
    }, definition, Reflux.listenerMethods, Reflux.publisherMethods,{
        preEmit: definition.preEmit || Reflux.publisherMethods.preEmit,
        shouldEmit: definition.shouldEmit || Reflux.publisherMethods.shouldEmit
    });

    functor = function() {
        functor.triggerAsync.apply(functor,arguments);
    };

    _.extend(functor,context);

    if (_.isFunction(functor.init)) {
        functor.init();
    }
    if (functor.listenables){
        arr = [].concat(functor.listenables);
        for(;i < arr.length;i++){
            functor.listenToMany(arr[i]);
        }
    }

    return functor;
};
