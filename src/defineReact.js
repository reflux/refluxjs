

/**
 * An implementation for idiomatic React.js classes that mix with
 * Reflux stores. To utilize extend Reflux.Component instead of
 * React.Component. Then you may hook any Reflux store that has a
 * `this.state` property containing its state values to the component
 * via `this.store` or an Array of Reflux stores via `this.stores` in
 * the component's constructor (similar to how you assign initial state
 * in the constructor in ES6 style React). The default values of the
 * stores will automaticall reflect in the component's state, and any
 * further `trigger` calls from that store will update properties passed
 * in the trigger into the component automatically.
 */
 
/**
 * Also implements optionsl Reflux.Store class that is idiomatic with
 * the React ES6 style. You extend Reflux.Store and then the rest works
 * the same as createStore, except the constructor instead of init, and
 * it holds state in a state property, and a .setState method is available
 * which automatically updates state and does a trigger. Then when using
 * with this.store or this.stores in an ES6 component just plass the class,
 * it will deal with a singleton instantiation of the class automatically.
 */


var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) {
		if (b.hasOwnProperty(p)) {
			d[p] = b[p];
		}
	}
    function __() {
		this.constructor = d;
	}
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};

/* globals Reflux: false */

/**
 * Also adds a `Reflux.defineReact` function where you can manually supply
 * the React object in order to create in case Reflux needs to load before
 * React or there is a modular environment where there won't be a global
 * React variable.
 */
function defineReact(react, reflux)
{
	var rflx;
	
	try {
		rflx = reflux || Reflux;
	} catch (e) {
		return;
	}
	
	if (rflx && react && react.Component)
	{
		var RefluxComponent = function(props) {
			_super.call(this, props);
		};
		
		var _super = react.Component;
		__extends(RefluxComponent, _super);
		
		RefluxComponent.prototype.componentWillMount = function () {
			if (this.store) {
				if (Array.isArray(this.stores)) {
					this.stores.unshift(this.store);
				} else {
					this.stores = [this.store];
				}
			}
			if (this.stores) {
				this.__storeunsubscribes__ = [];
				for (var i = 0, ii = this.stores.length; i < ii; i++) {
					if (this.stores[i].isES6Store) {
						if (!this.stores[i].singleton) {
							this.stores[i].singleton = new this.stores[i]();
						}
						this.stores[i] = this.stores[i].singleton;
					}
					this.__storeunsubscribes__.push(this.stores[i].listen(this.setState.bind(this)));
					this.setState(this.stores[i].state);
				}
			}
			else {
				throw new Error('Extending Reflux.Component requires you to set either this.store or this.stores in the constructor.');
			}
		};
		
		RefluxComponent.prototype.componentWillUnmount = function () {
			for (var i = 0, ii = this.__storeunsubscribes__.length; i < ii; i++) {
				this.__storeunsubscribe__[i]();
			}
		};
		
		rflx.Component = RefluxComponent;
		
		// ---------------------------------------------------
		
		var RefluxStore = function() {
			this.__store__ = rflx.createStore();
			this.state = {};
			var self = this;
			for (var key in this.__store__) {
				/*jshint loopfunc: true */
				(function (prop) {
					Object.defineProperty(self, prop, {
						get: function () { return self.__store__[prop]; },
						set: function (v) { self.__store__[prop] = v; }
					});
				})(key);
			}
		};
		
		Object.defineProperty(RefluxStore.prototype, "listenables", {
			get: function () {
				return this.__listenables__;
			},
			set: function (v) {
				this.__listenables__ = v;
				for (var key in v) {
					var camel = 'on' + key.charAt(0).toUpperCase() + key.substr(1);
					if (this[key] && typeof this[key] === 'function') {
						this.listenTo(v[key], this[key].bind(this));
					}
					if (this[camel] && typeof this[camel] === 'function') {
						this.listenTo(v[key], this[camel].bind(this));
					}
				}
			},
			enumerable: true,
			configurable: true
		});
		
		RefluxStore.prototype.setState = function (obj) {
			// Object.assign(this.state, obj); // later turn this to Object.assign and remove loop once support is good enough
			for (var key in obj) {
				this.state[key] = obj[key];
			}
			this.trigger(obj);
		};
		
		Object.defineProperty(RefluxStore, "isES6Store", {
			get: function () {
				return true;
			},
			enumerable: true,
			configurable: true
		});
		
		rflx.Store = RefluxStore;
	}
}

module.exports = defineReact;

