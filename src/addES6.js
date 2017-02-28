
/* globals React: false */

var Reflux = require('reflux-core');
Reflux.defineReact = require('./defineReact');

// useful utility for ES6 work, mimics the ability to extend
Reflux.utils.inherits = function(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}
	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: {
			value: subClass,
			enumerable: false,
			writable: true,
			configurable: true
		}
	});
	if (superClass) {
		if (Object.setPrototypeOf) {
			Object.setPrototypeOf(subClass, superClass);
		} else {
			/* jshint proto: true */
			subClass.__proto__ = superClass;
		}
	}
};

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
