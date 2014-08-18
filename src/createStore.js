var _ = require('./utils');

/**
 * Creates an event emitting Data Store
 *
 * @param {Object} definition The data store object definition
 */
module.exports = function(definition) {
    var store = new _.EventEmitter(),
        eventLabel = "change";

    function Store() {
        this.registered = [];
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
    }
    _.extend(Store.prototype, definition);
    Store.prototype.listenTo = function(listenable, callback, defaultCallback) {
        if (listenable === this) {
            throw Error("Store is not able to listen to itself");
        }
        if (!_.isFunction(listenable.listen)) {
            throw new TypeError(listenable + " is missing a listen method");
        }
        if (this.hasListener(listenable)) {
            throw Error("Store cannot listen to this listenable because of circular loop");
        }
        if (defaultCallback && _.isFunction(defaultCallback)) {
            if (listenable.getDefaultData && _.isFunction(listenable.getDefaultData)) {
                data = listenable.getDefaultData();
                if (data && data.then && _.isFunction(data.then)) {
                    data.then(defaultCallback.bind(this));
                } else {
                    defaultCallback(data.bind(this));
                }
            }
        }
        this.registered.push(listenable);
        return listenable.listen(callback, this);
    };
    Store.prototype.listen = function(callback, bindContext) {
        var eventHandler = function(args) {
            callback.apply(bindContext, args);
        };
        eventHandler.l = callback;
        store.addListener(eventLabel, eventHandler);

        return function() {
            store.removeListener(eventLabel, eventHandler);
        };
    };
    Store.prototype.trigger = function() {
        store.emit(eventLabel, arguments);
    };
    Store.prototype.hasListener = function(listenable) {
        var i = 0,
            listener;

        for (;i < this.registered.length; ++i) {
            listener = this.registered[i];
            if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                return true;
            }
        }

        return false;
    };

    return new Store();
};
