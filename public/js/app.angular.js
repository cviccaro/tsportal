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
        'frapontillo.bootstrap-switch',

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
                controller: 'TradeshowListController as ctrl',
                resolve: {
                    promisedData: function promisedData(tradeshowService, $stateParams) {
                       return tradeshowService.retrieve($stateParams.id);
                    }
                }
            }).
            state('tradeshowEdit', {
                url: '/tradeshows/:id/edit',
                templateUrl: '../partials/tradeshow-detail.html',
                controller: 'TradeshowDetailController as ctrl',
                resolve: {
                    promisedData: function promisedData(Tradeshow, $stateParams) {
                       return Tradeshow.get({id:$stateParams.id}).$promise;
                    },
                    promisedLeadData: function promisedLeadData(leadService, $stateParams) {
                       return leadService.retrieve($stateParams.id);
                    }
                }
            }).
            state('tradeshowCreate', {
                url: '/tradeshows/create',
                templateUrl: '../partials/tradeshow-detail.html',
                controller: 'TradeshowCreateController as ctrl'
            }).
            state('leadEdit', {
                url:'/leads/:id/edit',
                templateUrl: '../partials/lead-detail.html',
                controller: 'LeadController as ctrl',
                resolve: {
                    leadData: function leadData(Lead, $stateParams) {
                        return Lead.get({id:$stateParams.id}).$promise;
                    }
                }
            });
    })
    .run(function ($http, CacheFactory) {
      if (!CacheFactory.get('defaultCache')) {
        new CacheFactory('defaultCache', {
            maxAge: 15 * 60 * 1000,
            cacheFlushInterval: 60 * 60 * 1000,
            deleteOnExpire: 'aggressive'
          });
      }

      $http.defaults.cache = CacheFactory.get('defaultCache');
    });
})();
