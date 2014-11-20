var Reflux = require('../src'),
    _ = require('./utils');

module.exports = function(listenable,key){
    return {
        componentDidMount: function(){
            var warned = false;
            for(var m in Reflux.ListenerMethods){
                if (this[m] && typeof console && typeof console.warn === "function" && !warned ){
                    console.warn(
                        "Component using Reflux.connect already had property '"+m+"'. "+
                        "Either you had your own property with that name which was now overridden, "+
                        "or you combined connect with ListenerMixin which is unnecessary as connect "+
                        "will include the ListenerMixin methods automatically."
                    );
                    warned = true;
                }
                this[m] = Reflux.ListenerMethods[m];
            }
            var me = this, cb = (key === undefined ? this.setState : function(v){me.setState(_.object([key],[v]));});
            this.listenTo(listenable,cb,cb);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};
