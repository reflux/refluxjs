/*
 * isObject, extend and isFunction are taken from undescore/lodash in 
 * order to remove the dependency
 */

var isObject = module.exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

module.exports.extend = function(obj) {
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

module.exports.isFunction = function(value) {
    return typeof value === 'function';
};

module.exports.EventEmitter = require('eventemitter3');