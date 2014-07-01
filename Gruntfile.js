module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
    },
    mochaTest: {
      test: {
        src: ['test/**/*.spec.js']
      }
    },
    browserify: {
      dist: {
        src: 'src/**/*.js',
        dest: 'dist/reflux-<%= pkg.version %>.js',
        options: {
          alias: ['lodash:_', 'events:events'],
          ignore: ['lodash', 'events'],
          standalone: 'Reflux',
          'ignore-missing': true
        },
      }
    },
    uglify: {
      dist: {
        src: 'dist/reflux-<%= pkg.version %>.js',
        dest: 'dist/reflux-<%= pkg.version %>-min.js'
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['build']
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['jshint', 'mochaTest']);

  grunt.registerTask('build', ['test', 'browserify', 'uglify']);

  grunt.registerTask('default', ['watch']);

};