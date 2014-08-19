/*
 * isObject, extend and isFunction are taken from undescore/lodash in
 * order to remove the dependency
 */

var isObject = exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.extend = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

var isFunction = exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.EventEmitter = require('eventemitter3');
exports.nextTick = function(callback) {
    setTimeout(callback, 0);
};

exports.handleDefaultCallback = function (listener, listenable, defaultCallback) {
    if (defaultCallback && isFunction(defaultCallback)) {
        if (listenable.getDefaultData && isFunction(listenable.getDefaultData)) {
            data = listenable.getDefaultData();
            if (data && data.then && isFunction(data.then)) {
                data.then(defaultCallback.bind(listener));
            } else {
                defaultCallback.bind(listener)(data);
            }
        }
    }
};
