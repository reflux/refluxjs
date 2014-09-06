var _ = require('./utils'),
    ListenerMixin = require('./ListenerMixin');

module.exports = function(store,callback){
    return _.extend({
        componentDidMount: function(){
            this.listenTo(store,this[callback]||callback);
        }
    },ListenerMixin);
};