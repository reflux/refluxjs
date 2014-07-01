# Reflux

A simple library for uni-directional dataflow architecture inspired by ReactJS [Flux](http://facebook.github.io/react/blog/2014/05/06/flux.html).

# Installation

You can currently install the package as a npm package:

    npm install reflux

# Usage

Create an action by calling `createAction`.

```javascript
var Reflux = require('reflux');

var statusUpdate = Reflux.createAction();
```

Create a data store by passing a definition object to `createStore`.

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
        this.trigger(status);
    }

});
```

In your component, register to listen to your data store like this:

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

/**
 * Will output:
 * status:  ONLINE
 * status:  OFFLINE
 */
```

See `test/index.js` for more example on how to use the package.

# License

## [BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause)

Copyright (c) 2014, Mikael Brassman
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.