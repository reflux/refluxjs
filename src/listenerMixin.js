var _ = require('./utils'),
    listenerMethods = require('./listenerMethods');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `listenerMethods` mixin and takes care of teardown of subscriptions.
 */
module.exports = _.extend({

    /**
     * Cleans up all listener previously registered.
     */
    componentWillUnmount: listenerMethods.stopListeningToAll

}, listenerMethods);
