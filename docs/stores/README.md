
# Reflux Store Documentation

## Overview 

Stores hold data and receive action calls to update and change that data. They then can be hooked into components so that those components' states reflect that data and update along with it.

One important concept to understand about stores in Reflux is that you (usually) just define them, not create them. The concept is similar to components in React: you define the class and use them in your JSX, but React itself handles instantiating them. Similarly for Reflux stores: you define a store class and assign that class to components. Then, while mounting, those components will either instantiate a singleton of the class (if it hasn't been done yet) or use the existing singleton (if it has been made yet). That singleton is assigned to the static property `singleton` on the class itself (so, for example, a class `MyStore` would end up with `MyStore.singleton` being the reference to the instance once it was created).

### Defining Stores

To define a store in Reflux you need to make a class that extends `Reflux.Store`. That store will store its state on a `this.state` property, and mutate its state via `this.setState()` in a way that is extremely similar to React classes themselves. So there's basically no learning curve on that front.

You can then listen for actions and can update your store's state on them. For that the most basic way to listen is with `this.listenTo(action, callback)`:

```javascript
var increment = Reflux.createAction();

class MyStore extends Reflux.Store
{
	constructor()
	{
		super();
		this.state = {count: 0};
		this.listenTo(increment, this.incrementItUp);
	}
	
	incrementItUp()
	{
		var newCount = this.state.count + 1;
		this.setState({count: newCount});
	}
}
```

### Listening Shortcuts

In many cases there are quite a few actions at once, and writing out `this.listenTo(...)` for each of them would be wasteful and less easily edited/maintained. Therefore there are two shortcuts: a method `this.listenToMany()` and a property `this.listenables`. These are both designed to take an object where each property value is an action and the property name is the function name that that is going to be the callback that's used when that action is called.

By design, that is exactly the type of object returned when using the `Reflux.createActions()` shortcut for making multiple actions at once. So that method becomes extremely useful when used in concert with these listening shortcuts:

```javascript
var Actions = Reflux.createActions(['increment', 'decrement', 'changeBy']);

class MyStore extends Reflux.Store
{
	constructor()
	{
		super();
		this.state = {count: 0};
		this.listenToMany(Actions);
		//this.listenables = Actions; // <- would work equally well
	}
	
	increment()
	{
		var newCount = this.state.count + 1;
		this.setState({count: newCount});
	}
	
	decrement()
	{
		var newCount = this.state.count - 1;
		this.setState({count: newCount});
	}
	
	changeBy(amount)
	{
		var newCount = this.state.count + amount;
		this.setState({count: newCount});
	}
}
```

This next example also shows two other features. First: `this.listenables` also can be used with an Array of such action object. Second: you may also used the camelcased `onActionName` to define functions in this manner:

```javascript
var RelativeChanges = Reflux.createActions(['increment', 'decrement', 'changeBy']);
var AbsoluteChanges = Reflux.createActions(['zero', 'setTo']);

class MyStore extends Reflux.Store
{
	constructor()
	{
		super();
		this.state = {count: 0};
		this.listenables = [RelativeChanges, AbsoluteChanges];
	}
	
	onIncrement()
	{
		var newCount = this.state.count + 1;
		this.setState({count: newCount});
	}
	
	onDecrement()
	{
		var newCount = this.state.count - 1;
		this.setState({count: newCount});
	}
	
	onChangeBy(amount)
	{
		var newCount = this.state.count + amount;
		this.setState({count: newCount});
	}
	
	onZero()
	{
		this.setState({count: 0});
	}
	
	onSetTo(value)
	{
		this.setState({count: value});
	}
}
```

### Global State

A great feature about Reflux stores is that Reflux is capable of keeping a global state object of all of them that can be read and manipulated. This is perfect for setting up a certain state for testing, or for storing the state of a running program for later, outputting full program state at the time of an error, state-based time travel to go back to a previously stored state, etc. And even better: it's optional on a store-by-store basis. To opt in to storing the contents of a given store globally all you need to do is give the store's class a static `id` property, like so:

```javascript
class MyStore extends Reflux.Store
{
	constructor()
	{
		super();
		this.state = {count: 0};
	}
}

MyStore.id = 'mystore';
```

Now that object's data will be stored on an object `Reflux.GlobalState` under the property `mystore` (the id value), and updated as the store updates. So in this case, once the store was actually created, `Reflux.GlobalState.mystore.count` would be `0`.

However, `Reflux.GlobalState` itself is just the reference to the simple object of data. Accessing it is great for grabbing quick reads of current state, but we need more than that for global state to be truly useful. For example, as a simple object you can't just mutate data on it and expect it to actually change the store in question's data. And if you grab a non-primitive from it (like `Reflux.GlobalState.mystore`) its properties will continue to mutate (so you can't just grab state from it to go back to later).

Because of that we have 2 methods designed for use with global state: `Reflux.getGlobalState()` and `Reflux.setGlobalState()`.

`Reflux.getGlobalState()` will return a deep clone of the current global state. Since it is a clone it will not continue to mutate as the global state continues to mutate. This means you can grab references to the global state now so that you can use them later. In our above example it would return an object `{mystore:{count:0}}`.

`Reflux.setGlobalState(obj)` will set the global state to the argument provided. Not only that, but it will update the stores affected to reflect those changes. And not only that, but the object you provide does not need to be a full representation of all data the global state may store. The method will mix in just the data you provided for just the store id's you provide data for. This way you can reset parts of your global state without needing to know anything about the rest of it.

Another important feature is that when stores are created they check the global state for data relevant to them. If they have an id and the global state already has some state data they will integrate that into their default state from creation. In this way you can set your programs to a specific state right from startup if you wish.

### Reflux.initStore()

In normal usage Reflux stores are created as singletons by Reflux once needed. However, there are valid cases where one would need to create a store before then. However, it's a little more complex than just calling `new MyStoreClass()`, because of the need for them to operate as singletons (and also because, on stores with id's, there needs to be some other setup upon creation of that singleton in order to integrate them into the global state). For this reason Reflux exposes `Reflux.initStore`, used as follows:

`var storeSingleton = Reflux.initStore(MyStoreClass);`

This function will: create the singleton of the store and assign it properly if needed (or, just as importantly, **not** create a new instance if a singleton already exists), do whatever stuff needs to happen behind the scenes if it has an id and should be part of global state, and last but not least return the instance of the store (whether old or new) to you.

### Next:

Next learn about [hooking stores to components](../components/).
