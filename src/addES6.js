
/* globals React: false */

var Reflux = require('reflux-core');
Reflux.defineReact = require('./defineReact');

// first try to see if there's a global React var and use it
if (typeof React !== 'undefined' && React) {
	Reflux.defineReact(React);
// otherwise we're gonna resort to 'try' stuff in case of other environments
} else {
	try {
		var R = require("react"); // we ignore this in browserify manually (see grunt file), so it's more of a doublecheck for in node
		Reflux.defineReact(R);
	} catch (e) {}
}
