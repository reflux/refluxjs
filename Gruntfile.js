module.exports = function(grunt) {

  var sauceLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: '35'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '30'
    },
    sl_ios_safari: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.9',
      version: '7.1'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    }
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
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
          bundleOptions: {
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
          reporters: ['saucelabs', 'spec'],
          sauceLabs: {
            public: 'public',
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
