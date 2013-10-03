module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n'
      },
      build: {
        src: 'build/smallmouth.js',
        dest: 'build/smallmouth.min.js'
      }
    },

    typescript: {
      base: {
        src: ['src/**/*.ts'],
        dest: 'build/smallmouth.js',
        options: {
          module: 'amd', //or commonjs
          target: 'es5', //or es3
          sourcemap: true,
          declaration: true,
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome']
      },
      headless: {
        configFile: 'karma.conf.js',
        browsers: ['PhantomJS']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-karma');

  // Default task(s).
  grunt.registerTask('default', ['typescript', 'uglify']);

};
