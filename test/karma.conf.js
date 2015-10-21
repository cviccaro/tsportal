module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'public/bower_components/angular/angular.js',
      'public/bower_components/angular-resource/angular-resource.js',
      'public/bower_components/angular-ui-router/release/angular-ui-router.js',
      'public/bower_components/angular-mocks/angular-mocks.js',
      'public/bower_components/angular-jwt/dist/angular-jwt.js',
      'public/bower_components/angular-spinkit/build/angular-spinkit.js',
      'public/bower_components/satellizer/satellizer.min.js',
      'public/bower_components/angular-animate/angular-animate.js',
      'public/bower_components/ng-dialog/js/ngDialog.min.js',
      'public/bower_components/jquery/dist/jquery.min.js',
      'public/bower_components/angular-http-auth/src/http-auth-interceptor.js',
      'public/js/**/*.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec'],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    browsers : [
      'PhantomJS'
      //'Chrome'
    ],

    plugins : [
            "karma-spec-reporter",
            'karma-chrome-launcher',
            "karma-phantomjs-launcher",
         //   'karma-firefox-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};