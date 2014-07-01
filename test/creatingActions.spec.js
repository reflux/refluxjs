var assert = require('chai').assert,
    Reflux = require('../src');

describe('Creating action', function() {

    var action;

    beforeEach(function () {
        action = Reflux.createAction();
    });

    it('should be a callable functor', function() {
        assert.isFunction(action);
    });

});