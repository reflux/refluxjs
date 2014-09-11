var chai = require('chai'),
    assert = chai.assert,
    _ = require('../src/utils');

describe("the utils object",function(){
    describe("the callbackName method",function(){
    	it("should correctly create a callback name",function(){
    		assert.equal(_.callbackName("anAction"),"onAnAction");
    	});
    });
});