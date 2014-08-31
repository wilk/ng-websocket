var gulp = require('gulp'),
    karma = require('gulp-karma'),
    server = require('./demo/server');

gulp.task('test', function () {
    server.start();

    return gulp.src([
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'ng-websocket.js',
            'test/unit/**/*.js'
        ])
        .pipe(karma({
            configFile: 'test/karma.conf.js',
            action: 'run'
        }))
        .on('error', server.stop)
        .on('end', server.stop);
});