
# Advanced usage

### Switching EventEmitter

Don't like to use the EventEmitter provided? You can switch to another one, such as NodeJS's own like this:

```javascript
// Do this before creating actions or stores

Reflux.setEventEmitter(require('events').EventEmitter);
```

### Switching nextTick

Whenever action functors are called, they return immediately through the use of `setTimeout` (`nextTick` function) internally.

You may switch out for your favorite `setTimeout`, `nextTick`, `setImmediate`, et al implementation:

```javascript

// node.js env
Reflux.nextTick(process.nextTick);
```

For better alternative to `setTimeout`, you may opt to use the [`setImmediate` polyfill](https://github.com/YuzuJS/setImmediate), [`setImmediate2`](https://github.com/Katochimoto/setImmediate) or [`macrotask`](https://github.com/calvinmetcalf/macrotask).


### Joining parallel listeners with composed listenables

The Reflux API contains `join` methods that makes it easy to aggregate publishers that emit events in parallel. This corresponds to the `waitFor` method in Flux.

#### Argument tracking

A join is triggered once all participating publishers have emitted at least once. The callback will be called with the data from the various emissions, in the same order as the publishers were listed when the join was created.

There are four join methods, each representing a different strategy to track the emission data:

*    `joinLeading`: Only the first emission from each publisher is saved. Subsequent emissions by the same publisher before all others are finished are ignored.
*    `joinTrailing`: If a publisher triggers twice, the second emission overwrites the first.
*    `joinConcat`: An array of emission arguments are stored for each publisher.
*    `joinStrict`: An error is thrown if a publisher emits twice before the join is completed.

The method signatures all look like this:

```javascript
joinXyz(...publisher,callback)
```

Once a join is triggered it will reset, and thus it can trigger again when all publishers have emitted anew.

#### Using the listener instance methods

All objects using the listener API (stores, React components using `ListenerMixin`, or other components using the `ListenerMethods`) gain access to the four join instance methods, named after the argument strategy. Here's an example saving the last emission from each publisher:

```javascript
var gainHeroBadgeStore = Reflux.createStore({
    init: function() {
        this.joinTrailing(actions.disarmBomb, actions.saveHostage, actions.recoverData, this.triggerAsync);
    }
});

actions.disarmBomb("warehouse");
actions.recoverData("seedyletter");
actions.disarmBomb("docks");
actions.saveHostage("offices",3);
// `gainHeroBadgeStore` will now asynchronously trigger `[["docks"],["offices",3],["seedyletter"]]`.
```

#### Using the static methods

Since it is rather common to have a store where the only purpose is to listen to a join and trigger when the join is completed, the join methods have static counterparts on the `Reflux` object which return stores listening to the requested join. Using them, the store in the example above could instead be created like this:

```javascript
var gainHeroBadgeStore = Reflux.joinTrailing(actions.disarmBomb, actions.saveHostage, actions.recoverData);
```

### Sending initial state with the listenTo function

The `listenTo` function provided by the `Store` and the `ListenerMixin` has a third parameter that accepts a callback. This callback will be invoked when the listener is registered with whatever the `getInitialState` is returning.

```javascript
var exampleStore = Reflux.createStore({
    init: function() {},
    getInitialState: function() {
        return "the initial data";
    }
});

// Anything that will listen to the example store
this.listenTo(exampleStore, onChangeCallback, initialCallback)

// initialCallback will be invoked immediately with "the initial data" as first argument
```

Remember the `listenToMany` method? In case you use that with other stores, it supports `getInitialState`. That data is sent to the normal listening callback, or a `this.on<Listenablename>Default` method if that exists.

[Back to docs](../)
