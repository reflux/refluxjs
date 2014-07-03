# Reflux

A simple library for uni-directional dataflow architecture inspired by ReactJS [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html).

You can read an overview of Flux [here](http://facebook.github.io/react/docs/flux-overview.html), however the gist of it is to introduce a more functional programming style architecture by eschewing MVC like pattern and adopting a single data flow pattern. 

```
╔═════════╗       ╔════════╗       ╔═════════════════╗
║ Actions ║──────>║ Stores ║──────>║ View Components ║
╚═════════╝       ╚════════╝       ╚═════════════════╝
     ^                                      │
     └──────────────────────────────────────┘

```

The pattern is composed of actions and data stores, where actions initiate new data to pass through data stores before coming back to the view components again. If a view component has an event that needs to make a change in the application's data stores, they need to do so by signalling to the stores through the actions available.

The goal of the project is to get this architecture easily up and running in your web application, both client-side or server-side. There are some differences between how this project works and how Facebook's proposed Flux architecture works:

* Instead of a singleton dispatcher, every action is a dispatcher by themselves
* No more type checking with strings, just let the stores listen to actions and don't worry!
* Data stores are also dispatchers and stores may listen for changes on other stores

## Installation

You can currently install the package as a npm package or bower.

### NPM

The following command installs reflux as an npm package:

    npm install reflux

### Bower

The following command installs reflux as a bower component that can be used in the browser:

    bower install reflux

It will also download lodash as a dependency.

## Usage

For a full example check the [`test/index.js`](test/index.js) file.

### Creating actions

Create an action by calling `Reflux.createAction`.

```javascript
var statusUpdate = Reflux.createAction();
```

It is as simple as that.

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

In the above example, whenever the action is called, the store's `output` callback will be called with whatever parameters was sent in the action. E.g. if the action is called as `statusUpdate(true)` then the flag argument in `output` function is `true`.

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

#### ReactJS example

Register your component to listen for changes in your data stores, preferably in the `componentDidMount` [lifecycle method](http://facebook.github.io/react/docs/component-specs.html) and unregister in the `componentWillUnmount`, like this:

```javascript
var Status = React.createClass({
    initialize: function() { },
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

### Listening to changes in other data stores (aggregate data stores)

A store may listen to another store's change, making it possible to safetly chain stores for aggregated data without affecting other parts of the application. A store may listen to other stores using the same `listenTo` function as with actions:

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


## License

This project is licensed under [BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause). Copyright (c) 2014, Mikael Brassman.

For more information about the license for this particular project [read the LICENSE.md file](LICENSE.md).