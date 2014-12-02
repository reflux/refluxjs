var _ = require('./utils');

module.exports = function mix(def) {
    var composed = {
        init: [],
        preEmit: [],
        shouldEmit: []
    };

    var updated = (function mixDef(mixin) {
        if (mixin.mixins) {
            mixin.mixins.forEach(function (mixin) {
                mixDef(mixin);
            });
        }
        Object.keys(composed).forEach(function (composable) {
            if (mixin.hasOwnProperty(composable)) {
                composed[composable].push(mixin[composable]);
            }
        });
        def = _.merge({}, mixin, def);
        return def;
    }(def));

    if (composed.init.length) {
        updated.init = function () {
            var args = arguments;
            composed.init.forEach(function (init) {
                init.apply(this, args);
            }, this);
        };
    }
    if (composed.preEmit.length) {
        updated.preEmit = function () {
            return composed.preEmit.reduce(function (args, preEmit) {
                return preEmit.apply(this, args) || args;
            }, arguments, this);
        };
    }
    if (composed.shouldEmit.length) {
        updated.shouldEmit = function () {
            var args = arguments;
            return composed.shouldEmit.some(function (shouldEmit) {
                return shouldEmit.apply(this, args);
            }, this);
        };
    }

    return updated;
};
