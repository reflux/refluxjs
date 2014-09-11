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
        for (;i < (this.subscriptions||[]).length; ++i) {
            listener = this.subscriptions[i].listenable;
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
        _.handleDefaultCallback(this, listenable, (defaultCallback && this[defaultCallback]) || defaultCallback);
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
    }
};

