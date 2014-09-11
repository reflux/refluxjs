var _ = require('./utils'),
    Reflux = require('../src');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `listenerMethods` and takes care of teardown of subscriptions.
 */
module.exports = _.extend({

    /**
     * By adding this in the mixin we get error message if other React mixins try to use the same prop
     */
    subscriptions: [],

    /**
     * Cleans up all listener previously registered. 
     */
    componentWillUnmount: Reflux.listenerMethods.stopListeningToAll

},Reflux.listenerMethods);
