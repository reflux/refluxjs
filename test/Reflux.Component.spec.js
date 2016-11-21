
var chai = require('chai');
var assert = chai.assert;
chai.use(require('chai-as-promised'));

	
var React = require('react');
var ReactDOMServer = require('react-dom/server');
var Reflux = require('../src');


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


describe('Creating ES6 style React classes', function()
{
	it('should allow defining of React with Reflux.defineReact without error', function()
	{
		Reflux.defineReact(React);
		
		return true;
	});
	
	it('should render a simple class extending Reflux.Component', function()
	{
		var MyComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = Reflux.createStore({state:{a:'b'}});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, 'Hello World');
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>Hello World</p>' );
	});

	it('should accept React property values', function()
	{
		var MyComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = Reflux.createStore({state:{a:'b'}});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.props.foo);
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, {foo:'bar'}) );
		
		assert.equal( result, '<p>bar</p>' );
	});
	
	it('should accept React ancestors and children', function()
	{
		var MyChild = React.createClass({
			render: function() {
				return React.createElement("span", null, 'Hello');
			}
		});
		
		var MyComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = Reflux.createStore({state:{a:'b'}});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, React.createElement(MyChild, null));
			};
			return Component;
		}(Reflux.Component));
		
		var MyParent = React.createClass({
			render: function() {
				return React.createElement("div", null, React.createElement(MyComponent, null));
			}
		});
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyParent, null) );
		
		assert.equal( result, '<div><p><span>Hello</span></p></div>' );
	});
	
	it('should accept other Reflux.Component ancestors and children', function()
	{
		var MyChild = (function (_super) {
			__extends(Child, _super);
			function Child(props) {
				_super.call(this, props);
				this.state = {};
				this.store = Reflux.createStore({state:{a:'b'}});
			}
			Child.prototype.render = function () {
				return React.createElement("span", null, 'World');
			};
			return Child;
		}(Reflux.Component));
		
		var MyComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = Reflux.createStore({state:{a:'b'}});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, React.createElement(MyChild, null));
			};
			return Component;
		}(Reflux.Component));
		
		var MyParent = (function (_super) {
			__extends(Parent, _super);
			function Parent(props) {
				_super.call(this, props);
				this.state = {};
				this.store = Reflux.createStore({state:{a:'b'}});
			}
			Parent.prototype.render = function () {
				return React.createElement("div", null, React.createElement(MyComponent, null));
			};
			return Parent;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyParent, null) );
		
		assert.equal( result, '<div><p><span>World</span></p></div>' );
	});
	
	it('should accept values from a store\'s state property', function()
	{
		var MyComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.store = Reflux.createStore({state:{foo:'baz'}});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>baz</p>' );
	});
	
	it('should accept values from multiple stores', function()
	{
		var MyComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {};
				this.stores = [Reflux.createStore({state:{foo:'bar'}}), Reflux.createStore({state:{bar:'foo'}})];
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.bar, ':', this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>foo:bar</p>' );
	});
	
	it('should retain normal React state values', function()
	{
		var MyComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {bar:'foo'};
				this.store = Reflux.createStore({state:{foo:'bar'}});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.bar, ':', this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>foo:bar</p>' );
	});
	
	it('should extend third party components with Reflux.Component.extend()', function()
	{
		var OtherComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.foo = 'other class bar and ';
			}
			return Component;
		}(React.Component));
		
		var MyComponent = (function (_super) {
			__extends(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.store = Reflux.createStore({state:{foo:'baz'}});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.foo+this.state.foo);
			};
			return Component;
		}(Reflux.Component.extend(OtherComponent)));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>other class bar and baz</p>' );
	});

});
