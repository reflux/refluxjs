exports.createAction = require('./createAction');

exports.createStore = require('./createStore');

exports.ListenerMixin = require('./ListenerMixin');

exports.createActions = function(actionNames) {
    var i = 0, actions = {};
    for (; i < actionNames.length; i++) {
        actions[actionNames[i]] = exports.createAction();
    }
    return actions;
};

exports.setEventEmitter = function(ctx) {
    var _ = require('./utils');
    _.EventEmitter = ctx;
};
