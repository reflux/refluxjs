

NOTE: this one really is only about 10% done so far, don't judge...


#### Manually Mapping States

In addition to the more declarative ways to merge store state into a component that are described above (i.e. `this.store`, `this.stores`, `this.storeKeys`) there is another more imperative style for merging state. That is the `Reflux.mapStoreToState` method that is part of Reflux stores.

An important thing to note is that this is completely separate from the previously mentioned declarative side of things (such as `this.store`). You should not have the same store attached to a component both via `this.store` and using `this.mapStoreToState`. This method is also completely unaffected by this.storeKeys. These differing methods can both be used within a single component, they just shouldn't be both used for the same store within the same component.

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









#### Extending a 3rd Party Class

Sometimes 3rd party libraries will have their own class that extends `React.Component` that they require you to use. Reflux handles this by exposing the `Reflux.Component.extend` method. If you have such a 3rd party class you can pass that class to this method and it will return a version of `Reflux.Component` that extends it instead of extending `React.Component` directly. Example:

import {ThirdPartyComponent} from 'third-party';

var RefluxThirdPartyComponent = Reflux.Component.extend(ThirdPartyComponent);

class MyComponent extends RefluxThirdPartyComponent
{
    // ...
}






