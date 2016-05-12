var Reflux = require('reflux-core');

Reflux.connect = require('./connect');

Reflux.connectFilter = require('./connectFilter');

Reflux.ListenerMixin = require('./ListenerMixin');

Reflux.listenTo = require('./listenTo');

Reflux.listenToMany = require('./listenToMany');

/* globals React: false */
Reflux.defineReact = require('./defineReact');

if (reactExists()) {
	Reflux.defineReact(React, Reflux);
}

function reactExists()
{
	try {
		if (React) {
			return true;
		}
	} catch (e) { }
	
	return false;
}

module.exports = Reflux;
