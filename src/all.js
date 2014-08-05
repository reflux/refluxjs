var createAction = require('./createAction');

var slice = Array.prototype.slice;

/**
 * Track a set of Actions and Stores. Use Reflux.all if you need to handle
 * data coming in parallel.
 *
 * @param {...Action|Store} listenables Actions and Stores that should be
 *  tracked.
 * @returns {Action} An action which tracks the provided Actions and Stores.
 *  The action will emit once all of the provided listenables have emitted at
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
        // this action combines all the listenables
        action = createAction();

    action.hasListener = function(listenable) {
        var i = 0, listener;

        for (; i < args.length; ++i) {
            listener = args[i];
            if (listener === listener) {
                return true;
            }
            if (listener.hasListener && listener.hasListener(listenable)) {
                return true;
            }
        }

        return false;
    };

    reset();

    for (var i = 0; i < numberOfListenables; i++) {
        arguments[i].listen(newListener(i), null);
    }

    return action;

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
            action.apply(action, args);
            reset();
        }
    }

    function didAllListenablesEmit() {
        // reduce cannot be used because it only iterates over *present*
        // elements in the array. Initially the Array doesn't contain
        // elements. Fore this reason the usage of reduce would always indicate
        // that all listenables emitted.
        for (var i = 0; i < numberOfListenables; i++) {
            if (!listenablesEmitted[i]) {
                return false;
            }
        }
        return true;
    }
};
