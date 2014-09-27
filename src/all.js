var createStore = require('./createStore');

/**
 * Track a set of Actions and Stores. Use Reflux.all if you need to handle
 * data coming in parallel.
 *
 * @param {...Publishers} publishers Publishers that should be
 *  tracked.
 * @returns {Store} A store which listens to the provided Publishers.
 *  The store will emit once all of the provided publishers have emitted at
 *  least once.
 */
module.exports = function(/* listenables... */) {
    var listenables = Array.prototype.slice.call(arguments);
    return createStore({
        init: function(){
            this.listenToAggregate.apply(this,listenables.concat("trigger"));
        }
    });
};
