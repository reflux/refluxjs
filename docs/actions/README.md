
# Reflux Action Documentation

## Overview 

Actions are a type of function that an Reflux store can listen for. They are similar to dispatching an event in that many stores can listen for a single action, but they are called like a simple function.

### Creating Actions

There are multiple ways to create actions in RefluxJS. The two main functions are `Reflux.createAction` (for making one) and `Reflux.createActions` (for making multiple actions at once).

`Reflux.createAction` takes an optional definition object as an argument and returns the action itself.

`Reflux.createActions` takes an array of definition objects. It returns an object where each created action is a property, and the property name is the action's name.

`Reflux.createActions` also has a shortcut available where you give it an object instead of an array. It builds actions for each object property and names those actions after the property name.

Simple usage for these looks like this:

```javascript
var singleAction = Reflux.createAction();
var ManyActions = Reflux.createActions(['action1', 'action2']);
var MoreActions = Reflux.createActions({anAction:{...}});

singleAction(); // calls the singleAction with no arguments
ManyActions.action1(); // calls one of the actions made within the ManyActions object
MoreActions.anAction(); // calls the action made within the MoreActions object
```

### Action Definitions

Action definitions are passed to the action creation functions (either directly to `createAction` or as an Array of them to `createActions`). As an example, a definition object may take the following format:

```javascript
{
	actionName: 'myActionName', // <- the name of the action
	children: ['childAction'], // <- Array of child action names for async operations
	asyncResult: true, // <- true to make a shortcut to adding 'completed' and 'failed' children
	sync: false, // <- set the action to emit synchronously or asynchronously (async by default)
	preEmit: function(){...}, // shortcut for setting preEmit method (covered later)
	shouldEmit: function(){...} // shortcut for setting shouldEmit method (covered later)
}
```

None of these are mandatory. You may create an action using `Reflux.createAction` without even providing a definition at all. And furthermore there are shortcuts for setting `actionName` as well. Some of these shortcuts were shown in the above "Creating Actions" section:

1. With either action creation function just setting a string as a definition is the equivalent of using `{actionName:'myString'}` in that place.
2. With `createActions` you can send an object instead of array and it will make one action for each property given using the property keys as the `actionName` for each definition provided.

Examples of both of these would be:

```javascript
// examples of #1 above
var action = Reflux.createAction('myName');
var Actions = Reflux.createActions(['myName1', 'myName2']);
// both are equivalent to (respectively):
var action = Reflux.createAction({actionName:'myName'});
var Actions = Reflux.createActions([{actionName:'myName1'}, {actionName:'myName2'}]);

// examples of #2 above
var Actions = Reflux.createActions({'myName1':{sync:false}});
// is equivalent to:
var Actions = Reflux.createActions([{actionName:'myName1', sync:false}]);
```

You will find throughout the RefluxJS documentation that the shorthand ways for creating actions with names are extremely common, as they tend to tie in well with other shorthand methods of doing things in Reflux.

### Async vs Sync Actions

As you've read, actions can simply be invoked via `myAction()`. But internally, if the action's `sync` is set to true then the action does `myAction.trigger()` and if not it does `myAction.triggerAsync()` (you may also call these manually). The important difference is that synchronous action calls must emit immediately. Asynchronous actions (which are default) emit on the next tick of the JS event loop, and may have things such as `children` child actions in their definitions which they can call.

### Asynchronous Loading via Child Actions

You may perform actual asynchronous actions such as file loading via child actions. An action can listen for itself to be called, and then perform an asynchronous task, calling its child action when that task is complete. In simplest form it might look something like this:

```javascript
var action = Reflux.createAction({children:['delayComplete']});

action.listen(function(){
	setTimeout(this.delayComplete, 1000);
});
```

Anywhere listening to that action could then use `this.listenTo(action.delayComplete, onActionDelayComplete)`. And what arguments you send when calling the `delayComplete` child are what get sent through to the callback of the listener. This way you can do things like load files and have the completed action send the contents of the file to whatever is listening.

The most common way in which this is used is to use `createActions` and its shorthand object form while taking advantage of a Reflux store's ability to listen to many actions at once with its `this.listenables` and `this.listenToMany` (see Reflux store documentation). Where the store can be made to automatically have actions call the stores methods named after the action's `actionName` (or the camecased `onActionName`), the child actions can be tacked on to that to read `actionNmeChildAction` or `onActionNmeChildAction`. Here is a full example of that:

```javascript
var Actions = Reflux.createActions({
	'load': {children: ['completed', 'failed']}
});

Actions.load.listen( function() {
    someAsyncOperation()
        .then( this.completed )
        .catch( this.failed );
});

class MyStore extends Reflux.Store
{
	constructor()
	{
		this.listenables = Actions;
		// or
		this.listenToMany(Actions);
	}
	
	onLoadCompleted(data)
	{
		// use the data here
	}
	
	onLoadFailed(message)
	{
		// failed, with whatever message you sent
	}
}
```

### Action Hooks

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

### Reflux.ActionMethods

If you would like to have a common set of methods available to all actions you can extend the `Reflux.ActionMethods` object, which is mixed into the actions when they are created.

Example usage:

```javascript
Reflux.ActionMethods.exampleMethod = function() { console.log(arguments); };

Actions.statusUpdate.exampleMethod('arg1');
// Should output: 'arg1'
```

### Next:

Next learn about [Reflux Stores](../stores/).
