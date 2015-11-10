var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');

gulp.task('css-bower', function() {
	gulp.src([
		"src/bower_components/bootstrap-switch/dist/css/bootstrap3/bootstrap-switch.min.css",
		"src/bower_components/angular-spinkit/build/angular-spinkit.min.css",
		"src/bower_components/ng-dialog/css/ngDialog.min.css",
		"src/bower_components/ng-dialog/css/ngDialog-theme-default.min.css"
	])
	.pipe(concat('public/css/app.plugins.css'))
	.pipe(minifyCss())
	.pipe(gulp.dest('.'));
});
gulp.task('js-bower', function() {
	gulp.src([
		"src/bower_components/jquery/dist/jquery.min.js",
		"src/bower_components/jquery-migrate/jquery-migrate.min.js",
		"src/bower_components/angular/angular.min.js",
		"src/bower_components/bootstrap/dist/js/bootstrap.min.js",
		"src/bower_components/bootstrap-switch/dist/js/bootstrap-switch.min.js",
		"src/bower_components/angular-bootstrap-switch/dist/angular-bootstrap-switch.min.js",
		"src/bower_components/angular-ui-router/release/angular-ui-router.min.js",
		"src/bower_components/angular-jwt/dist/angular-jwt.min.js",
		"src/bower_components/angular-cache/dist/angular-cache.min.js",
		"src/bower_components/angular-resource/angular-resource.min.js",
		"src/bower_components/angular-resource/angular-resource.min.js",
		"src/bower_components/angular-animate/angular-animate.min.js",
		"src/bower_components/ng-dialog/js/ngDialog.min.js",
		"src/bower_components/angular-spinkit/build/angular-spinkit.min.js",
		"src/bower_components/moment/min/moment.min.js"
		])
		.pipe(sourcemaps.init())
			.pipe(concat('public/js/app.plugins.js'))
			.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('.'))
});

gulp.task('js', function() {
	gulp.src(['src/tsportal/services/*.js', 'src/tsportal/directives/*.js', 'src/tsportal/interceptors/*.js', 'src/tsportal/controllers/*.js', 'src/tsportal/app.angular.js'])
		.pipe(sourcemaps.init())
			.pipe(concat('public/js/app.base.js'))
			.pipe(ngAnnotate())
			.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('.'))
})

gulp.task('watch', ['js', 'js-bower', 'css-bower'], function () {
  gulp.watch('src/tsportal/**/*.js', ['js']);
  // gulp.watch('src/bower_components/**/*.js', ['js-bower']);
  // gulp.watch('src/bower_components/**/*.css', ['css-bower']);
})