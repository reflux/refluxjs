var _ = require('./utils'),
    Reflux = exports,
    Keep = require('./Keep'),
    allowed = {preEmit:1,shouldEmit:1},
    bindMethods = require('./bindMethods'),
    strategyMethodNames = {
        strict: "joinStrict",
        first: "joinLeading",
        last: "joinTrailing",
        all: "joinConcat"
    },
    slice = Array.prototype.slice,
    maker = function(strategy){
        return function(/* listenables... */) {
            var listenables = slice.call(arguments);
            return Reflux.createStore({
                init: function(){
                    this[strategyMethodNames[strategy]].apply(this,listenables.concat("triggerAsync"));
                }
            });
        };
    };

exports.ActionMethods = require('./ActionMethods');

exports.ListenerMethods = require('./ListenerMethods');

exports.PublisherMethods = require('./PublisherMethods');

exports.StoreMethods = require('./StoreMethods');

exports.createAction = require('./createAction');

exports.createStore = function(definition) {

    definition = definition || {};

    for(var a in Reflux.StoreMethods){
        if (!allowed[a] && (Reflux.PublisherMethods[a] || Reflux.ListenerMethods[a])){
            throw new Error("Cannot override API method " + a +
                " in Reflux.StoreMethods. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead."
            );
        }
    }

    for(var d in definition){
        if (!allowed[d] && (Reflux.PublisherMethods[d] || Reflux.ListenerMethods[d])){
            throw new Error("Cannot override API method " + d +
                " in store creation. Use another method name or override it on Reflux.PublisherMethods / Reflux.ListenerMethods instead."
            );
        }
    }

    function Store() {
        var i=0, arr;
        this.subscriptions = [];
        this.emitter = new _.EventEmitter();
        this.eventLabel = "change";
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

    _.extend(Store.prototype, Reflux.ListenerMethods, Reflux.PublisherMethods, Reflux.StoreMethods, definition);

    var store = new Store();
    bindMethods(store, definition);
    Keep.createdStores.push(store);

    return store;
};

exports.connect = function(listenable,key){
    return {
        getInitialState: function(){
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (key === undefined) {
                return listenable.getInitialState();
            } else {
                return _.object([key],[listenable.getInitialState()]);
            }
        },
        componentDidMount: function(){
            var warned = false;
            for(var m in Reflux.ListenerMethods){
                if (this[m] && typeof console && typeof console.warn === "function" && !warned ){
                    console.warn(
                        "Component using Reflux.connect already had property '"+m+"'. "+
                        "Either you had your own property with that name which was now overridden, "+
                        "or you combined connect with ListenerMixin which is unnecessary as connect "+
                        "will include the ListenerMixin methods automatically."
                    );
                    warned = true;
                }
                this[m] = Reflux.ListenerMethods[m];
            }
            var me = this, cb = (key === undefined ? this.setState : function(v){me.setState(_.object([key],[v]));});
            this.listenTo(listenable,cb);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};

exports.ListenerMixin = require('./ListenerMixin');

exports.listenTo = require('./listenTo');

exports.listenToMany = require('./listenToMany');

exports.joinTrailing = exports.all = maker("last"); // Reflux.all alias for backward compatibility

exports.joinLeading = maker("first");

exports.joinStrict = maker("strict");

exports.joinConcat = maker("all");


/**
 * Convenience function for creating a set of actions
 *
 * @param actionNames the names for the actions to be created
 * @returns an object with actions of corresponding action names
 */
exports.createActions = function(actionNames) {
    var i = 0, actions = {};
    for (; i < actionNames.length; i++) {
        actions[actionNames[i]] = exports.createAction();
    }
    return actions;
};

/**
 * Sets the eventmitter that Reflux uses
 */
exports.setEventEmitter = function(ctx) {
    var _ = require('./utils');
    _.EventEmitter = ctx;
};

/**
 * Sets the method used for deferring actions and stores
 */
exports.nextTick = function(nextTick) {
    var _ = require('./utils');
    _.nextTick = nextTick;
};

/**
 * Provides the set of created actions and stores for introspection
 */
exports.__keep = require('./Keep');

/**
 * Warn if Function.prototype.bind not available
 */
if (!Function.prototype.bind) {
  console.error(
    'Function.prototype.bind not available. ' +
    'ES5 shim required. ' +
    'https://github.com/spoike/refluxjs#es5'
  );
}
