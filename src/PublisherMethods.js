var _ = require('./utils');

/**
 * A module of methods for object that you want to be able to listen to.
 * This module is consumed by `createStore` and `createAction`
 */
module.exports = {

    /**
     * Hook used by the publisher that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with. If this function returns something other than
     * undefined, that will be passed on as arguments for shouldEmit and
     * emission.
     */
    preEmit: function() {},

    /**
     * Hook used by the publisher after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit: function() { return true; },

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen: function(callback, bindContext) {
        bindContext = bindContext || this;
        var eventHandler = function(args) {
            callback.apply(bindContext, args);
        }, me = this;
        this.emitter.addListener(this.eventLabel, eventHandler);
        return function() {
            me.emitter.removeListener(me.eventLabel, eventHandler);
        };
    },

    /**
     * Attach handlers to promise that trigger the completed and failed
     * child publishers, if available.
     *
     * @param {Object} The promise to attach to
     */
    promise: function(promise) {
        var me = this;

        var canHandlePromise =
            this.children.indexOf('completed') >= 0 &&
            this.children.indexOf('failed') >= 0;

        if (!canHandlePromise){
            throw new Error('Publisher must have "completed" and "failed" child publishers');
        }

        promise.then(function(response) {
            return me.completed(response);
        });
        // IE compatibility - catch is a reserved word - without bracket notation source compilation will fail under IE
        promise["catch"](function(error) {
            return me.failed(error);
        });
    },

    /**
     * Subscribes the given callback for action triggered, which should
     * return a promise that in turn is passed to `this.promise`
     *
     * @param {Function} callback The callback to register as event handler
     */
    listenAndPromise: function(callback, bindContext) {
        var me = this;
        bindContext = bindContext || this;

        return this.listen(function() {

            if (!callback) {
                throw new Error('Expected a function returning a promise but got ' + callback);
            }

            var args = arguments,
                promise = callback.apply(bindContext, args);
            return me.promise.call(me, promise);
        }, bindContext);
    },

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    trigger: function() {
        var args = arguments,
            pre = this.preEmit.apply(this, args);
        args = pre === undefined ? args : _.isArguments(pre) ? pre : [].concat(pre);
        if (this.shouldEmit.apply(this, args)) {
            this.emitter.emit(this.eventLabel, args);
        }
    },

    /**
     * Tries to publish the event on the next tick
     */
    triggerAsync: function(){
        var args = arguments,me = this;
        _.nextTick(function() {
            me.trigger.apply(me, args);
        });
    },

    /**
     * Returns a Promise for the triggered action
     */
    triggerPromise: function(){
        var me = this;
        var args = arguments;
        var requestId = getRequestId();

        var canHandlePromise =
            this.children.indexOf('completed') >= 0 &&
            this.children.indexOf('failed') >= 0;

        if (!canHandlePromise){
            throw new Error('Publisher must have "completed" and "failed" child publishers');
        }


        // action.promise will be executed syncronously
        // from the listenAndPromise which does ajax fun
        // so, we'll monkey patch temporarily, and then 
        // restore previous function.
        var old_action_promise = me.promise;
        me.promise = function (promise) {
            // Inject our secret keys.
            promise.then(function (response) {
                response.__request__id = requestId;
                return response;
            });
            promise["catch"](function(error) {
                error.__request__id = requestId;
                return error;
            });
            // Back to your regularly scheduled programming.
            me.promise = old_action_promise;
            return me.promise.apply(this, arguments);
        };

        var promise = _.createPromise(function(resolve, reject) {
            var removeSuccess = me.completed.listen(function(args) {
                if (args && args.__request__id !== requestId) {
                    return;
                }
                delete args.__request__id;
                removeSuccess();
                removeFailed();
                resolve(args);
            });

            var removeFailed = me.failed.listen(function(args) {
                if (args && args.__request__id !== requestId) {
                    return;
                }
                delete args.__request__id;
                removeSuccess();
                removeFailed();
                reject(args);
            });

            me.triggerAsync.apply(me, args);
        });

        return promise;
    },
};

var requestId = 0;
function getRequestId () {
  if (requestId + 1 >= Number.MAX_VALUE) {
    requestId = 0;
  }
  return requestId++;
}
