# Comparing RefluxJS with Facebook Flux

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

[Back to docs](../)