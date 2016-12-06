
# Reflux.Component Documentation

## Overview 

Of course, a main point of [actions](../actions/README.md) and [stores](../stores/README.md) is to eventually tie the data being stored/manipulated in them into a React component.

For that Reflux gives you `Reflux.Component`. `Reflux.Component` is itself an extension of `React.Component` that was created to facilitate hooking stores into the component. You would use a `Reflux.Component` the exact same as a `React.Component`, except that you'd use its specific properties and methods to hook in the state of your stores.

### Mixing State with `this.store` and `this.stores`

The main declarative way to utilize one or more stores within a `Reflux.Component` is `this.store` (assign one store) or `this.stores` (assign an Array of stores).

```javascript
class Counter extends Reflux.Component // <-- note Reflux.Component, not React.Component
{
	constructor(props)
	{
		super(props);
		this.store = CountStore; // <-- a store w/state with a `count` property
	}
	
	render()
	{
		// since CountStore has a state.count, now this component shares it
		return <div>Count: {this.state.count}</div>
	}
}
```

The `count` property from the store is mixed into the component's state. It acts just like a normal part of the state within the component. As `setState` is used to change the value within the store the state within the component is updated and the component is re-rendered, `shouldComponentUpdate` works as normal, etc.

Note that you assign the class itself. Reflux will automatically either A) make a singleton instance of it, or B) use a preexisting singleton if one already has been made. It is possible to assign an instance created from a `Reflux.Store` class, however it is practically always preferrable to simply assign the class itself so that Reflux can manage the singleton properly.

Normal state properties are also preserved. You may use state from the component itself and state from one or more stores side-by-side:

```javascript
class Counter extends Reflux.Component
{
	constructor(props)
	{
		super(props);
		this.stores = [CountStore, MultiplierStore];
		this.state = {offset: 5};
	}
	
	render()
	{
		// the state props come from the CounterStore, MultiplierStore, and normal state
		var calculatedValue = this.state.count * this.state.multiplier + this.state.offset;
		return <div>Count: {calculatedValue}</div>
	}
}
```

### Limiting Mixing with `this.storeKeys`

By default, the entire store is mixed into your component. However, it is very useful to be able to easily bring in only part of the store. This prevents A) unintended name conflicts, such as a store state property added after-the-fact overwriting a piece of normal in-component state accidentally, and B) unneeded rendering, since some components may only need certain parts of the store and therefore do not need to re-render every time other properties update.

This is what `this.storeKeys` is for. It allows you to assign an Array of strings, and only property key names from that Array will be taken from any stores mixed in via `this.store` or `this.stores`.

```javascript
class Counter extends Reflux.Component
{
	constructor(props)
	{
		super(props);
		this.store = CountStore;
		this.storeKeys = ['count']; // <-- only `count` will be mixed in from the store
	}
	
	render()
	{
		return <div>Count: {this.state.count}</div>
	}
}
```

### Manually Mapping States with `this.mapStoreToState`

In addition to the more declarative ways to merge store state into a component that are described above (i.e. `this.store`, `this.stores`, `this.storeKeys`) there is another more imperative style for merging state. That is the `Reflux.mapStoreToState` method that is part of Reflux stores.

An important thing to note is that this is completely separate from the previously mentioned declarative side of things (such as `this.store`). You should not have the same store attached to a component both via `this.store` and using `this.mapStoreToState`. This method is also completely unaffected by this.storeKeys. These differing methods can both be used within a single component, but just shouldn't both be used for the same store within the same component.

`this.mapStoreToState` takes 2 arguments: the store you want mapped to the component state, and a mapping function supplied by you. The mapping function will be called any time the store's `this.setState` is used to change the state of the store. The mapping function takes an argument which will be the state change object from the store for that particular change. It needs to return an object which will then be mapped to the component state (similar to if that very returned object were used in the component's `this.setState`). If an object with no properties is returned then the component will not re-render. The mapping function is also called with its `this` keyword representing the component, so comparing store values to current component state values via `this.state` is possible as well.

```javascript
class MyComponent extends Reflux.Component
{
	constructor(props)
	{
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
	
	render()
	{
		return <p className={this.state.class}>The color is: {this.state.color}</p>;
	}
}
```

Note that the `fromStore` in the example above may not always be the full state from the store. It only receives what is actually changing at that time. This way you are able to only map the parts of the store that have actually changed on each call.

### Extending a 3rd Party Class with `Reflux.Component.extend`

Sometimes 3rd party libraries will have their own class that extends `React.Component` that they require you to use. Reflux handles this by exposing the `Reflux.Component.extend` method. If you have such a 3rd party class you can pass that class to this method and it will return a version of `Reflux.Component` that extends it instead of extending `React.Component` directly. Example:

```javascript
import {ThirdPartyComponent} from 'third-party';

var RefluxThirdPartyComponent = Reflux.Component.extend(ThirdPartyComponent);

class MyComponent extends RefluxThirdPartyComponent
{
    // ...
}
```

### More:

Learn about [Reflux Stores](../stores/) and [Actions](../actions/), or go back to the overview of the [docs](../).
