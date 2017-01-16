# RefluxJS

A simple library for unidirectional dataflow architecture inspired by ReactJS [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html).

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][npm-url]
[![Bower Version][bower-image]][bower-url]
[![Dependencies][dependencies-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Gratipay][gratipay-image]][gratipay-url]

[![Sauce Test Status](https://saucelabs.com/browser-matrix/refluxjs.svg)](https://saucelabs.com/u/refluxjs)

You can read an overview of Flux [here](https://facebook.github.io/flux/docs/overview.html), however the gist of it is to introduce a more functional programming style architecture by eschewing MVC like pattern and adopting a single data flow pattern.

```
╔═════════╗       ╔════════╗       ╔═════════════════╗
║ Actions ║──────>║ Stores ║──────>║ View Components ║
╚═════════╝       ╚════════╝       ╚═════════════════╝
     ^                                      │
     └──────────────────────────────────────┘

```

The pattern is composed of actions and data stores, where actions initiate new data to pass through data stores before coming back to the view components again. If a view component has an event that needs to make a change in the application's data stores, they need to do so by signaling to the stores through the actions available.

Feel free to open an issue on our [**discussion forum**](https://github.com/reflux/discuss) for **questions and general discussion**.  Here is a complete list of communication channels:

1. The [discussion forum](https://github.com/reflux/discuss)
2. [StackOverflow with the `refluxjs` tag](http://stackoverflow.com/questions/tagged/refluxjs)
3. `#flux` channel on Reactiflux Discord group. [Sign up here](https://discord.gg/0ZcbPKXt5bYedEbN) for an account.
4. [![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/spoike/refluxjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
5. [![Thinkful][thinkful-image]][thinkful-url]

Please use the [issue tracker](https://github.com/spoike/refluxjs/issues) only for bugs and feature requests.

If you don't want to use the React-specific API, or want to develop Reflux for your view engine framework of choice, have a look at [`reflux-core`](https://github.com/reflux/reflux-core).

## Content

- [Comparing RefluxJS with Facebook Flux](#comparing-refluxjs-with-facebook-flux)
- [Examples](#examples)
- [Extensions and Plugins](#extensions-and-plugins)
- [Installation](#installation)
- [Usage](#usage)
     - [Actions](#creating-actions)
     - [Stores](#creating-data-stores)
     - [Component](#react-component-example)
- [Advanced Usage](#advanced-usage)
- [React ES6 Usage](#react-es6-usage)
- [Colophon](#colophon)

## Comparing RefluxJS with Facebook Flux

The goal of the refluxjs project is to get this architecture easily up and running in your web application, both client-side or server-side. There are some differences between how this project works and how Facebook's proposed Flux architecture works:

You can read more in this [blog post about React Flux vs Reflux](http://spoike.ghost.io/deconstructing-reactjss-flux/).

### Similarities with Flux

Some concepts are still in Reflux in comparison with Flux:

* There are actions
* There are data stores
* The data flow is unidirectional

### Differences with Flux

Reflux has refactored Flux to be a bit more dynamic and be more Functional Reactive Programming (FRP) friendly:

* The singleton dispatcher is removed in favor for letting every action act as dispatcher instead.
* Because actions are listenable, the stores may listen to them. Stores don't need to have big switch statements that do static type checking (of action types) with strings
* Stores may listen to other stores, i.e. it is possible to create stores that can *aggregate data further*, similar to a map/reduce.
* `waitFor` is replaced in favor to handle *serial* and *parallel* data flows:
 * **Aggregate data stores** (mentioned above) may listen to other stores in *serial*
 * **Joins** for joining listeners in *parallel*
* *Action creators* are not needed because RefluxJS actions are functions that will pass on the payload they receive to anyone listening to them

[Back to top](#content)

## Examples

You can find some example projects at these locations:

* [Todo Example Project](https://github.com/spoike/refluxjs-todo)
* [Hacker News Clone](https://github.com/echenley/react-news) by echenley
* [Another Todo Project with a Python backend](https://github.com/limelights/todo-reflux) by limelights
* [Sample app with authentication, permissions, sidebar and editable collection](https://github.com/VladimirPal/react-flux-backbone)
* [TodoMVC demonstrating Reflux + Angular](https://github.com/javamonn/Angular-TodoMVC-Redux)
* [Sample blog by @akornatskyy](https://github.com/akornatskyy/sample-blog-react)

[Back to top](#content)

## Extensions and Plugins

* [Cartiv](https://github.com/yonatanmn/cartiv) - new reactive interface based on Reflux
* [reflux-promise](https://github.com/reflux/reflux-promise) - Extends reflux with Promises
* [reflux-triggerable-mixin](https://github.com/jesstelford/reflux-triggerable-mixin) - Stores mixin adding `triggerable` syntax similar to `listenable`
* [reflux-state-mixin](https://github.com/yonatanmn/reflux-state-mixin) - Stores mixin adding `state` syntax similar to React components.

## Installation

You can currently install the package as a npm package or bower component.

### NPM

The following command installs reflux as a npm package:

    npm install reflux

### Bower

The following command installs reflux as a bower component that can be used in the browser:

    bower install reflux
	
Then the files may be embedded in your html file via `bower_components/reflux/dist/reflux.js` or `bower_components/reflux/dist/reflux.min.js`.

### CDN

Reflux is available at [jsdelivr](http://www.jsdelivr.com/#!refluxjs).  
jsdelivr [v5.0.1](https://cdn.jsdelivr.net/refluxjs/5.0.1/reflux.min.js)

### ES5

Like React, Reflux depends on an es5-shim for older browsers. The es5-shim.js from [kriskowal's es5-shim](https://github.com/kriskowal/es5-shim) provides everything required.

[Back to top](#content)

## Usage

### Creating actions

Create an action by calling `Reflux.createAction` with an optional options object.

```javascript
var statusUpdate = Reflux.createAction(options);
```

An action is a [function object](http://en.wikipedia.org/wiki/Function_object) that can be invoked like any function.

```javascript
statusUpdate(data); // Invokes the action statusUpdate
statusUpdate.triggerAsync(data); // same effect as above
```

If `options.sync` is true, the functor will instead call `action.trigger` which is a synchronous operation. You can change `action.sync` during the lifetime of the action, and the following calls will honour that change.

There is also a convenience function for creating multiple actions.

```javascript
var Actions = Reflux.createActions([
    "statusUpdate",
    "statusEdited",
    "statusAdded"
  ]);

// Actions object now contains the actions
// with the names given in the array above
// that may be invoked as usual

Actions.statusUpdate();
```

#### Asynchronous actions

For actions that represent asynchronous operations (e.g. API calls), a few separate dataflows result from the operation. In the most typical case, we consider completion and failure of the operation. To create related actions for these dataflows, which you can then access as attributes, use `options.children`.

```javascript
// this creates 'load', 'load.completed' and 'load.failed'
var Actions = Reflux.createActions({
    "load": {children: ["completed","failed"]}
});

// when 'load' is triggered, call async operation and trigger related actions
Actions.load.listen( function() {
    // By default, the listener is bound to the action
    // so we can access child actions using 'this'
    someAsyncOperation()
        .then( this.completed )
        .catch( this.failed );
});
```

There is a shorthand to define the `completed` and `failed` actions in the typical case: `options.asyncResult`. The following are equivalent:

```javascript
createAction({
    children: ["progressed","completed","failed"]
});

createAction({
    asyncResult: true,
    children: ["progressed"]
});
```

#### Action hooks

There are a couple of hooks available for each action.

* `preEmit` - Is called before the action emits an event. It receives the arguments from the action invocation. If it returns something other than undefined, that will be used as arguments for `shouldEmit` and subsequent emission.

* `shouldEmit` - Is called after `preEmit` and before the action emits an event. By default it returns `true` which will let the action emit the event. You may override this if you need to check the arguments that the action receives and see if it needs to emit the event.

Example usage:

```javascript
Actions.statusUpdate.preEmit = function() { console.log(arguments); };
Actions.statusUpdate.shouldEmit = function(value) {
    return value > 0;
};

Actions.statusUpdate(0);
Actions.statusUpdate(1);
// Should output: 1
```

You can also set the hooks by sending them in a definition object as you create the action:

```javascript
var action = Reflux.createAction({
    preEmit: function(){...},
    shouldEmit: function(){...}
});
```

#### Reflux.ActionMethods

If you would like to have a common set of methods available to all actions you can extend the `Reflux.ActionMethods` object, which is mixed into the actions when they are created.

Example usage:

```javascript
Reflux.ActionMethods.exampleMethod = function() { console.log(arguments); };

Actions.statusUpdate.exampleMethod('arg1');
// Should output: 'arg1'
```

[Back to top](#content)

### Creating data stores

Create a data store much like ReactJS's own `React.createClass` by passing a definition object to `Reflux.createStore`. You may set up all action listeners in the `init` function and register them by calling the store's own `listenTo` function.

```javascript
// Creates a DataStore
var statusStore = Reflux.createStore({

    // Initial setup
    init: function() {

        // Register statusUpdate action
        this.listenTo(statusUpdate, this.output);
    },

    // Callback
    output: function(flag) {
        var status = flag ? 'ONLINE' : 'OFFLINE';

        // Pass on to listeners
        this.trigger(status);
    }

});
```

In the above example, whenever the action is called, the store's `output` callback will be called with whatever parameters were sent in the action. E.g. if the action is called as `statusUpdate(true)` then the flag argument in `output` function is `true`.

A data store is a publisher much like the actions, so they too have the `preEmit` and `shouldEmit` hooks.

#### Reflux.StoreMethods

If you would like to have a common set of methods available to all stores you can extend the `Reflux.StoreMethods` object, which is mixed into the stores when they are created.

Example usage:

```javascript
Reflux.StoreMethods.exampleMethod = function() { console.log(arguments); };

statusStore.exampleMethod('arg1');
// Should output: 'arg1'
```

#### Mixins in stores

Just as you can add mixins to React components, so it is possible to add your mixins to Store.

```javascript
var MyMixin = { foo: function() { console.log('bar!'); } }
var Store = Reflux.createStore({
    mixins: [MyMixin]
});
Store.foo(); // outputs "bar!" to console
```

Methods from mixins are available as well as the methods declared in the Store. So it's possible to access store's `this` from mixin, or methods of mixin from methods of store:

```javascript
var MyMixin = { mixinMethod: function() { console.log(this.foo); } }
var Store = Reflux.createStore({
    mixins: [MyMixin],
    foo: 'bar!',
    storeMethod: function() {
        this.mixinMethod(); // outputs "bar!" to console
    }
});
```

A nice feature of mixins is that if a store is using multiple mixins and several mixins define the same lifecycle method (e.g. `init`, `preEmit`, `shouldEmit`), all of the lifecycle methods are guaranteed to be called.

#### Listening to many actions at once

Since it is a very common pattern to listen to all actions from a `createActions` call in a store `init` call, the store has a `listenToMany` function that takes an object of listenables. Instead of doing this:

```javascript
var actions = Reflux.createActions(["fireBall","magicMissile"]);

var Store = Reflux.createStore({
    init: function() {
        this.listenTo(actions.fireBall,this.onFireBall);
        this.listenTo(actions.magicMissile,this.onMagicMissile);
    },
    onFireBall: function(){
        // whoooosh!
    },
    onMagicMissile: function(){
        // bzzzzapp!
    }
});
```

...you can do this:

```javascript
var actions = Reflux.createActions(["fireBall","magicMissile"]);

var Store = Reflux.createStore({
    init: function() {
        this.listenToMany(actions);
    },
    onFireBall: function(){
        // whoooosh!
    },
    onMagicMissile: function(){
        // bzzzzapp!
    }
});
```

This will add listeners to all actions `actionName` who have a corresponding `onActionName` (or `actionName` if you prefer) method in the store. Thus if the `actions` object should also have included an `iceShard` spell, that would simply be ignored.

#### The listenables shorthand

To make things more convenient still, if you give an object of actions to the `listenables` property of the store definition, that will be automatically passed to `listenToMany`. So the above example can be simplified even further:

```javascript
var actions = Reflux.createActions(["fireBall","magicMissile"]);

var Store = Reflux.createStore({
    listenables: actions,
    onFireBall: function(){
        // whoooosh!
    },
    onMagicMissile: function(){
        // bzzzzapp!
    }
});
```

The `listenables` property can also be an array of such objects, in which case all of them will be sent to `listenToMany`. This allows you to do convenient things like this:

```javascript
var Store = Reflux.createStore({
    listenables: [require('./darkspells'),require('./lightspells'),{healthChange:require('./healthstore')}],
    // rest redacted
});
```

#### Listenables and asynchronous actions

If `options.children` is set, as in the example below, you can use `onActionSubaction` to add a listener to the child action. For example:

```javascript
var Actions = Reflux.createActions({
    "load": {children: ["completed", "failed"]}
});

function handleLoad(Action, Subaction){
    console.log("The on" + Action + Subaction + " handler was called");
};

var Store = Reflux.createStore({
    listenables: Actions,
    onLoad: function() {
        handleLoad("Load");
    },
    onLoadCompleted: function() {
        handleLoad("Load", "Completed");
    },
    onLoadFailed: function() {
        handleLoad("Load", "Failed");
    }
});
```


### Listening to changes in data store

In your component, register to listen to changes in your data store like this:

```javascript
// Fairly simple view component that outputs to console
function ConsoleComponent() {

    // Registers a console logging callback to the statusStore updates
    statusStore.listen(function(status) {
        console.log('status: ', status);
    });
};

var consoleComponent = new ConsoleComponent();
```

Invoke actions as if they were functions:

```javascript
statusUpdate(true);
statusUpdate(false);
```

With the setup above this will output the following in the console:

```
status:  ONLINE
status:  OFFLINE
```

[Back to top](#content)

### React component example

Register your component to listen for changes in your data stores, preferably in the `componentDidMount` [lifecycle method](http://facebook.github.io/react/docs/component-specs.html) and unregister in the `componentWillUnmount`, like this:

```javascript
var Status = React.createClass({
    getInitialState: function() { },
    onStatusChange: function(status) {
        this.setState({
            currentStatus: status
        });
    },
    componentDidMount: function() {
        this.unsubscribe = statusStore.listen(this.onStatusChange);
    },
    componentWillUnmount: function() {
        this.unsubscribe();
    },
    render: function() {
        // render specifics
    }
});
```

It's also important to note that Reflux now supports [React ES6 style usage](#react-es6-usage) as well.

#### Convenience mixin for React

You always need to unsubscribe components from observed actions and stores upon
unmounting. To simplify this process you can use [mixins in React](http://facebook.github.io/react/docs/reusable-components.html#mixins). There is a convenience mixin available at `Reflux.ListenerMixin`. Using that, the above example can be written like thus:

```javascript
var Status = React.createClass({
    mixins: [Reflux.ListenerMixin],
    onStatusChange: function(status) {
        this.setState({
            currentStatus: status
        });
    },
    componentDidMount: function() {
        this.listenTo(statusStore, this.onStatusChange);
    },
    render: function() {
        // render specifics
    }
});
```

The mixin provides the `listenTo` method for the React component, that works much like the one found in the Reflux's stores, and handles the listeners during mount and unmount for you. You also get the same `listenToMany` method as the store has.


#### Using Reflux.listenTo

If you're not reliant on any special logic for the `this.listenTo` calls inside `componentDidMount`, you can instead use a call to `Reflux.listenTo` as a mixin. That will automatically set up the `componentDidMount` and the rest for you, as well as add the `ListenerMixin` functionality. With this our example above can be reduced even further:

```javascript
var Status = React.createClass({
    mixins: [Reflux.listenTo(statusStore,"onStatusChange")],
    onStatusChange: function(status) {
        this.setState({
            currentStatus: status
        });
    },
    render: function() {
        // render using `this.state.currentStatus`
    }
});
```

You can have multiple calls to `Reflux.listenTo` in the same `mixins` array.

There is also `Reflux.listenToMany` which works in exactly the same way, exposing `listener.listenToMany`.

#### Using Reflux.connect

If all you want to do is update the state of your component to whatever the data store transmits, you can use `Reflux.connect(listener,stateKey)` as a mixin. The state is updated via `this.setState({<stateKey>:data})`. Here's the example above changed to use this syntax:

```javascript
var Status = React.createClass({
    mixins: [Reflux.connect(statusStore,"currentStatus")],
    render: function() {
        // render using `this.state.currentStatus`
    }
});
```

The `Reflux.connect()` mixin will check the store for a `getInitialState` method. If found it will set the components `getInitialState`

```javascript
var statusStore = Reflux.createStore({
    getInitialState: function() {
        return "open";
    }
});

var Status = React.createClass({
    mixins: [Reflux.connect(statusStore,"currentStatus")],
    render: function() {
        // render using `this.state.currentStatus`
        // this.state.currentStatus === "open"
    }
});
```

#### Using Reflux.connectFilter

`Reflux.connectFilter` is used in a similar manner to `Reflux.connect`. Use the
`connectFilter` mixin when you want only a subset of the items in a store. A
blog written using Reflux would probably have a store with all posts in
it. For an individual post page, you could use `Reflux.connectFilter` to
filter the posts to the post that's being viewed.

```javascript
var PostView = React.createClass({
    mixins: [Reflux.connectFilter(postStore, "post", function(posts) {
        return posts.filter(function(post) {
           return post.id === this.props.id;
        }.bind(this))[0];
    })],
    render: function() {
        // render using `this.state.post`
    }
});
```

### Listening to changes in other data stores (aggregate data stores)

A store may listen to another store's change, making it possible to safely chain stores for aggregated data without affecting other parts of the application. A store may listen to other stores using the same `listenTo` function as with actions:

```javascript
// Creates a DataStore that listens to statusStore
var statusHistoryStore = Reflux.createStore({
    init: function() {

        // Register statusStore's changes
        this.listenTo(statusStore, this.output);

        this.history = [];
    },

    // Callback
    output: function(statusString) {
        this.history.push({
            date: new Date(),
            status: statusString
        });
        // Pass the data on to listeners
        this.trigger(this.history);
    }

});
```

[Back to top](#content)

## Advanced usage

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

[Back to top](#content)

## React ES6 Usage

### React ES6 component example

Reflux exposes `Reflux.Component` for class extension for easy creation of ES6 style React components that automatically has the state of one or more Reflux stores mixed into the React component state. In order to accomplish this you simply need use Reflux stores that start with a `state` property with an object holding the default state of the store's data (i.e. set `this.state = {my:"defaults"}` in the store's `init`) , then you need to set `this.store` (to 1 store) or `this.stores` (to an Array of stores) from within the constructor of the component. An example would look like this:

```javascript
class MyComponent extends Reflux.Component // <- Reflux.Component instead of React.Component
{
    constructor(props) {
        super(props);
        this.state = {foo:'bar'}; // <- stays usable, so normal state usage can still happen
        this.store = myStore; // <- the only thing needed to tie the store into this component
    }

    render() {
        // `storeProp` is mixed in from the store, and reflects in the component state
        return <p>From Store: {this.state.storeProp}, Foo: {this.state.foo}</p>;
    }
}
```

The default states of the stores will be mixed in from the start, and any time the store does a `trigger` the triggered data will be mixed in to the component and it will re-render.

A fully working example may look something like this:

```javascript
var Actions = Reflux.createActions(["increment"]);

var counterStore = Reflux.createStore(
{
    listenables: Actions,
    
    init: function() {
        this.state = {count:0};
    },
    
    onIncrement: function(txt) {
        this.state.count++;
        this.trigger(this.state);
    }
});

class Counter extends Reflux.Component
{
    constructor(props) {
        super(props);
        this.state = {};
        this.store = counterStore;
    }
    
    render() {
        return <p>Count: {this.state.count}</p>;
    }
}


ReactDOM.render(
    <Counter />,
    document.getElementById('container')
);

setInterval(Actions.increment, 1000);
```

NOTE: If you are also using `Reflux.Store` ES6 stores and updating them properly via their `setState` method then you may also choose to only mix in certain properties from the store(s) attached to a component, instead of all of them. To do this you may define `this.storeKeys` in the component's constructor and set it to an array of key names (strings) for properties you want mixed in from the attached stores. The component will then only mix in state object properties of those key names for any stores attached to it. If the store state is changed and none of the changed state involves the keys in `this.storeKeys` then the component will not change state at all nor re-render.

```javascript
//...
    constructor(props) {
        super(props);
        this.state = {};
        this.store = MyStore;
        this.storeKeys = ['color', 'height'];
        // ^ will only include the color and height parts of MyStore's state
    }
//...
```

### Using ES6 Reflux Stores via Reflux.Store

Stores do not directly integrate within React like `Reflux.Component` needs to, so using a more idiomatic way to declare them is not necessary. However, it can be very useful when using the `Reflux.Component` style components. Therefore whenever `Reflux.Component` is exposed Reflux also exposes `Reflux.Store` which can be extended to make a class that wraps and acts as a reflux store but with an approach that is easier to implement into `Reflux.Component` classes.

To create one looks something like this:

```javascript
class MyStore extends Reflux.Store
{
    constructor() {
        super();
        this.state = {foo:'bar'}; // <-- the store's default state
    }
}
```

These act much like a normal store. You can use `this.listenTo`, `this.listenToMany`, etc. from within the constructor, and you can define things like a `this.listenables` property and it will automatically call `action` and `onAction` named methods on the class. It also exposes a `setState` method that you can use to modify your `state` property and automatically `trigger` the change:

```javascript
var Actions = Reflux.createActions(["increment"]);

class CounterStore extends Reflux.Store
{
    constructor() {
        super();
        this.listenables = Actions;
        this.state = {count:0};
    }
    
    onIncrement() {
        var cnt = this.state.count;
        this.setState({count:cnt+1});
    }
}
```

`this.listenables` also accepts an array of actions in the event you want your store to listen to actions from other places as well:

```javascript
var Actions1 = Reflux.createActions(["increment"]);
var Actions2 = Reflux.createActions(["decrement"]);

class CounterStore extends Reflux.Store
{
    constructor() {
        super();
        this.listenables = [Actions1, Actions2];
        this.state = {count:0};
    }
    
    onIncrement() {
        var cnt = this.state.count;
        this.setState({count:cnt+1});
    }

    onDecrement() {
        var cnt = this.state.count;
        this.setState({count:cnt-1});
    }
}
```

One thing you may notice is that the original style `Reflux.createStore` creates an actual instance (as opposed to a class) which is what is assigned to `this.store` in the `Reflux.Component`. Extending `Reflux.Store` means you just have a class, not an instance of anything. Of course you can instantiate and use that store; however, if you just assign the class itself to `this.store` or `this.stores` in the `Reflux.Component` then it will automatically create a singleton instance of the store class (or use a previously created singleton instance of it if another component has already done so in its own construction). So, for example, to utilize the `Reflux.Store` store in the last example within a `Reflux.Component` class would look like this:

```javascript
class Counter extends Reflux.Component
{
    constructor(props) {
        super(props);
        this.state = {};
        this.store = CounterStore; // <- just assign the class itself
    }
    
    render() {
        return <p>Count: {this.state.count}</p>;
    }
}
```

**Note!** `Reflux.Store` still works with instances of stores (i.e. the class must get intantiated). Assigning the class itself to `this.store` just allows Reflux to handle the instantiation and do some internal things that allow features like global state tracking. it does *not* mean that the class itself is the store. Internally Reflux creates and utilizes a singleton instance of the class. After mounting you may access that singleton instance of the class via `MyStoreClass.singleton`.

#### Using Reflux.Store without a component

With to ability to do so much via global states (covered in the next section), and the fact that that functionality is tied to `Reflux.Store`, being able to properly utilize `Reflux.Store` on its own (without binding to a React component) becomes useful. However, just using `new MyStoreClass()` isn't enough, as it has to tie itself into the Reflux global state as a singleton. Therefore Reflux exposes an API for getting a properly globalized singleton instance of a `Reflux.Store` extended class without having to tie it to a React component. You do this via the following:

```javascript
var mySingleton = Reflux.initializeGlobalStore(MyClassName);
```

When done this way the singleton instance of your `Reflux.Store` class can, externally, be used much like a non-ES6 store created via `Reflux.createStore` except with the advantages that it: 1) is written in the `Reflux.Store` ES6 syntax and 2) it ties in with the global state being tracked by Reflux.

Note: your store _must_ be set up with an `id` to be used this way.

Note: even after instantiating with `Reflux.initializeGlobalStore` you can still later assign the class name itself to `this.store` or `this.stores` in a `Reflux.Component`. The component will recognize that a singleton for the class has already been created and use that singleton.

##### A deeper understanding:

To avoid confusion I want to better explain what `Reflux.initializeGlobalStore` is for on a deeper level. This is also a good section to read for people that just want a better understanding of working with `Reflux.Store` in general.

When you define a store in ES6 `Reflux.Store` syntax you are creating a class, not an instance of a class. For Reflux to use that store internally an instance of the class must be created. But it's also important that only **one** instance of that store class get created (i.e. a singleton) so that each component using it is using the same store instance. That is why you're told to assign the class itself to `this.store` or `this.stores` in a `Reflux.Component`. Assigning an instance works...but if you assign the class itself then it can use its own internal logic to say *"Is a singleton already made for this class? If yes, use that singleton. If not, then make it first, then use it."* therefore automatically making sure only one singleton instance is used everywhere. On top of that (if the class has an id) it also makes sure that the global state is aware of that store so that it can track it.

This works great as long as you're going to be using that store in a component. But what if you don't want to use it in any components?

If you don't care about the global state knowing about it and tracking it then it's easy. Since no components are using it then there's no chance of multiple store instances accidentally being created, so just use `var store = new MyStoreClass();` like any other class you'd be instantiating. If you wanted to be thorough and make your instance in the same singleton fashion as is done internally (just in case some later component decides to use that class without your knowledge) then you could go `var store = new MyStoreClass(); MyStoreClass.singleton = store;` and then any future component usage would know about, and use, that singleton instance.

But that still leaves a scenario out in the cold: needing to intantiate a store without it being attached to any components to handle it for you, but *also* wanting that store to be properly tracked by the global state. That is where `Reflux.initializeGlobalStore` can be used to create your singleton instance and handle what needs to be handled internally to track the global state. 

Another possible scenario would be if you need to access the singleton instance of the store *before* the `componentWillMount` part of any component's lifecycle (which is where the component would set up the singleton). You can use `Reflux.initializeGlobalStore` to create a singleton that you can access sooner. You can *still* assign the class itself to `this.store` or `this.stores` in any components though! The component will know that a singleton has already been created and automatically use it, there is no need for you to manually track the singleton for the components just because you used `Reflux.initializeGlobalStore` in order to get access to that singleton sooner!

#### Mapping Stores to Components with `mapStoreToState`

Reflux's ES6 stores and components work together fairly well in a very declarative syntax by simply assigning stores to components via the component's `this.store` and `this.stores` properties, and that functionality rounds itself out by adding some filtering ability with `this.storeKeys`. With enough thought given to architecture this can get you almost everything you need in a declarative syntax that is easy for you to write and others to read. Therefore it's highly suggested that you put the time into planning your architecture to be able to use those for connecting stores and components.

However, there still exists a need to have deeper control and to be able to map stores to component states with your own custom logic in some cases. For that each `Reflux.Component` will have a `this.mapStoreToState` method. This is **completely separate** from the previously mentioned declarative side of things (such as `this.store`). That means you should not have the same store attached to a component both via `this.store` *and* using `this.mapStoreToState`, and also that this method is completely unaffected by `this.storeKeys`. These differing methods can both be used within a single component, they just shouldn't be both used for the *same store* within the same component.

This method takes 2 arguments: the `Reflux.Store` you want mapped to the component state (either the class itself or the singleton instance) and a mapping function supplied by you. The mapping function will be called any time the store instance's `setState` is used to change the state of the store. The mapping function takes an argument which will be the state change object from the store for that particular change. It needs to return an object which will then be mapped to the component state (similar to if that very returned object were used in the component's `setState`). If an object with no properties is returned then the component will *not* re-render. The mapping function is also called with its `this` keyword representing the component, so comparing store values to current component state values via `this.state` is possible as well.

```javascript
class Counter extends Reflux.Component
{
    constructor(props) {
        super(props);
        this.mapStoreToState(MyStoreClass, function(fromStore){
            var obj = {};
            if (fromStore.color)
                obj.color = fromStore.color;
            if (fromStore.data && fromStore.data.classToUse)
                obj.class = fromStore.data.classToUse;
            return obj;
        });
    }
    
    render() {
        return <p className={this.state.class}>The color is: {this.state.color}</p>;
    }
}
```

In the above example `MyStoreClass` could have lots of state properties, but we use a bit of logic to 1) only trigger a re-render if the store's `state.color` or `state.data.classToUse` were among the parts of the state involved in the store's `setState` call (because, remember, if the returned object has no properties no re-render happens), and 2) to map the stores `state.color` straight to the component's `state.color`, but the store's `state.data.classToUse` to the component's `state.class`.

Note that the example function above is merely that: an example. Whatever sort of logic you want to apply to get from the change object given by the store to how you want that to change the state of your component is fair game, except that you should not mutate the incoming data itself.

### Utilizing Reflux.GlobalState

Another neat feature that the ES6 implementation of Reflux has is the ability to track a global state of all stores in use, as well as initialize all stores in use to a predefined global state. It happens internally too, so you don't have to do hardly anything to make it happen. This would be useful for many things, including tracking the state of an application and going back to that same state the next time the app is used.

To make it happen you just have to use ES6 style reflux classes and stores like explained in the last couple sections and define a static `id` property in your `Reflux.Store` definition. That id will then be used as a property name within the `Reflux.GlobalState` object for the property holding that store's current state. Then you just need to make sure to use `setState` to modify the state of the `Reflux.Store` instead of mutating the state directly. After that the `Reflux.GlobalState` object will reflect a collection of all your stores at all times once the components using those stores are mounted. An example using the example above:

```javascript
class CounterStore extends Reflux.Store
{
    constructor() {
        super();
        this.listenables = Actions;
        this.state = {count:0};
    }
    
    onIncrement() {
        var cnt = this.state.count;
        this.setState({count:cnt+1});
    }
    
    static get id() {
        return 'counterstore';
    }
}

// ... make component and render as normal ...

console.log(Reflux.GlobalState); // <- would be: {'counterstore':{'count':0}}
```

Notice that you can only read the GlobalState **after** the components using the stores have been mounted. Up until then is the time where you can manually set the `Reflux.GlobalState` in order to initialize the entire app in a state of your choosing (or a previous state you recorded earlier). For example we could do this:

```javascript
class CounterStore extends Reflux.Store
{
    constructor() {
        super();
        this.listenables = Actions;
        this.state = {count:0};
    }
    
    onIncrement() {
        var cnt = this.state.count;
        this.setState({count:cnt+1});
    }
    
    static get id() {
        return 'counterstore';
    }
}

Reflux.GlobalState = {'counterstore':{'count':50}};

// ... make component and render as normal ...

// at this point it would render with a count of 50!
```

One of the most useful ways you could do this is to store a `Reflux.GlobalState` state as a JSON string in order to implement it again the next time the app starts up and have the user begin right where they left off.

#### Reflux.setGlobalState and Reflux.getGlobalState

Directly accessing `Reflux.GlobalState` is a fine way to do set the starting state of an app and to do automated testing, but it is also helpful to be able to manipulate the global state while the app is running as well. To do this Reflux exposes a `Reflux.getGlobalState()` function and a `Reflux.setGlobalState()` function. The former allows you to get a deep copy of the current global state (so that the copy will not mutate as the global state itself continues to mutate) and the latter allows you to set part or all of the global state at any time in the program. Between these two functions things like state time-travel, undo/redo, and move-by-move tracking become relatively easy.

### Making sure Reflux.Component is available

`Reflux.Component` extends `React.Component`. Therefore Reflux needs to be able to access React in order to expose it. In the browser as long as React is loaded before Reflux then Reflux will automatically find it. Likewise in node-like environments where `require('react')` will function Reflux will try to access React that way. So in almost all situations Reflux will find React on its own.

However, Reflux also exposes the method `Reflux.defineReact` that you can use to manually give Reflux a reference to the React object in case you need to:

```javascript
// only needed if, for some reason, Reflux can't get reference to React:
var React = /* however you access React */;
Reflux.defineReact(React);
// now Reflux.Component is accessible!
```

### Extending a 3rd Party Class

Sometimes 3rd party libraries will have their own class that extends `React.Component` that they require you to use. Reflux handles this by exposing the `Reflux.Component.extend` method. If you have such a 3rd party class you can pass that class to this method and it will return a version of `Reflux.Component` that extends it instead of extending `React.Component` directly. Example:

```javascript
import {ThirdPartyComponent} from 'third-party';

var RefluxThirdPartyComponent = Reflux.Component.extend(ThirdPartyComponent);

class MyComponent extends RefluxThirdPartyComponent
{
    // ...
}
```

[Back to top](#content)

## Colophon

[List of contributors](https://github.com/spoike/reflux/graphs/contributors) is available on Github.

This project is licensed under [BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause). Copyright (c) 2014, Mikael Brassman.

For more information about the license for this particular project [read the LICENSE.md file](LICENSE.md).

This project uses [eventemitter3](https://github.com/3rd-Eden/EventEmitter3), which [is currently MIT licensed](https://github.com/3rd-Eden/EventEmitter3/blob/master/LICENSE).

[npm-image]: http://img.shields.io/npm/v/reflux.svg
[downloads-image]: http://img.shields.io/npm/dm/reflux.svg
[dependencies-image]: http://img.shields.io/david/reflux/refluxjs.svg
[npm-url]: https://www.npmjs.org/package/reflux
[bower-image]: http://img.shields.io/bower/v/reflux.svg
[bower-url]: http://bower.io/search/?q=reflux
[travis-image]: http://img.shields.io/travis/reflux/refluxjs/master.svg
[travis-url]: https://travis-ci.org/reflux/refluxjs
[gratipay-image]: http://img.shields.io/gratipay/spoike.svg
[gratipay-url]: https://gratipay.com/spoike/
[thinkful-image]: https://tf-assets-staging.s3.amazonaws.com/badges/thinkful_repo_badge.svg
[thinkful-url]: http://start.thinkful.com/react/?utm_source=github&utm_medium=badge&utm_campaign=reflux
