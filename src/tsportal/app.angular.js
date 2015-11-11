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
        'tsportalDirectives',
        'loginService',
        'busyService',
        'messageService',
        'slideMenuService',
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
                    promisedData: function promisedData(tradeshowService, CacheFactory) {
                        if (!CacheFactory.get('formCache')) {
                            new CacheFactory('formCache', {
                              maxAge: 60 * 60 * 1000,
                              deleteOnExpire: 'aggressive',
                              storageMode: 'localStorage'
                            });
                        }
                       var cache = CacheFactory.get('formCache');
                       return tradeshowService.retrieve(cache.get('currentPage'), cache.get('perPage'), cache.get('orderBy'), cache.get('orderByReverse'), cache.get('query'));
                    },
                    promisedFormCache: function promisedFormCache(CacheFactory) {
                       return CacheFactory.get('formCache');
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
                    promisedLeadData: function promisedLeadData(leadService, $stateParams, CacheFactory) {
                        var cacheKey = 'tradeshow' + $stateParams.id + 'LeadsForm';
                        if (!CacheFactory.get(cacheKey)) {
                            new CacheFactory(cacheKey, {
                              maxAge: 60 * 60 * 1000,
                              deleteOnExpire: 'aggressive',
                              storageMode: 'localStorage'
                            });
                        }
                        var cache = CacheFactory.get(cacheKey);
                        return leadService.retrieve($stateParams.id, cache.get('currentPage'), cache.get('perPage'), cache.get('orderBy'), cache.get('orderByReverse'), cache.get('query'));
                    },
                    promisedFormCache: function promisedFormCache(CacheFactory, $stateParams) {
                        var cacheKey = 'tradeshow' + $stateParams.id + 'LeadsForm';
                        return CacheFactory.get(cacheKey);
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
    })
    .filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });
})();
