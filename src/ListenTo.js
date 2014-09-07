var _ = require('./utils');

module.exports = function(listenable,callback,initial){
    var unsubscribe;
    return {
        componentDidMount: function() {
            unsubscribe = listenable.listen(this[callback]||callback,this);
            _.handleDefaultCallback(this, listenable, this[initial]||initial);
        },
        componentWillUnmount: function() {
            if (unsubscribe) {
                unsubscribe();
            }
        }
    };
};