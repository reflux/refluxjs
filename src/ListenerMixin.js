var _ = require('./utils');
module.exports = {

    /**
     * Set up the mixin before the initial rendering occurs. Event listeners
     * and callbacks should be registered once the component successfully
     * mounted (as described in the React docs).
     */
    componentWillMount: function() {
        this.subscriptions = [];
    },


    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function} callback The callback to register as event handler
     * @param {Function} defaultCallback The callback to register as default handler
     */
    listenTo: function(listenable, callback, defaultCallback) {
        var unsubscribe = listenable.listen(callback, this);
        this.subscriptions.push(unsubscribe);

        _.handleDefaultCallback(this, listenable, defaultCallback);
    },

    componentWillUnmount: function() {
        this.subscriptions.forEach(function(unsubscribe) {
            unsubscribe();
        });
        this.subscriptions = [];
    }
};
