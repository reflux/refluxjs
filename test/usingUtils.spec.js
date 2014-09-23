var chai = require('chai'),
    assert = chai.assert,
    _ = require('../src/utils');

describe("the utils object",function(){

    describe("the callbackName method",function(){

        it("should correctly create a callback name",function(){
            assert.equal(_.callbackName("anAction"),"onAnAction");
        });
    });

    describe("the isArguments method",function(){

        it("should correctly identify the arguments object",function(){
            assert.equal(true,_.isArguments(arguments));
        });

        it("should return false for anything that isn't the arguments object",function(){
            assert.equal(false,_.isArguments([1,2,3]));
            assert.equal(false,_.isArguments({length:0}));
        });
    });
});
