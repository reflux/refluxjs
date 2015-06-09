var Immutable = require('immutable');

/**
 * A module of methods that you want to include in all stores.
 * This module is consumed by `createStore`.
 */
module.exports = {
    init: function() {
        var initialState = null;
        if (this.getInitialState) {
            initialState = this.getInitialState();
        }
        this.state = Immutable.Map(initialState);
    },
    setState: function(nextState) {
        this.state = this.state.merge(nextState);
        this.trigger(this.state.toJS());
    },
    replaceState: function(newState) {
        this.state = Immutable.Map(newState);
        this.trigger(this.state.toJS());
    }
};
