var inherits = require('inherits'),
    _ = require('./utils');

function Namespace() {

    _.EventEmitter.call(this);

    this._actions = {};
}

inherits(Namespace, _.EventEmitter);

Namespace.prototype.add = function add(id) {
    this._actions[id] = true;
};

Namespace.prototype.contains = function contains(id) {
    return this._actions[id] === true;
};

module.exports = Namespace;
