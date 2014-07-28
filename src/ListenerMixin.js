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
     */
    listenTo: function(listenable, callback) {
        var unsubscribe = listenable.listen(callback, this);
        this.subscriptions.push(unsubscribe);
    },

    componentWillUnmount: function() {
        this.subscriptions.forEach(function(unsubscribe) {
            unsubscribe();
        });
        this.subscriptions = [];
    }
};
