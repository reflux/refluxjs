
var chai = require('chai'),
    assert = chai.assert;

chai.use(require('chai-as-promised'));
	
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var Reflux;


describe('Working with Reflux.GlobalState', function()
{
	it('should allow defining of React with Reflux.defineReact without error and empty', function()
	{
		Reflux = require('../src');
		Reflux.defineReact(React);
		
		return true;
	});
	
	it('should construct with a default empty state object', function()
	{
		assert.equal( typeof Reflux.GlobalState, 'object' );
	});
	
	it('should remain empty when a store is created without a static id', function()
	{
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		
		var MyComponent = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>bar</p>' );
		assert.equal( Reflux.GlobalState.MyStore, undefined );
	});
	
	it('should gain state when a store is created with a static id', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>bar</p>' );
		assert.equal( Reflux.GlobalState.MyStore.foo, 'bar' );
	});
	
	it('should gain state when a store is created with a static id - initStore', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		Reflux.initStore(MyStore);
		
		assert.equal( Reflux.GlobalState.MyStore.foo, 'bar' );
	});
	
	it('should update upon setState in store', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		assert.equal( result, '<p>bar</p>' );
		
		try {
			MyStore.singleton.setState({foo:'BAR'});
		} catch (e) {}
		
		assert.equal( Reflux.GlobalState.MyStore.foo, 'BAR' );
	});
	
	it('should update upon setState in store - initStore', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var str = Reflux.initStore(MyStore);
		
		try {
			str.setState({foo:'BAR'});
		} catch (e) {}
		
		assert.equal( Reflux.GlobalState.MyStore.foo, 'BAR' );
	});
	
	it('when set before component mounting should define initial state in store', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		Reflux.GlobalState = {'MyStore':{'foo':'not bar'}};
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>not bar</p>' );
		assert.equal( Reflux.GlobalState.MyStore.foo, 'not bar' );
	});
	
	it('when set before initStore should define initial state in store', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		Reflux.GlobalState = {'MyStore':{'foo':'not bar'}};
		
		var str = Reflux.initStore(MyStore);
		
		assert.equal( Reflux.GlobalState.MyStore.foo, 'not bar' );
		assert.equal( str.state.foo, 'not bar' );
	});
	
	it('when set via setGlobalState before component mounting should define initial state in store', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		Reflux.setGlobalState( {'MyStore':{'foo':'not bar'}} );
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>not bar</p>' );
		assert.equal( Reflux.GlobalState.MyStore.foo, 'not bar' );
	});
	
	it('values from getGlobalState should not mutate upon further GlobalState mutations', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		Reflux.setGlobalState( {'MyStore':{'foo':'not bar'}} );
		
		var gotVal = Reflux.getGlobalState();
		
		Reflux.setGlobalState( {'MyStore':{'foo':'foobar'}} );
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>foobar</p>' );
		assert.equal( gotVal.MyStore.foo, 'not bar' );
		assert.equal( Reflux.GlobalState.MyStore.foo, 'foobar' );
	});
	
	it('setGlobalState should update all global states when used with a full object', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.bar + this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		Reflux.GlobalState = {'MyStore':{'foo':'not bar', 'bar':'not foo'}};
		Reflux.setGlobalState( {'MyStore':{'foo':'bar', 'bar':'foo'}} );
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>foobar</p>' );
		assert.equal( Reflux.GlobalState.MyStore.foo, 'bar' );
		assert.equal( Reflux.GlobalState.MyStore.bar, 'foo' );
	});
	
	it('setGlobalState should update partial global states when used with a partial object', function()
	{
		Reflux.GlobalState = {};
		Reflux.stores = {};
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		var singleton = new MyStore();
		MyStore.singleton = singleton;
		Reflux.stores.MyStore = singleton;
		
		var MyComponent = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.bar + this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		Reflux.GlobalState = {};
		Reflux.setGlobalState( {'MyStore':{'foo':'not bar', 'bar':'not foo'}} );
		Reflux.setGlobalState( {'MyStore':{'foo':'bar'}} );
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( Reflux.GlobalState.MyStore.foo, 'bar' );
		assert.equal( Reflux.GlobalState.MyStore.bar, 'not foo' );
		assert.equal( result, '<p>not foobar</p>' );
	});
});
