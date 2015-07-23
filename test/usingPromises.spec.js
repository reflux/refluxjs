var chai = require('chai'),
    assert = chai.assert,
    Reflux = require('../src'),
    _ = require('../src/utils');

var utilsProps = {
    Promise: _.Promise,
    createPromise: _.createPromise,
    environment: _.environment
};

describe("when Promise exists in environment", function() {

    it("async action trigger should use promises", function() {
        var action = Reflux.createAction({sync: false});

        var returned = action(1);

        assert.property(returned, "then");
    });

});

describe("when Promise is missing in environment", function() {
    beforeEach(function () {
        _.environment = {
            hasPromise: false,
            Promise: null,
            createPromise: function() {}
        };
    });

    it("async action trigger should not use promises", function() {
        var action = Reflux.createAction({sync: false});

        var returned = action(1);

        assert.isUndefined(returned);
    });

    afterEach(function () {
        for (var prop in utilsProps) {
            _[prop] = utilsProps[prop];
        }
    });
});
