var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCss = require('gulp-minify-css');
var templateCache = require('gulp-angular-templatecache');

gulp.task('templates', function() {
	gulp.src([
		"src/tsportal/**/*.html"
	])
	.pipe(templateCache('templates.js', {standalone: true}))
	.pipe(gulp.dest('src/tsportal'));
});

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

var src = [
	"src/bower_components/jquery/dist/jquery.js",
	"src/bower_components/jquery-migrate/jquery-migrate.min.js",
	"src/bower_components/angular/angular.js",
	"src/bower_components/bootstrap/dist/js/bootstrap.js",
	"src/bower_components/bootstrap-switch/dist/js/bootstrap-switch.js",
	"src/bower_components/angular-bootstrap-switch/dist/angular-bootstrap-switch.js",
	"src/bower_components/angular-ui-router/release/angular-ui-router.js",
	"src/bower_components/angular-jwt/dist/angular-jwt.js",
	"src/bower_components/angular-cache/dist/angular-cache.js",
	"src/bower_components/angular-resource/angular-resource.js",
	"src/bower_components/angular-resource/angular-resource.js",
	"src/bower_components/angular-animate/angular-animate.js",
	"src/bower_components/ng-dialog/js/ngDialog.js",
	"src/bower_components/angular-spinkit/build/angular-spinkit.js",
	"src/bower_components/moment/min/moment.min.js"
];
gulp.task('js-bower', function() {
	gulp.src(src)
		.pipe(sourcemaps.init())
			.pipe(concat('public/js/app.plugins.js'))
			.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('.'));
});

gulp.task('js-bower-dev', function() {
	gulp.src(src)
		.pipe(concat('public/js/app.plugins.js'))
		.pipe(gulp.dest('.'));
});


var srcJs = [
	'src/tsportal/shared/**/*.module.js', 
	'src/tsportal/components/**/*.module.js', 
	'src/tsportal/components/**/*Directive.js', 
	'src/tsportal/shared/**/*Directive.js', 
	'src/tsportal/shared/**/*Interceptor.js', 
	'src/tsportal/shared/**/*Service.js', 
	'src/tsportal/shared/**/*Resource.js', 
	'src/tsportal/components/**/*Controller.js', 
	'src/tsportal/templates.js',
	'src/tsportal/app.js'
];

gulp.task('js', function() {
	gulp.src(srcJs)
	.pipe(sourcemaps.init())
		.pipe(concat('public/js/app.base.js'))
		.pipe(ngAnnotate())
		.pipe(uglify())
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('.'));
});

gulp.task('js-dev', function() {
	gulp.src(srcJs)
		.pipe(concat('public/js/app.base.js'))
		.pipe(ngAnnotate())
	.pipe(gulp.dest('.'));
});

gulp.task('watch', ['templates', 'js', 'js-bower', 'css-bower'], function () {
  gulp.watch('src/tsportal/**/*.js', ['js']);
  gulp.watch('src/tsportal/**/*.html', ['templates']);
});

gulp.task('build', ['templates', 'js', 'js-bower', 'css-bower']);
gulp.task('build-dev', ['templates', 'js-dev', 'js-bower-dev', 'css-bower']);