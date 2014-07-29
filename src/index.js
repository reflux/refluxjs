var _ = require('./utils');

exports.createAction = require('./createAction');

exports.createStore = require('./createStore');

exports.ListenerMixin = require('./ListenerMixin');

exports.createActions = function(actionNames) {
    var i = 0,
        actions = {},
        sharedContext = new _.EventEmitter();

    for (; i < actionNames.length; i++) {
        if(!_.isFunction(actions[actionNames[i]]))
            actions[actionNames[i]] = exports.createAction(actionNames[i], sharedContext);
    }
    return actions;
};

exports.setEventEmitter = function(ctx) {
    var _ = require('./utils');
    _.EventEmitter = ctx;
};
