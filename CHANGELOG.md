# Changelog

Check for latest changes on the [milestones page](https://github.com/spoike/refluxjs/milestones).

## v0.1.7

* Added support for initial data handling [#49](https://github.com/spoike/refluxjs/pull/49)
* Added CHANGELOG.md [#50](https://github.com/spoike/refluxjs/issues/50)
* Bug: Unregistered actions could not be reregistered [#47](https://github.com/spoike/refluxjs/pull/47)

## v0.1.6

* Added possibility to join actions and stores with `Reflux.all` [#27](https://github.com/spoike/refluxjs/issues/27), [#28](https://github.com/spoike/refluxjs/pull/28)
* Added circular dependency check [#26](https://github.com/spoike/refluxjs/issues/26)

## v0.1.5

* Bug fix

## v0.1.4

* Action functors are now deferred [#22](https://github.com/spoike/refluxjs/issues/22), [#23](https://github.com/spoike/refluxjs/pull/23)
* Added web tests using testling.ci [#20](https://github.com/spoike/refluxjs/pull/20)

## v0.1.3

* Added hooks `preEmit` and `shouldEmit` for actions [#16](https://github.com/spoike/refluxjs/issues/16)
* Various bug fixes and `.jshintrc` file created for grunt build

## v0.1.2

* Added `ListenerMixin` useful for React components [#7](https://github.com/spoike/refluxjs/issues/7)
* Using `eventemitter3` instead [#4](https://github.com/spoike/refluxjs/issues/4)

## v0.1.1

* Added convenience function to create multiple actions [#6](https://github.com/spoike/refluxjs/issues/6)
* Bug: createStore's unsubscribe function was broken [#5](https://github.com/spoike/refluxjs/issues/5)

## v0.1.0

* Removed lodash dependency [#1](https://github.com/spoike/refluxjs/issues/1)
