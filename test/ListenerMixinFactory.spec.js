var assert = require('chai').assert,
    Reflux = require('../src');

describe('Using the ListenerMixinFactory shorthand',function(){
    var store = "I AM A STORE",
        callback = "I AM A CALLBACK";
    describe("when calling the factory",function(){
        var component = Object.create(Reflux.ListenerMixinFactory(store,callback));
        it("should include listenermixin",function(){
            assert.isFunction(component.listenTo);
            assert.isFunction(component.componentWillUnmount);
            assert.equal(component.listenTo,Reflux.ListenerMixin.listenTo);
            assert.equal(component.componentWillUnmount,Reflux.ListenerMixin.componentWillUnmount);
        });
        it("should add componentDidMount method",function(){
            assert.isFunction(component.componentDidMount);
        });
    });
    describe("when calling the added componentDidMount",function(){
        it("should call listenTo correctly from componentDidMount",function(){
            var component = Object.create(Reflux.ListenerMixinFactory(store,callback)), args;
            component.listenTo = function(){args=arguments;};
            component.componentDidMount();
            assert.equal(args.length,2);
            assert.deepEqual([args[0],args[1]],[store,callback]);
        });
        it("should fetch method from 'this' if callback was a string",function(){
            var component = Object.create(Reflux.ListenerMixinFactory(store,"method")), args;
            component.method = callback;
            component.listenTo = function(){args=arguments;};
            component.componentDidMount();
            assert.equal(args[1],callback);
        });
    });
});
