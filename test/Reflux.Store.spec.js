
/*jshint esnext:true */

var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    Q = require('q');

chai.use(require('chai-as-promised'));
	
var React = require('react');
var ReactDOMServer = require('react-dom/server');

Reflux.defineReact(React, Reflux);


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


describe('Creating ES6 style stores', function()
{
	it('should allow defining of React with Reflux.defineReact without error', function()
	{
		Reflux.defineReact(React, Reflux);
		
		return true;
	});
	
	it('should construct with a default empty state object', function()
	{
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
			}
			return Store;
		}(Reflux.Store));
		
		var store = new MyStore();
		
		assert.equal( typeof store.state, 'object' );
	});
	
	it('should add listenables and accept actions', function()
	{	
		var Actions = Reflux.createActions(['up', 'down', 'finish']);
		
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.listenTo(Actions.up, function(){ this.state.count++; });
				this.listenTo(Actions.down, function(){ this.state.count--; });
				this.state = {count:0};
			}
			return Store;
		}(Reflux.Store));
		
		var store = new MyStore();
		
		Actions.up();
		Actions.up();
		Actions.up();
		Actions.down();
		Actions.finish();
		
		var promise = Q.Promise(function(resolve) {
			store.listenTo(Actions.finish, function() {
				resolve(store.state.count);
			});
		});
		
		return assert.eventually.equal( promise, 2 );
	});
	
	it('should accept listenables with \'action\' and \'onAction\' callbacks', function()
	{	
		var Actions = Reflux.createActions(['up', 'down', 'finish']);
		
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.listenables = Actions;
				this.state = {count:0};
			}
			Store.prototype.up = function(){ this.state.count++; };
			Store.prototype.onDown = function(){ this.state.count--; };
			return Store;
		}(Reflux.Store));
		
		var store = new MyStore();
		
		Actions.up();
		Actions.up();
		Actions.up();
		Actions.down();
		Actions.finish();
		
		var promise = Q.Promise(function(resolve) {
			store.listenTo(Actions.finish, function() {
				resolve(store.state.count);
			});
		});
		
		return assert.eventually.equal( promise, 2 );
	});
	
	it('should be able to modify state with setState', function()
	{	
		var Actions = Reflux.createActions(['up', 'down', 'finish']);
		
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.listenables = Actions;
				this.state = {count:0};
			}
			Store.prototype.up = function(){ this.setState({count:this.state.count+1}); };
			Store.prototype.onDown = function(){ this.setState({count:this.state.count-1}); };
			return Store;
		}(Reflux.Store));
		
		var store = new MyStore();
		
		Actions.up();
		Actions.up();
		Actions.up();
		Actions.down();
		Actions.finish();
		
		var promise = Q.Promise(function(resolve) {
			store.listenTo(Actions.finish, function() {
				resolve(store.state.count);
			});
		});
		
		return assert.eventually.equal( promise, 2 );
	});
	
	it('should accept actions with arguments', function()
	{	
		var Actions = Reflux.createActions(['up', 'down', 'finish']);
		
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.listenables = Actions;
				this.state = {count:0};
			}
			Store.prototype.up = function(){ this.state.count++; };
			Store.prototype.onDown = function(by){ this.state.count -= by; };
			return Store;
		}(Reflux.Store));
		
		var store = new MyStore();
		
		Actions.up();
		Actions.up();
		Actions.up();
		Actions.down(2);
		Actions.finish();
		
		var promise = Q.Promise(function(resolve) {
			store.listenTo(Actions.finish, function() {
				resolve(store.state.count);
			});
		});
		
		return assert.eventually.equal( promise, 1 );
	});
	
	it('should mix state in with a Reflux.Component instance', function()
	{
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
	});
	
	it('should use singleton instance when applied to multiple components', function()
	{
		var MyStore = (function (_super) {
			__extends(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
				MyStore.instanceCount++;
			}
			return Store;
		}(Reflux.Store));
		
		MyStore.instanceCount = 0;
		
		var MyComponent1 = (function (_super) {
			__extends(Component1, _super);
			function Component1(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component1.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component1;
		}(Reflux.Component));
		
		var MyComponent2 = (function (_super) {
			__extends(Component2, _super);
			function Component2(props) {
				_super.call(this, props);
				this.state = {};
				this.store = MyStore;
			}
			Component2.prototype.render = function () {
				return React.createElement("p", null, this.state.foo);
			};
			return Component2;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement('div', null, React.createElement(MyComponent1, null), React.createElement(MyComponent2, null)) );
		
		assert.equal( result, '<div><p>bar</p><p>bar</p></div>' );
		assert.equal( MyStore.instanceCount, 1 );
	});
});
