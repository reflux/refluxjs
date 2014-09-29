var Reflux = require('../src'),
    _ = require('./utils');

module.exports = function(listenable,key){
    return {
        componentDidMount: function(){
            for(var m in Reflux.ListenerMethods){
                if (this[m] !== Reflux.ListenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.ListenerMethods[m];
                }
            }
            var me = this, cb = (key === undefined ? this.setState : function(v){me.setState(_.object([key],[v]));});
            this.listenTo(listenable,cb,cb);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};
