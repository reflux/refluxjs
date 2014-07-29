var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    internalUtils = require('../src/utils');

chai.use(require('chai-as-promised'));

describe('Switching the used EventEmitter to Node\'s internal', function() {

    beforeEach(function () {
        // set to NodeJS's internal EventEmitter
        Reflux.setEventEmitter(require('events').EventEmitter);
    });

    afterEach(function () {
        // reset back to eventemitter3
        Reflux.setEventEmitter(require('eventemitter3'));
    });

    it('should have the same interface', function() {
        var ee = internalUtils.EventEmitter.prototype;
        assert.property(ee, 'addListener');
        assert.property(ee, 'removeListener');
        assert.property(ee, 'emit');
    });

});