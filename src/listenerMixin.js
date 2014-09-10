var _ = require('./utils'),
    Reflux = require('../src');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `listenerMethods` and takes care of setup and teardown of subscriptions.
 */
module.exports = _.extend(Reflux.listenerMethods,{

    /**
     * Set up the mixin before the initial rendering occurs. Event listeners
     * and callbacks should be registered once the component successfully
     * mounted (as described in the React docs).
     */
    componentWillMount: function() {
        this.subscriptions = [];
    },

    /**
     * Cleans up all listener previously registered. 
     */
    componentWillUnmount: function() {
        this.subscriptions.forEach(function(unsubscribe) {
            unsubscribe(true);
        });
        this.subscriptions = [];
    }
});
