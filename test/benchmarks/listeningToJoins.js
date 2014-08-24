var Reflux = require('../../src'),
    actions = [],
    joinedActions,
    i,
    noop = function() {},
    NUMBER_OF_LISTENERS = 100,
    NUMBER_OF_JOINED_ACTIONS = 10;

for (i = 0; i < NUMBER_OF_JOINED_ACTIONS; i++) {
    actions = Reflux.createAction();
}

joinedActions = Reflux.all(actions);

for (i = 0; i < NUMBER_OF_LISTENERS; i++) {
    joinedActions.listen(noop);
}

exports.name = "Listening to " + NUMBER_OF_JOINED_ACTIONS + " joined actions with " + NUMBER_OF_LISTENERS + " listeners";

exports.fn = function() {
    for (i = 0; i < actions.length; i++) {
        actions[i](Math.random());
    }
};
