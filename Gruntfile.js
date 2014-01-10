module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> v<%= pkg.version %> */\n',
        mangle: true
      },
      build: {
        src: 'build/smallmouth.js',
        dest: 'build/smallmouth.min.js'
      }
    },

    typescript: {
      base: {
        src: [
          'src/*.ts',
          'src/interfaces/*.ts',
          'src/serverAdapters/ServerAdapter.ts',
          'src/serverAdapters/SocketIOAdapter.ts'
        ],
        dest: 'build/smallmouth.js',
        options: {
          module: 'amd', //or commonjs
          target: 'es5', //or es3
          sourcemap: true,
          declaration: true,
        }
      },
      sockjs: {
        src: [
          'src/serverAdapters/SockJSAdapter.ts'
        ],
        dest: 'build/smallmouth.sockjs.js',
        options: {
          target: 'es5',
          sourcemapp: true,
          declaration: true
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
  grunt.registerTask('test', ['typescript', 'karma:headless']);

};
