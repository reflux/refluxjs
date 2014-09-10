var _ = require('./utils'),
    eventLabel = "change";

/**
 * Creates an event emitting Data Store
 *
 * @param {Object} definition The data store object definition
 */

module.exports = function(definition) {

    var emitter = new _.EventEmitter();

    function Store() {
        this.registered = [];
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables && _.isObject(this.listenables)){
            for(var key in this.listenables){
                this.listenTo(this.listenables[key],key,this[key+"Default"]||key);
            }
        }
    }

    _.extend(Store.prototype, definition, {
        listenTo: function(listenable, callback, defaultCallback) {
            if (listenable === this) {
                throw Error("Store is not able to listen to itself");
            }
            if (!_.isFunction(listenable.listen)) {
                throw new TypeError(listenable + " is missing a listen method");
            }
            if (this.hasListener(listenable)) {
                throw Error("Store cannot listen to this listenable because of circular loop");
            }
            _.handleDefaultCallback(this, listenable, this[defaultCallback]||defaultCallback);
            this.registered.push(listenable);
            var unsubscribe = listenable.listen(this[callback]||callback, this);
            var self = this;
            return function () {
                unsubscribe();
                self.registered.splice(self.registered.indexOf(listenable), 1);
            };
        },
        listen: function(callback, bindContext) {
            var eventHandler = function(args) {
                callback.apply(bindContext, args);
            };
            eventHandler.l = callback;
            emitter.addListener(eventLabel, eventHandler);
            return function() {
                emitter.removeListener(eventLabel, eventHandler);
            };
        },
        trigger: function() {
            emitter.emit(eventLabel, arguments);
        },
        hasListener: function(listenable) {
            var i = 0,
                listener;
            for (;i < this.registered.length; ++i) {
                listener = this.registered[i];
                if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                    return true;
                }
            }
            return false;
        }
    });

    return new Store();
};
