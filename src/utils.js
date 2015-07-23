exports.capitalize = function(string){
    return string.charAt(0).toUpperCase()+string.slice(1);
};

exports.callbackName = function(string, prefix){
    prefix = prefix || "on";
    return prefix + exports.capitalize(string);
};

var env = exports.environment = {};

function checkEnv(target) {
    var flag = false;
    try {
        if (eval(target)) { // jshint ignore:line
            flag = true;
        }
    }
    catch (e) {
        /* no-op */
    }
    env[exports.callbackName(target, "has")] = flag;
}
checkEnv("setImmediate");
checkEnv("Promise");

/*
 * isObject, extend, isFunction, isArguments are taken from undescore/lodash in
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
            if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(source, prop);
                Object.defineProperty(obj, prop, propertyDescriptor);
            } else {
                obj[prop] = source[prop];
            }
        }
    }
    return obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.EventEmitter = require('eventemitter3');

if (env.hasSetImmediate) {
    exports.nextTick = function(callback) {
        setImmediate(callback);
    };
} else {
    exports.nextTick = function(callback) {
        setTimeout(callback, 0);
    };
}

exports.object = function(keys,vals){
    var o={}, i=0;
    for(;i < keys.length; i++){
        o[keys[i]] = vals[i];
    }
    return o;
};

if (env.hasPromise) {
    exports.Promise = Promise;
    exports.createPromise = function(resolver) {
        return new exports.Promise(resolver);
    };
} else {
    exports.Promise = null;
    exports.createPromise = function() {};
}

exports.isArguments = function(value) {
    return typeof value === 'object' && ('callee' in value) && typeof value.length === 'number';
};

exports.throwIf = function(val,msg){
    if (val){
        throw Error(msg||val);
    }
};
