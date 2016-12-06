
# Reflux Documentation

You can read an overview of Flux [here](https://facebook.github.io/flux/docs/overview.html), however the gist of it is to introduce a more functional programming style architecture by eschewing MVC like pattern and adopting a single data flow pattern.

```
+---------+       +--------+       +-----------------+
¦ Actions ¦------>¦ Stores ¦------>¦ View Components ¦
+---------+       +--------+       +-----------------+
     ^                                      ¦
     +--------------------------------------+

```

The pattern is composed of actions and data stores, where actions initiate new data to pass through data stores before coming back to the view components again. If a view component has an event that needs to make a change in the application's data stores, they need to do so by signaling to the stores through the actions available.

##### Core Concepts:

- [Actions](actions/)
- [Stores](stores/)
- [Hooking to Components](components/)

##### Advanced:

- [Advanced Features](advanced/)

##### Other:

- [Reflux vs Flux](other/reflux-vs-flux.md)
- [Examples](other/examples.md)

## Colophon

[List of contributors](https://github.com/spoike/reflux/graphs/contributors) is available on Github.

This project is licensed under [BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause). Copyright (c) 2014, Mikael Brassman.

For more information about the license for this particular project [read the LICENSE.md file](LICENSE.md).

This project uses [eventemitter3](https://github.com/3rd-Eden/EventEmitter3), is currently MIT licensed and [has it's license information here](https://github.com/3rd-Eden/EventEmitter3/blob/master/LICENSE).