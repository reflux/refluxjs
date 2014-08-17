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
     * @param {Function} initialCallback The callback to register as initial handler
     */
    listenTo: function(listenable, callback, initialCallback) {
        var unsubscribe = listenable.listen(callback, this);
        this.subscriptions.push(unsubscribe);

        if (initialCallback && _.isFunction(initialCallback)) {
            if (listenable.getInitialData && _.isFunction(listenable.getInitialData)) {
                data = listenable.getInitialData();
                if (data && data.then && _.isFunction(data.then)) {
                    data.then(initialCallback);
                } else {
                    initialCallback(data);
                }
            } 
        }
    },

    componentWillUnmount: function() {
        this.subscriptions.forEach(function(unsubscribe) {
            unsubscribe();
        });
        this.subscriptions = [];
    }
};
