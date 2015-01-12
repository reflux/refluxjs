var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    utils = require('../src/utils');

var MockPromise = function(callback) {
    this.catches = [];
    this.thens = [];

    callback(function resolve() {}, function reject() {});
};

MockPromise.prototype.catch = function(callback) {
    this.catches.push(callback);

    return this;
};

MockPromise.prototype.then = function(callback) {
    this.thens.push(callback);

    return this;
};

describe('Switching Promise APIs', function() {
    var original;

    beforeEach(function() {
        original = utils.Promise;

        Reflux.setPromise(MockPromise);
    });

    it('should not be the original', function() {
        assert.notEqual(original, utils.Promise);
    });

    it('should have the same interface', function() {
        var promise = new utils.Promise(function() {});

        assert.property(promise, 'catch');
        assert.property(promise, 'then');
    });

});
