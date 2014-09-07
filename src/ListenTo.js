module.exports = function(store,callback,initial){
    return {
        componentDidMount: function(){
            this.listenTo(store,this[callback]||callback,initial);
        }
    };
};