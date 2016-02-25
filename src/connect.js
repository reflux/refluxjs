var ListenerMethods = require('reflux-core/lib/ListenerMethods'),
    ListenerMixin = require('./ListenerMixin'),
    _ = require('reflux-core/lib/utils');

module.exports = function(listenable, key) {

    _.throwIf(typeof(key) === 'undefined', 'Reflux.connect() requires a key.');

    return {
        getInitialState: function() {
            if (!_.isFunction(listenable.getInitialState)) {
                return {};
            }

            return _.object([key],[listenable.getInitialState()]);
        },
        componentDidMount: function() {
            var me = this;

            _.extend(me, ListenerMethods);

            this.listenTo(listenable, function(v) {
                me.setState(_.object([key],[v]));
            });
        },
        componentWillUnmount: ListenerMixin.componentWillUnmount
    };
};
