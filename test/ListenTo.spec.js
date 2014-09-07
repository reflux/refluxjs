var assert = require('chai').assert,
    Reflux = require('../src');

describe('the ListenTo shorthand',function(){
    var listenable = "I AM A LISTENABLE",
        callback = "I AM A CALLBACK";
    describe("when calling the factory",function(){
        var component = Object.create(Reflux.ListenTo(listenable,callback));
        it("should return object with componentDidMount method",function(){
            assert.equal(Object.keys(component).length,1);
            assert.isFunction(component.componentDidMount);
        });
    });
    describe("when calling the added componentDidMount",function(){
        it("should call listenTo correctly",function(){
            var component = Object.create(Reflux.ListenTo(listenable,callback)), args;
            component.listenTo = function(){args=arguments;};
            component.componentDidMount();
            assert.equal(args.length,2);
            assert.deepEqual([args[0],args[1]],[listenable,callback]);
        });
        it("should fetch method from 'this' if callback was a string",function(){
            var component = Object.create(Reflux.ListenTo(listenable,"method")), args;
            component.method = callback;
            component.listenTo = function(){args=arguments;};
            component.componentDidMount();
            assert.equal(args[1],callback);
        });
    });
});
