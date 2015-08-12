var ListenerMethods = require('reflux-core/lib/ListenerMethods'),
    ListenerMixin = require('./ListenerMixin'),
    _ = require('reflux-core/lib/utils');

module.exports = function(listenable, key, filterFunc) {
    filterFunc = _.isFunction(key) ? key : filterFunc;
    var lastListenableState = {}; // Save the last state so it can be re-filtered on componentWillUpdate
    return {
        getInitialState: function() {
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (_.isFunction(key)) {
                lastListenableState = listenable.getInitialState();
                return filterFunc.call(this, listenable.getInitialState());
            } else {
                lastListenableState = listenable.getInitialState();
                // Filter initial payload from store.
                var result = filterFunc.call(this, listenable.getInitialState());
                if (typeof(result) !== "undefined") {
                    return _.object([key], [result]);
                } else {
                    return {};
                }
            }
        },
        componentWillUpdate: function() {
            var me = this;
            if (_.isFunction(key)) {
                me.setState(filterFunc.call(me, lastListenableState));
            } else {
                var result = filterFunc.call(me, lastListenableState);
                me.setState(_.object([key], [result]));
            }
        },
        componentDidMount: function() {
            _.extend(this, ListenerMethods);
            var me = this;
            var cb = function(value) {
                lastListenableState = value;
                if (_.isFunction(key)) {
                    me.setState(filterFunc.call(me, value));
                } else {
                    var result = filterFunc.call(me, value);
                    me.setState(_.object([key], [result]));
                }
            };

            this.listenTo(listenable, cb);
        },
        componentWillUnmount: ListenerMixin.componentWillUnmount
    };
};

