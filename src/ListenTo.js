var Reflux = require('../src');

module.exports = function(store,callback){
    return {
        componentDidMount: function(){
            this.listenTo(store,this[callback]||callback);
        }
    };
};