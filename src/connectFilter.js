var Reflux = require('./index'),
  _ = require('./utils');

module.exports = function(listenable, key, filterFunc) {
    filterFunc = _.isFunction(key) ? key : filterFunc;
    return {
        getInitialState: function() {
	    var result;
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            } else if (_.isFunction(key)) {
                result = filterFunc.call(this, listenable.getInitialState());
                if (result === undefined) {
                    return {};
		}
                return result;
            } else {
                // Filter initial payload from store.
                result = filterFunc.call(this, listenable.getInitialState());
                if (result === undefined) {
                    return {};
		}
		return _.object([key], [result]);
            }
        },
        componentDidMount: function() {
            _.extend(this, Reflux.ListenerMethods);
            var me = this;
	    var result;
            var cb = function(value) {
                if (_.isFunction(key)) {
                    result = filterFunc.call(me, value);
                    if (result) {
                        me.setState(result);
		    }
                } else {
                    result = filterFunc.call(me, value);
                    me.setState(_.object([key], [result]));
                }
            };

            this.listenTo(listenable, cb);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};
