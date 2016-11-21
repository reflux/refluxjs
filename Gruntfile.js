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
		  exclude: ['react'],
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
      devsauce: {
        configFile: 'karma.conf.js',
        options: {
          reporters: ['saucelabs', 'dots'],
          sauceLabs: {
            "public": "team",
            testName: 'RefluxJS Karma Tests (Dev)',
            recordVideo: false,
            recordScreenshot: false,
            tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
          },
          customLaunchers: sauceLaunchers,
          browsers: Object.keys(sauceLaunchers),
          captureTimeout: 0
        },
      },
      sauce: {
        configFile: 'karma.conf.js',
        options: {
          reporters: ['saucelabs', 'dots'],
          sauceLabs: {
            "public": "public",
            testName: 'RefluxJS Karma Tests (Travis)',
            recordVideo: false,
            recordScreenshot: false,
            startConnect: false,
            tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
            connectOptions: {
              port: 5757,
              logfile: "sauce_connect.log"
            }
          },
          customLaunchers: sauceLaunchers,
          browsers: Object.keys(sauceLaunchers),
          singleRun: true,
          captureTimeout: 0
        },
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['jshint', 'mochaTest', 'karma:local']);

  grunt.registerTask('build', ['test', 'browserify', 'uglify']);

  grunt.registerTask('default', ['watch']);

};
