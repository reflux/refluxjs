var _ = require('./utils'),
    Namespace = require('./Namespace');

exports.createAction = require('./createAction');

exports.createStore = require('./createStore');

exports.ListenerMixin = require('./ListenerMixin');

exports.createActions = function(actionNames) {
    var i = 0,
        actions = {},
        sharedContext = new Namespace();

    for (; i < actionNames.length; i++) {
        if(!_.isFunction(actions[actionNames[i]]))
            actions[actionNames[i]] = exports.createAction(sharedContext, actionNames[i]);
    }
    return actions;
};

exports.setEventEmitter = function(ctx) {
    var _ = require('./utils');
    _.EventEmitter = ctx;
};
