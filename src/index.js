var Reflux = require('reflux-core');

Reflux.connect = require('./connect');

Reflux.connectFilter = require('./connectFilter');

Reflux.ListenerMixin = require('./ListenerMixin');

Reflux.listenTo = require('./listenTo');

Reflux.listenToMany = require('./listenToMany');

/* globals React: false */
Reflux.defineReact = require('./Component');
try {
	if (React) {
		Reflux.defineReact(React, Reflux);
	}
} catch (e) { }

module.exports = Reflux;
