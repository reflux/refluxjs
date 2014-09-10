var _ = require('./utils'),
    Reflux = require('../src'),
    eventLabel = "change";

/**
 * Creates an event emitting Data Store
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store instance
 */
module.exports = function(definition) {

    var emitter = new _.EventEmitter();

    function Store() {
        var i=0, arr;
        this.subscriptions = [];
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables){
            arr = [].concat(this.listenables);
            for(;i < arr.length;i++){
                this.listenToMany(arr[i]);
            }
        }
    }

    _.extend(Store.prototype, definition, Reflux.listenerMethods, {
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
    });

    return new Store();
};
