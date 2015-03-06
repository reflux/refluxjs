var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    utils = require('../src/utils');

var MockPromise = function(resolver) {
    this.catches = [];
    this.thens = [];

    resolver(function resolve() {}, function reject() {});

    return this;
};

MockPromise.prototype.catch = function(callback) {
    this.catches.push(callback);

    return this;
};

MockPromise.prototype.then = function(callback) {
    this.thens.push(callback);

    return this;
};


var MockFactory = function(resolver) {
    return new MockPromise(resolver);
};

describe('Export internal Promise', function() {
    it('should be the original', function() {
        assert.equal(utils.Promise, Reflux.Promise);
    });
});

describe('Switching Promise constructor', function() {
    var original;

    beforeEach(function() {
        original = utils.Promise;
        Reflux.setPromise(MockPromise);
    });

    afterEach(function() {
        Reflux.setPromise(original);
    });

    it('should not be the original', function() {
        assert.notEqual(original, utils.Promise);
        assert.notEqual(original, Reflux.Promise);
    });

    it('should have the same interface', function() {
        var promise = new utils.Promise(function() {});

        assert.property(promise, 'catch');
        assert.property(promise, 'then');
    });
});

describe('Switching Promise factory', function() {
    var original;

    beforeEach(function() {
        original = utils.createPromise;

        Reflux.setPromiseFactory(MockFactory);
    });

    afterEach(function() {
        Reflux.setPromiseFactory(original);
    });

    it('should not be the original', function() {
        assert.notEqual(original, utils.createPromise);
    });

    it('should create a mock promise', function() {
        var promise = utils.createPromise(function() {});

        assert(promise instanceof MockPromise);
    });
});
