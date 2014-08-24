var Benchmark = require('benchmark'),
    suite = new Benchmark.Suite(),
    fs = require('fs'),
    path = require('path');

// Find all benchmark tests and add them to the suite
fs.readdirSync(__dirname).forEach(function(file) {
    if (file === 'index.js') {
        return;
    }
    var filename = path.basename(file, '.js'),
        module = require(path.join(__dirname, file));

    if (module.fn) {
        console.log('Added:', file, module.name ? '- ' + module.name : '');
        suite.add(module.name || filename, module.fn);
    }
});

suite.on('cycle', function(event) {
    console.log(String(event.target));
})
.run({ 'async': true });
