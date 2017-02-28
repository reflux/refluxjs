
var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src');

chai.use(require('chai-as-promised'));
	
var React = require('react');
var ReactDOMServer = require('react-dom/server');

Reflux.defineReact(React);


describe('Creating ES6 style stores', function()
{
	it('should allow defining of React with Reflux.defineReact without error', function()
	{
		Reflux.defineReact(React);
		
		return true;
	});
	
	it('should construct with a default empty state object', function()
	{
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
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
			Reflux.utils.inherits(Store, _super);
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
		
		return assert.equal(store.state.count, 2);
	});
	
	it('should accept listenables with \'action\' and \'onAction\' callbacks', function()
	{	
		var Actions = Reflux.createActions(['up', 'down', 'finish']);
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
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
		
		return assert.equal(store.state.count, 2);
	});
	
	it('should be able to modify state with setState', function()
	{	
		var Actions = Reflux.createActions(['up', 'down', 'finish']);
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
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
		
		return assert.equal(store.state.count, 2);
	});
	
	it('should accept actions with arguments', function()
	{	
		var Actions = Reflux.createActions(['up', 'down', 'finish']);
		
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
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
		
		return assert.equal(store.state.count, 1);
	});
	
	it('should mix state in with a Reflux.Component instance', function()
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
	});
	
	it('should use singleton instance when applied to multiple components', function()
	{
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar'};
				MyStore.instanceCount++;
			}
			return Store;
		}(Reflux.Store));
		
		MyStore.instanceCount = 0;
		
		var MyComponent1 = (function (_super) {
			Reflux.utils.inherits(Component1, _super);
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
			Reflux.utils.inherits(Component2, _super);
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
	
	it('should mix state in with a Reflux.Component instance via mapStoreToState', function()
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
				this.mapStoreToState(MyStore, function(fromStore){
					return {foobar:fromStore.foo};
				});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foobar);
			};
			return Component;
		}(Reflux.Component));
		
		var result = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent, null) );
		
		assert.equal( result, '<p>bar</p>' );
	});
	
	it('should mix state separately with two Reflux.Component instances via mapStoreToState', function()
	{
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar', bar:'foo'};
			}
			return Store;
		}(Reflux.Store));
		
		var MyComponent1 = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {foo:'?'};
				this.mapStoreToState(MyStore, function(fromStore){
					return {bar:fromStore.bar};
				});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.bar+this.state.foo);
			};
			return Component;
		}(Reflux.Component));
		
		var MyComponent2 = (function (_super) {
			Reflux.utils.inherits(Component, _super);
			function Component(props) {
				_super.call(this, props);
				this.state = {bar:'?'};
				this.mapStoreToState(MyStore, function(fromStore){
					return {foo:fromStore.foo};
				});
			}
			Component.prototype.render = function () {
				return React.createElement("p", null, this.state.foo+this.state.bar);
			};
			return Component;
		}(Reflux.Component));
		
		var result1 = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent1, null) );
		var result2 = ReactDOMServer.renderToStaticMarkup( React.createElement(MyComponent2, null) );
		
		assert.equal( result1, '<p>foo?</p>' );
		assert.equal( result2, '<p>bar?</p>' );
	});
	
	// this shortcut feature fails in IE9 and IE10, so removing the test for now, until the day that we can drop those 2 browsers
	/*it('should allow shortcut access to MyStore.singleton.state via MyStore.state', function()
	{
		var MyStore = (function (_super) {
			Reflux.utils.inherits(Store, _super);
			function Store() {
				_super.call(this);
				this.state = {foo:'bar', bar:'foo'};
			}
			return Store;
		}(Reflux.Store));
		
		Reflux.initStore(MyStore);
		
		assert.equal( MyStore.state.foo, MyStore.singleton.state.foo );
		assert.equal( MyStore.state.bar, MyStore.singleton.state.bar );
	});*/
});
