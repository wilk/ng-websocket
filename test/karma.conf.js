'use strict';

module.exports = function (config) {
    config.set({
        basePath: '../',

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'ng-websocket.js',
            'test/unit/**/*.js'
        ],

        frameworks: ['jasmine'],

        autoWatch: true,

        browsers: ['PhantomJS'],

        plugins: [
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-mocha-reporter'
        ],

        // reporters configuration
        reporters: ['mocha']
    });
};