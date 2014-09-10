var _ = require('./utils'),
    Reflux = require('../src');

module.exports = _.extend(Reflux.listenerMethods,{

    /**
     * Set up the mixin before the initial rendering occurs. Event listeners
     * and callbacks should be registered once the component successfully
     * mounted (as described in the React docs).
     */
    componentWillMount: function() {
        this.subscriptions = [];
    },

    componentWillUnmount: function() {
        this.subscriptions.forEach(function(unsubscribe) {
            unsubscribe(true);
        });
        this.subscriptions = [];
    }
});
