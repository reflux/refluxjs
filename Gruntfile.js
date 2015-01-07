module.exports = function(grunt) {

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
      integration: {
        configFile: 'karma.conf.js',
        options: {
            browsers: ['PhantomJS']
        }
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['jshint', 'mochaTest', 'karma']);

  grunt.registerTask('build', ['test', 'browserify', 'uglify']);

  grunt.registerTask('default', ['watch']);

};
