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
        'ngResource',
        'frapontillo.bootstrap-switch',
        'angular-chosen',

        // app/shared
        'tsportal.auth',
        'tsportal.busyIndicator',
        'tsportal.clickable',
        'tsportal.lead',
        'tsportal.messages',
        'tsportal.pager',
        'tsportal.slideMenu',
        'tsportal.timeago',
        'tsportal.tradeshow',

        // app/components
        'tsportal.leads',
        'tsportal.tradeshows',
        'tsportal.login'
    ])
    .config(function($stateProvider, $urlRouterProvider, $httpProvider, slideMenuServiceProvider) {
        slideMenuServiceProvider.registerMenu('tradeshow', {
            title: 'Tradeshow<br /><small>{{tradeshow.name}}</small><br /><small>{{tradeshow.lead_count}} leads',
            items: {
                edit: {
                    url: 'tradeshows/{{tradeshow.id}}/edit',
                    title: 'Edit'
                },
                delete: {
                    click: 'ctrl.deleteTradeshow(tradeshow.id)',
                    title: 'Delete'
                },
                report: {
                    click: 'ctrl.downloadReport(tradeshow.id)',
                    title: 'Excel Report',
                    show: 'tradeshow.lead_count > 0'
                }
            }
        });
        slideMenuServiceProvider.registerMenu('lead', {
            title: 'Lead<br /><small>{{lead.first_name}} {{lead.last_name}}</small><br /><small>{{lead.email_address}}</small>',
            items: {
                edit: {
                    url: 'leads/{{lead.id}}/edit',
                    title: 'Edit'
                },
                delete: {
                    click: 'ctrl.deleteLead(lead.id)',
                    title: 'Delete'
                }
            },
        });

        $httpProvider.useLegacyPromiseExtensions = false;

        $urlRouterProvider.otherwise('/auth');

        $stateProvider.
            state('test', {
                url:'/test',
                template: 'test',
                controller:'TradeshowListController as ctrl'
            })
            .state('auth', {
                url: '/auth',
                templateUrl: '../views/loginView.html',
                controller: 'LoginController as ctrl'
            })
            .state('logout', {
                url: '/logout',
                template:'',
                controller: 'LogoutController as ctrl'
            })
            .state('tradeshows', {
                url: '/tradeshows',
                templateUrl: '../views/tradeshowListView.html',
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
            })
            .state('tradeshowEdit', {
                url: '/tradeshows/:id/edit',
                templateUrl: '../views/tradeshowView.html',
                controller: 'TradeshowEditController as ctrl',
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
            })
            .state('tradeshowCreate', {
                url: '/tradeshows/create',
                templateUrl: '../views/tradeshowView.html',
                controller: 'TradeshowCreateController as ctrl'
            })
            .state('leadEdit', {
                url:'/leads/:id/edit',
                templateUrl: '../views/leadView.html',
                controller: 'LeadEditController as ctrl',
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
