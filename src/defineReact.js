/* globals Reflux: false */

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
 * Also implements optional Reflux.Store class that is idiomatic with
 * the React ES6 style. You extend Reflux.Store and then the rest works
 * the same as createStore, except the constructor instead of init, and
 * it holds state in a state property, and a .setState method is available
 * which automatically updates state and does a trigger. Then when using
 * with this.store or this.stores in an ES6 component just plass the class,
 * it will deal with a singleton instantiation of the class automatically.
 */

/**
 * If a Reflux.Store definition is given a static id property and used
 * properly within a Reflux.Component then it will be added to a
 * Reflux.GlobalState object which automatically tracks the current
 * state of all such defined stores in the program. Furthermore you can
 * store any current Reflux.GlobalState object of a previous application
 * instance and then, before any component mounting happens, set the
 * Reflux.GlobalState and it will override any default states in the stores
 * and allow the program to start out at the other predefined state, making
 * it easy to save application state across multiple usages of the program.
 */

/**
 * Also adds a `Reflux.defineReact` function where you can manually supply
 * the React object in order to create in case Reflux needs to load before
 * React or there is a modular environment where there won't be a global
 * React variable.
 */
function defineReact(react, reflux)
{
	var rflx, proto;
	
	try {
		rflx = reflux || Reflux;
	} catch (e) {
		return;
	}
	
	rflx.GlobalState = rflx.GlobalState || {};
	
	if (rflx && react && react.Component)
	{
		var RefluxComponent = function(props) {
			_super.call(this, props);
		};
		
		var _super = react.Component;
		ext(RefluxComponent, _super);
		
		proto = RefluxComponent.prototype;
		
		proto.componentWillMount = function () {
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
					var str = this.stores[i];
					if (str.isES6Store) {
						var storeId = str.id;
						if (!str.singleton) {
							str.singleton = new str();
						}
						this.stores[i] = str = str.singleton;
						str.id = storeId;
						if (storeId && rflx.GlobalState[storeId]) {
							str.state = rflx.GlobalState[storeId];
						} else if (storeId) {
							rflx.GlobalState[storeId] = str.state;
						}
					}
					this.__storeunsubscribes__.push(str.listen(this.setState.bind(this)));
					this.setState(str.state);
				}
			}
			else {
				throw new Error('Extending Reflux.Component requires you to set either this.store or this.stores in the constructor.');
			}
		};
		
		proto.componentWillUnmount = function () {
			for (var i = 0, ii = this.__storeunsubscribes__.length; i < ii; i++) {
				this.__storeunsubscribes__[i]();
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
		
		proto = RefluxStore.prototype;
		
		Object.defineProperty(proto, "listenables", {
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
		
		proto.setState = function (obj) {
			// Object.assign(this.state, obj); // later turn this to Object.assign and remove loop once support is good enough
			for (var key in obj) {
				this.state[key] = obj[key];
			}
			if (this.id) {
				rflx.GlobalState[this.id] = this.state;
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

function ext(d, b) {
    for (var p in b) {
		if (b.hasOwnProperty(p)) {
			d[p] = b[p];
		}
	}
    function __() {
		this.constructor = d;
	}
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

module.exports = defineReact;

