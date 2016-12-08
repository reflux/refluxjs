
# RefluxJS

A simple library for unidirectional dataflow architecture inspired by ReactJS [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html).

[![NPM Version][npm-image]][npm-url]
[![Bower Version][bower-image]][bower-url]
[![Build Status][travis-image]][travis-url]
[![NPM Downloads][downloads-image]][npm-url]

[![Sauce Test Status](https://saucelabs.com/browser-matrix/refluxjs.svg)](https://saucelabs.com/u/refluxjs)

--------------------

## Installation

You can currently install the package as a npm package, a bower component, or import it from a CDN.

#### NPM

The following command installs RefluxJS as a npm package:

    npm install reflux

Then, in your script, you can gain a reference to RefluxJS like so: `var Reflux = require('reflux');`

#### Bower

The following command installs reflux as a bower component that can be used in the browser:

    bower install reflux
	
Then the files may be imported into your html file via `bower_components/reflux/dist/reflux.js` or `bower_components/reflux/dist/reflux.min.js`. At that point a `Reflux` variable will be globally available to you. It is suggested that you import RefluxJS after React.

#### CDN

RefluxJS is available at [jsdelivr](http://www.jsdelivr.com/#!refluxjs).

You may import the CDN files directly through a script tag. At that point a `Reflux` variable will be globally available to you. It is suggested that you import RefluxJS after React.

--------------------------------

## Usage

For usage, you need to create actions which can be called from React components. Those actions are listened to by stores which hold and update data. In turn those stores are hooked up to React components and set state within them as it is updated within the store.

Therefore the 3 main concepts to know are:

1. [creating actions](#creating-actions)
2. [creating stores](#creating-stores)
3. [hooking stores to React components](#hooking-stores-to-components)

--------------------------------

## Creating Actions

Create an action by calling `Reflux.createAction` with an optional options object.

```javascript
var statusUpdate = Reflux.createAction();
```

An action is a [function object](http://en.wikipedia.org/wiki/Function_object) that can be invoked like any other function.

```javascript
statusUpdate(data); // Invokes the action statusUpdate
```

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

#### More on Actions:  
Actions can also:
- load files asychronously with child actions
- do preEmit and shouldEmit checking
- have many shortcuts for easy usage

See [Reflux Action Documentation](docs/actions/) for more.

------------------

## Creating Stores

Create a data store much like ReactJS's own `React.Component` by creating a class extending `Reflux.Store`. The store has a `state` property much like a component, and uses `setState` like a component as well. You may set up all action listeners in the `constructor` and register them by calling the store's own `listenTo` function.

```javascript
class StatusStore extends Reflux.Store
{
    constructor()
    {
        super();
        this.state = {flag:'OFFLINE'}; // <- set store's default state much like in React
        this.listenTo(statusUpdate, this.onStatusUpdate); // listen to the statusUpdate action
    }

    onStatusUpdate(status)
    {
        var newFlag = status ? 'ONLINE' : 'OFFLINE';
        this.setState({flag:newFlag});
    }
}
```

In the above example, whenever the action `statusUpdate` is called, the store's `onStatusUpdate` callback will be called with whatever parameters were sent in the action. E.g. if the action is called as `statusUpdate(true)` then the `status` argument in the `onStatusUpdate` function is `true`.

Stores also integrate easily with sets of actions via things like `this.listenables`. When an actions object (or an Array of multiple actions objects) is applied to `this.listenables` you may automatically add listeners simply by naming convention. Just name the functions either after the action name (such as `actionName`, or the camelcased action name preceded with "on", (such as `onActionName`).

```javascript
var Actions = Reflux.createActions(['firstAction', 'secondAction']);

class StatusStore extends Reflux.Store
{
    constructor()
    {
        super();
        this.listenables = Actions;
    }

    onFirstAction()
    {
        // calls on Actions.firstAction();
    }
	
	onSecondAction()
	{
		// calls on Actions.secondAction();
	}
}
```

#### More on Stores:
  
Reflux stores are very powerful. They can even do things like contribute to a global state that can be read and set for partial or full-state time-travel, debugging, etc.

See [Reflux Store Documentation](docs/stores/) to learn more about stores.

--------------------------

## Hooking Stores to Components

Once you've created actions and stores, now the last step in working RefluxJS is to hook those stores to a React component.

This is done as simply as extending `Reflux.Component` instead of `React.Component` and setting the store(s) to use. `Reflux.Component` itself extends `React.Component`, so you use them the exact same. The only difference is that `Reflux.Component` allows you to set stores for the component to get state from:

```javascript
class MyComponent extends Reflux.Component
{
    constructor(props)
    {
        super(props);
        this.state = {}; // our store will add its own state to the component's
        this.store = StatusStore; // <- just assign the store class itself
    }

    render()
    {
        var flag = this.state.flag; // <- flag is mixed in from the StatusStore
        return <div>User is {flag}</div>
    }
}
```

When the component mounts it will either create a singleton instance of `StatusStore` (if one isn't already made) or use an already made singleton (if it was already created by another component that uses the store).

Of important note is that you can:
  
1. Set multiple stores by setting `this.stores` (the plural) and setting it to an Array of store classes.
2. Set a `this.storeKeys` Array to restrict only certain parts of the store being mixed into the component state.

There is also a `mapStoreToState` method in the documentation for those that want absolute control over how a store's state is mapped to a component.

```javascript
class MyComponent extends Reflux.Component
{
    constructor(props)
    {
        super(props);
        this.state = {type:'admin'}; // <- note that we can still use normal state
        this.stores = [StatusStore, AnotherStore];
        this.storeKeys = ['flag', 'info'];
    }

    render()
    {
        var flag = this.state.flag;
        var info = this.state.info;
        var type = this.state.type;
        return <div>User is {flag}, info: {info}, type: {type}</div>
    }
}
```

The above will mix in properties from the state of both `StatusStore` and `AnotherStore`. However, because of `this.storeKeys` it will only mix in the properties `flag` and `info` from them. So any other properties within those stores will not get mixed in. So even if a store contained a `type` property in its state it would not get mixed in, and the `type` value we set as a normal part of the component state is safe.

#### More on using Reflux style components:

Reflux's simple and intuitive way of integrating stores into components is easy and powerful. You can aggregate stores together on a component-by-component basis, filter which parts of the stores come through and which don't, or even do a detailed manual mapping of exactly how you want the state from stores to map to the state in a particular component.

See [Reflux Style Component Documentation](docs/components/) to learn more.

-----------------------------------------

## Documentation

What you've just read is a "view from 10,000 feet" type overview of getting started with RefluxJS. For serious learning see the [documentation](docs/).

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
