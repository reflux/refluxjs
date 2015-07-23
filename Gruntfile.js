require('es6-promise').polyfill();

module.exports = function(grunt) {

  var sauceLaunchers = require('./test/sauceLaunchers');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: true
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*.spec.js']
      }
    },
    browserify: {
      dist: {
        src: ['src/index.js'],
        dest: 'dist/<%= pkg.name %>.js',
        options: {
          browserifyOptions: {
            standalone: 'Reflux'
          }
        },
      }
    },
    uglify: {
      dist: {
        src: 'dist/reflux.js',
        dest: 'dist/reflux.min.js'
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['build']
    },
    karma: {
      local: {
        configFile: 'karma.conf.js',
        options: {
            browsers: ['PhantomJS']
        }
      },
      sauce: {
        configFile: 'karma.conf.js',
        options: {
          reporters: ['dots', 'saucelabs'],
          sauceLabs: {
            public: 'public',
            testName: 'RefluxJS Karma Tests',
            recordVideo: false,
            recordScreenshot: false
          },
          customLaunchers: sauceLaunchers,
          browsers: Object.keys(sauceLaunchers)
        }
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['jshint', 'mochaTest', 'karma:local']);

  grunt.registerTask('travis', ['test', 'karma:sauce']);

  grunt.registerTask('build', ['test', 'browserify', 'uglify']);

  grunt.registerTask('default', ['watch']);

};
