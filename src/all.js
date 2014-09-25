var createStore = require('./createStore');

var slice = Array.prototype.slice;

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
    var numberOfListenables = arguments.length,
        // create a new array of the expected size. The initial
        // values will be falsy, which is fine for us.
        // Once each item in the array is truthy, the callback can be called
        listenablesEmitted,
        // these arguments will be used to *apply* the action.
        args,
        // the original listenables
        listenables = slice.call(arguments);
        // this store combines all the listenables
        store = createStore({
            init: function(){
                for (var i = 0; i < numberOfListenables; i++) {
                    this.listenTo(listenables[i],newListener(i));
                }
                reset();
            }
        });

    return store;

    function reset() {
        listenablesEmitted = new Array(numberOfListenables);
        args = new Array(numberOfListenables);
    }

    function newListener(i) {
        return function() {
            listenablesEmitted[i] = true;
            // Reflux users should not need to care about Array and arguments
            // differences. This makes sure that they get the expected Array
            // interface
            args[i] = slice.call(arguments);
            emitWhenAllListenablesEmitted();
        };
    }

    function emitWhenAllListenablesEmitted() {
        if (didAllListenablesEmit()) {
            store.trigger.apply(store,args);
            reset();
        }
    }

    function didAllListenablesEmit() {
        // reduce cannot be used because it only iterates over *present*
        // elements in the array. Initially the Array doesn't contain
        // elements. For this reason the usage of reduce would always indicate
        // that all listenables emitted.
        for (var i = 0; i < numberOfListenables; i++) {
            if (!listenablesEmitted[i]) {
                return false;
            }
        }
        return true;
    }
};
