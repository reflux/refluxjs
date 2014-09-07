var assert = require('chai').assert,
    Reflux = require('../src');

describe('the ListenTo shorthand',function(){
    var listenable = "I AM A LISTENABLE",
        callback = "I AM A CALLBACK",
        initial = "I AM A CALLBACK TOO";
    describe("when calling the factory",function(){
        var result = Reflux.ListenTo(listenable,callback,initial);
        it("should return object with componentDidMount method",function(){
            assert.equal(Object.keys(result).length,1);
            assert.isFunction(result.componentDidMount);
        });
    });
    describe("when calling the added componentDidMount",function(){
        it("should call listenTo correctly",function(){
            var component = Object.create(Reflux.ListenTo(listenable,callback,initial)), args;
            component.listenTo = function(){args=arguments;};
            component.componentDidMount();
            assert.equal(args.length,3);
            assert.deepEqual([args[0],args[1],args[2]],[listenable,callback,initial]);
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
