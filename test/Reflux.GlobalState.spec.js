
var chai = require('chai'),
    assert = chai.assert;

chai.use(require('chai-as-promised'));
	
var React = require('react');
var ReactDOMServer = require('react-dom/server');


function __extends (d, b) {
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


describe('Working with Reflux.GlobalState', function()
{
	it('should allow defining of React with Reflux.defineReact without error', function()
	{
		var Reflux = require('../src');
		Reflux.defineReact(React, Reflux);
		
		return true;
	});
	
	it('should construct with a default empty state object', function()
	{
		var Reflux = require('../src');
		Reflux.defineReact(React, Reflux);
		
		assert.equal( typeof Reflux.GlobalState, 'object' );
	});
	
	it('should remain empty when a store is created without a static id', function()
	{
		var Reflux = require('../src');
		Reflux.defineReact(React, Reflux);
		
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		
		var MyComponent = (function (_super) {
			__extends(Component, _super);
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
		var Reflux = require('../src');
		Reflux.defineReact(React, Reflux);
		
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			__extends(Component, _super);
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
	
	it('should update upon setState in store', function()
	{
		var Reflux = require('../src');
		Reflux.defineReact(React, Reflux);
		
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			__extends(Component, _super);
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
	
	it('when set before component mounting should define initial state in store', function()
	{
		var Reflux = require('../src');
		Reflux.defineReact(React, Reflux);
		
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
			}
			return Store;
		}(Reflux.Store));
		MyStore.id = "MyStore";
		
		var MyComponent = (function (_super) {
			__extends(Component, _super);
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
});
