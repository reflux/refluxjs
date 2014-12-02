var Reflux = require('../src'),
    _ = require('./utils');

function prepareStateForKey (state, key) {
	if (key === undefined) {
		return state;
	}

	return _.object([key],[state]);
}

module.exports = function(listenable,key){
	return {
		getInitialState: function (){
			if (_.isFunction(listenable.getInitialState)) {
				return prepareStateForKey(listenable.getInitialState(), key) || {};
			} else {
				return {};
			}
		},

		componentWillMount: function (){
			this.unbindListener = listenable.listen(function (state) {
				this.setState(
					prepareStateForKey(state, key)
				);
			}.bind(this));
		},

		componentWillUnmount: function() {
			this.unbindListener();
		}
	};
};
