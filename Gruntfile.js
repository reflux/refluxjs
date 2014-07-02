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
        src: 'src/index.js',
        dest: 'dist/reflux-<%= pkg.version %>.js',
        options: {
          bundleOptions: {
            transform: ['debowerify', 'decomponentify', 'deamdify', 'deglobalify'],
            standalone: 'Reflux'
          }
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