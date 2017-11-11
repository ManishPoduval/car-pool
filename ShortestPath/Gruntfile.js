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
        name: yarn.name,
        version: yarn.version
    };

    grunt.initConfig({
        gruntConfig: gruntConfig,
        pkg: yarn,
        htmlmin: {
            build: {
                options: {
                    removeComments: false,
                    collapseWhitespace: true
                },
                files: [{
                        expand: true,
                        cwd: '<%= gruntConfig.app%>/templates/',
                        src: '**/*.html',
                        dest: '<%= gruntConfig.dist %>/templates'
                    },
                    {
                        '<%= gruntConfig.dist %>/index.html': '<%= gruntConfig.app%>/index.html'
                    }
                ]
            }
        },
        concat: {
            options: {
                separator: ';\n'
            },
            dist: {
                src: ['src/**/*.js'],
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
        /* GRUNT HAS NO SUPPORT FOR YARN AS OF 8/11/2017 */
        /*        yarn: {
                    install: {
                        options: {
                            install: true,
                            copy: false,
                            targetDir: '<%= gruntConfig.app%>/components'
                        }
                    }

                },*/
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
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src/js',
                    mainConfigFile: 'src/js/require-config.js',
                    appDir: '<%= gruntConfig.app %>',
                    dir: '<%= gruntConfig.dist %>',
                    require: '../../components/requirejs/require',
                    almond: '../../components/almond/almond'/*,
                    modules: [{
                        name: 'require-config'
                    }],*/
                },
                dev: {
                    options: {
                        build: false
                    }
                },
                prod: {
                    options: {
                        build: true
                    }
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    // Default task(s).
    grunt.registerTask('default', ['uglify']);

    //grunt.registerTask('preview', ['connect:client', 'watch:client']);

    grunt.registerTask('build', [
        'concat',
        'uglify',
        'requirejs',
        'htmlmin'
        //'preview'   /*lets not run livereload for now*/
    ]);
};