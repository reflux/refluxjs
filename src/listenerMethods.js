var _ = require('./utils');

/**
 * A module of methods related to listening. This module is consumed by `createStore`,
 * `listenerMixin` and the `listenTo` mixin factory.
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
        for (;i < this.subscriptions.length; ++i) {
            listener = this.subscriptions[i];
            if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
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
            return "Store is not able to listen to itself";
        }
        if (!_.isFunction(listenable.listen)) {
            return listenable + " is missing a listen method";
        }
        if (this.hasListener(listenable)) {
            return "Store cannot listen to this listenable because of circular loop";
        }
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Function} A function which desubscribes the callback
     */
    listenTo: function(listenable, callback, defaultCallback) {
    	var err = this.validateListening(listenable);
    	if (err){
    		throw Error(err);
    	}
        _.handleDefaultCallback(this, listenable, (defaultCallback && this[defaultCallback]) || defaultCallback);
        if (!this.subscriptions) { this.subscriptions = [];}
        this.subscriptions.push(listenable);
        var unsubscribe = listenable.listen(this[callback]||callback, this);
        var self = this;
        return function (dontupdatearr) {
            unsubscribe();
            if (!dontupdatearr) {
            	self.subscriptions.splice(self.subscriptions.indexOf(listenable), 1);
            }
        };
    }
};