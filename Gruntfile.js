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
        dest: 'dist/reflux-<%= pkg.version %>.js'
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['test', 'browserify']
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['jshint', 'mochaTest']);

  grunt.registerTask('build', ['test', 'browserify']);

  grunt.registerTask('default', ['watch']);

};