var Reflux = require('../src'),
    _ = require('./utils');

module.exports = function(listenable,key){
    return {
        componentDidMount: function(){
            for(var m in Reflux.listenerMethods){
                if (this[m] !== Reflux.listenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.listenerMethods[m];
                }
            }
            var me = this, cb = (key ? function(v){me.setState(_.object([key],[v]));} : this.setState);
            this.listenTo(listenable,cb,cb);
        },
        componentWillUnmount: Reflux.listenerMixin.componentWillUnmount
    };
};