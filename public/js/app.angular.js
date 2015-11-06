(function() {

    'use strict';

    angular.module('tsportal', [
        // Contrib
        'ui.router',
        'angular-jwt',
        'angular-cache',
        'angular-spinkit',
        'ngAnimate',
        'ngDialog',

        // App
        'appDirectives',
        'loginService',
        'busyService',
        'messageService',
        'authInterceptor',
        'authControllers',
        'tradeshowControllers',
        'tradeshowServices',
        'leadControllers',
        'leadServices'
    ])
    .config(function($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.useLegacyPromiseExtensions = false;

        $urlRouterProvider.otherwise('/auth');

        $stateProvider.
            state('auth', {
                url: '/auth',
                templateUrl: '../partials/login-form.html',
                controller: 'AuthController as ctrl'
            }).
            state('logout', {
                url: '/logout',
                template:'',
                controller: 'LogoutController as ctrl'
            }).
            state('tradeshows', {
                url: '/tradeshows',
                templateUrl: '../partials/tradeshow-list.html',
                controller: 'TradeshowListController as ctrl'
            }).
            state('tradeshowEdit', {
                url: '/tradeshows/:tradeshowId/edit',
                templateUrl: '../partials/tradeshow-detail.html',
                controller: 'TradeshowDetailController as ctrl'
            }).
            state('tradeshowCreate', {
                url: '/tradeshows/create',
                templateUrl: '../partials/tradeshow-detail.html',
                controller: 'TradeshowCreateController as ctrl'
            }).
            state('leadEdit', {
                url:'/leads/:id/edit',
                templateUrl: '../partials/lead-detail.html',
                controller: 'LeadController as ctrl'
            });
    })
    .directive('pager', function(){
       return{
          restrict: 'E',
          scope: {
            currentPage: '=',
            totalPages: '=',
            getResults: '&getResults',
            tradeshow: '='
          },
          templateUrl: '../partials/pager.html',
          link: function(scope, elem, attrs) {
            scope.getRange = function(num) {
                return new Array(num);
            };
          }
       };
    })
    .run(function ($http, CacheFactory) {
      if (!CacheFactory.get('defaultCache')) {
        CacheFactory('defaultCache', {
            maxAge: 15 * 60 * 1000, // Items added to this cache expire after 15 minutes
            cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
            deleteOnExpire: 'aggressive' // Items will be deleted from this cache when they expire
          });
      }
      $http.defaults.cache = CacheFactory.get('defaultCache');
    });
})();
