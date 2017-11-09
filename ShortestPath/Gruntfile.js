module.exports = function(grunt) {
    "use strict";

    var yarn = grunt.file.readJSON('package.json');

    var LIVERELOAD_PORT = 35729;
    var lrSnippet = require('connect-livereload')({
        port: LIVERELOAD_PORT
    });
    var livereloadMiddleware = function(connect, options) {
        return [
            lrSnippet,
            connect.static(options.base),
            connect.directory(options.base)
        ];
    };

    var gruntConfig = {
        app: 'src',
        dist: 'dist',
        // ensure the name and version properties in bower.json are correct, as they control much of the build
        name: yarn.name,
        version: yarn.version,
        description: '',
    };

    grunt.initConfig({
        gruntConfig: gruntConfig,
        pkg: yarn,
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: ['src/**/*.js'],
                // the location of the resulting JS file
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        connect: {
            client: {
                options: {
                    port: 9000,
                    base: 'client',
                    middleware: livereloadMiddleware
                }
            }
        },
        watch: {
            client: {
                files: ['client/**/*'],
                tasks: [],
                options: {
                    livereload: LIVERELOAD_PORT
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);

    grunt.registerTask('preview', ['connect:client', 'watch:client']);

    grunt.registerTask('build', [
        'concat',
        'uglify'
        //'preview'   /*lets not run livereload for now*/
    ]);
};