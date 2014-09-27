var _ = require('./utils'),
    slice = Array.prototype.slice;

/**
 * A module of methods related to listening.
 */
module.exports = {

    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
    hasListener: function(listenable) {
        var i = 0,
            listener;
        for (;i < (this.subscriptions||[]).length; ++i) {
            listener = this.subscriptions[i].listenable;
            if ((listener === listenable && !listenable._isAction) || listener.hasListener && listener.hasListener(listenable)) {
                return true;
            }
        }
        return false;
    },

    /**
     * A convenience method that listens to all listenables in the given object.
     *
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
     */
    listenToMany: function(listenables){
        for(var key in listenables){
            var cbname = _.callbackName(key),
                localname = this[cbname] ? cbname : this[key] ? key : undefined;
            if (localname){
                this.listenTo(listenables[key],localname,this[cbname+"Default"]||this[localname+"Default"]||localname);
            }
        }
    },

    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening: function(listenable){
        if (listenable === this) {
            return "Listener is not able to listen to itself";
        }
        if (!_.isFunction(listenable.listen)) {
            return listenable + " is missing a listen method";
        }
        if (this.hasListener(listenable)) {
            return "Listener cannot listen to this listenable because of circular loop";
        }
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    listenTo: function(listenable, callback, defaultCallback) {
        var err = this.validateListening(listenable),
            self = this;
        if (err){
            throw Error(err);
        }
        this.fetchDefaultData(listenable, defaultCallback);
        if (!this.subscriptions) { this.subscriptions = [];}
        var desub = listenable.listen(this[callback]||callback, this),
            unsubscriber = function (dontupdatearr) {
                desub();
                if (!dontupdatearr) {
                    self.subscriptions.splice(self.subscriptions.indexOf(listenable), 1);
                }
            },
            subscriptionobj = {
                stop: unsubscriber,
                listenable: listenable
            };
        this.subscriptions.push(subscriptionobj);
        return subscriptionobj;
    },

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @param {Boolean} dontupdatearr If true, we don't remove the subscription object from this.subscriptions
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo: function(listenable, dontupdatearr){
        for(var i=0; i<(this.subscriptions||[]).length;i++){
            if (this.subscriptions[i].listenable === listenable){
                this.subscriptions[i].stop(dontupdatearr);
                return true;
            }
        }
        return false;
    },

    /**
     * Stops all subscriptions and empties subscriptions array
     *
     */
    stopListeningToAll: function(){
        (this.subscriptions||[]).forEach(function(subscription) {
            subscription.stop(true);
        });
        this.subscriptions = [];
    },

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getDefaultData` method.
     * @param {Action|Store} listenable The publisher we want to get default data from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchDefaultData: function (listenable, defaultCallback) {
        defaultCallback = (defaultCallback && this[defaultCallback]) || defaultCallback;
        var me = this;
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getDefaultData)) {
            data = listenable.getDefaultData();
            if (data && _.isFunction(data.then)) {
                data.then(function() {
                    defaultCallback.apply(me, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    },

    /**
     * The callback will be called once all listenables have triggered at least once.
     * @param {...Publishers} publishers Publishers that should be tracked.
     * @param {Function|String} callback The method to call when all publishers have emitted
     */
    listenToAggregate: function(/* listenables... , callback */){
        var listenables = slice.call(arguments),
            callback = listenables.pop(),
            numberOfListenables = listenables.length,
            listener = this,
            listenablesEmitted,
            args;
        for (var i = 0; i < numberOfListenables; i++) {
            this.listenTo(listenables[i],newListener(i));
        }
        reset();

        // ---- internal aggregation functions ----

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
                (listener[callback]||callback).apply(listener,args);
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
    }
};

