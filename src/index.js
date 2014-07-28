var createAction = exports.createAction = require('./createAction');

exports.createStore = require('./createStore');

exports.createActions = function(actionNames) {
    var i = 0, actions = {};
    for (; i < actionNames.length; i++) {
        actions[actionNames[i]] = createAction();
    }
    return actions;
};