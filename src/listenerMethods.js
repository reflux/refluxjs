var _ = require('./utils');

module.exports = {
	
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

    listenToMany: function(obj){
        for(var key in obj){
            var cbname = _.callbackName(key),
                localname = this[cbname] ? cbname : this[key] ? key : undefined;
            if (localname){
                this.listenTo(obj[key],localname,this[cbname+"Default"]||this[localname+"Default"]||localname);
            }
        }
    },

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
     * Subscribes the given callback for action triggered
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function} callback The callback to register as event handler
     * @param {Function} defaultCallback The callback to register as default handler
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