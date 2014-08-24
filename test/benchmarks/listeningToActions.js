var Reflux = require('../../src'),
    action = Reflux.createAction(),
    i,
    noop = function() {},
    NUMBER_OF_LISTENERS = 100;

// noops are listening to an action emit
for (i = 0; i < NUMBER_OF_LISTENERS; i++) {
    action.listen(noop);
}

exports.name = "Listening to actions with " + NUMBER_OF_LISTENERS + " listeners";

exports.fn = function() {
    action(Math.random());
};
