exports.listenerMethods = require('./listenerMethods');

exports.publisherMethods = require('./publisherMethods');

exports.createAction = require('./createAction');

exports.createStore = require('./createStore');

exports.listenerMixin = exports.ListenerMixin = require('./listenerMixin');

exports.listenTo = require('./listenTo');

exports.all = require('./all');

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

exports.nextTick = function(nextTick) {
    var _ = require('./utils');
    _.nextTick = nextTick;
};
