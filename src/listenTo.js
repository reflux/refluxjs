var Reflux = require('../src');

module.exports = function(listenable,callback,initial){
    return {
        componentDidMount: function() {
            if (!this.subscriptions){
                this.subscriptions = [];
            }
            for(var m in Reflux.listenerMethods){
                if (this[m] !== Reflux.listenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.listenerMethods[m];
                }
            }
            this.listenTo(listenable,this[callback]||callback,initial);
        },
        componentWillUnmount: Reflux.ListenerMixin.componentWillUnmount
    };
};
