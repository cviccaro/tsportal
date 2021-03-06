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
        'templates',

        // app/shared
        'tsportal.auth',
        'tsportal.busyIndicator',
        'tsportal.clickable',
        'tsportal.cache',
        'tsportal.lead',
        'tsportal.messages',
        'tsportal.pager',
        'tsportal.slideMenu',
        'tsportal.select-us-state',
        'tsportal.timeago',
        'tsportal.tradeshow',

        // app/components
        'tsportal.leads',
        'tsportal.tradeshows',
        'tsportal.login'
    ])
    .config(function($stateProvider, $urlRouterProvider, $httpProvider, slideMenuServiceProvider, busyServiceProvider) {
        busyServiceProvider.setApiPattern(/\/{0,1}api\/[a-zA-Z\/0-9\?\=\&\%\+\-\_]*/g);
        slideMenuServiceProvider.registerMenu('tradeshow', {
            responsive: true,
            title: 'Tradeshow<br><small>{{tradeshow.name}}</small><br><br><span class="badge">{{tradeshow.lead_count}}</span><span>&nbsp;leads</span>',
            items: {
                edit: {
                    url: 'tradeshows/{{tradeshow.id}}/edit',
                    title: '<span class="glyphicon glyphicon-edit"></span>&nbsp;&nbsp;&nbsp;Edit'
                },
                "delete": {
                    click: 'ctrl.deleteTradeshow(tradeshow.id)',
                    title: '<span class="glyphicon glyphicon-trash"></span>&nbsp;&nbsp;&nbsp;Delete'
                },
                report: {
                    click: 'ctrl.downloadReport(tradeshow.id)',
                    title: '<span class="glyphicon glyphicon-stats"></span>&nbsp;&nbsp;&nbsp;Excel Report',
                    show: 'tradeshow.lead_count > 0'
                }
            }
        });
        slideMenuServiceProvider.registerMenu('lead', {
            responsive: true,
            title: 'Lead<br><small>{{lead.first_name}} {{lead.last_name}}</small><br><small>{{lead.email_address}}</small>',
            items: {
                edit: {
                    url: 'leads/{{lead.id}}/edit',
                    title: '<span class="glyphicon glyphicon-edit"></span>&nbsp;&nbsp;&nbsp;Edit'
                },
                "delete": {
                    click: 'ctrl.deleteLead(lead.id)',
                    title: '<span class="glyphicon glyphicon-trash"></span>&nbsp;&nbsp;&nbsp;Delete'
                }
            },
        });

        $httpProvider.useLegacyPromiseExtensions = false;

        $urlRouterProvider.otherwise('/auth');

        $stateProvider
            .state('auth', {
                url: '/auth',
                templateUrl: 'components/login/loginView.html',
                controller: 'LoginController as ctrl',
                resolve: {
                    promisedCache: function promisedCache(CachingService) {
                        if (!CachingService.getCache('loginForm')) {
                            CachingService.createNewCache('loginForm', {
                                maxAge: 60 * 60 * 24 * 7 * 4 * 1000,
                                deleteOnExpire: 'aggressive',
                                storageMode: 'localStorage'
                            });
                        }

                        return CachingService.getCache('loginForm');
                    }
                }
            })
            .state('logout', {
                url: '/logout',
                template:'',
                controller: 'LogoutController as ctrl'
            })
            .state('tradeshows', {
                url: '/tradeshows',
                templateUrl: 'components/tradeshows/list/tradeshowListView.html',
                controller: 'TradeshowListController as ctrl',
                resolve: {
                    promisedData: function promisedData(tradeshowService, CachingService) {
                        if (!CachingService.getCache('formCache')) {
                            CachingService.createNewCache('formCache', {
                              maxAge: 60 * 60 * 1000,
                              deleteOnExpire: 'aggressive',
                              storageMode: 'localStorage'
                            });
                        }
                       var cache = CachingService.getCache('formCache');
                       return tradeshowService.retrieve(cache.get('currentPage'), cache.get('perPage'), cache.get('orderBy'), cache.get('orderByReverse'), cache.get('query'));
                    },
                    promisedFormCache: function promisedFormCache(CachingService) {
                       return CachingService.getCache('formCache')
                    }
                }
            })
            .state('tradeshowEdit', {
                url: '/tradeshows/:id/edit',
                templateUrl: 'components/tradeshows/tradeshowView.html',
                controller: 'TradeshowEditController as ctrl',
                resolve: {
                    promisedData: function promisedData(Tradeshow, $stateParams) {
                       return Tradeshow.get({id:$stateParams.id}).$promise;
                    },
                    promisedLeadData: function promisedLeadData(leadService, $stateParams, CachingService) {
                        var cacheKey = 'tradeshow' + $stateParams.id + 'LeadsForm';
                        if (!CachingService.getCache(cacheKey)) {
                            CachingService.createNewCache(cacheKey, {
                              maxAge: 60 * 60 * 1000,
                              deleteOnExpire: 'aggressive',
                              storageMode: 'localStorage'
                            });
                        }
                        var cache = CachingService.getCache(cacheKey);
                        return leadService.retrieve($stateParams.id, cache.get('currentPage'), cache.get('perPage'), cache.get('orderBy'), cache.get('orderByReverse'), cache.get('query'));
                    },
                    promisedFormCache: function promisedFormCache(CachingService, $stateParams) {
                        return CachingService.getCache('tradeshow' + $stateParams.id + 'LeadsForm');
                    }
                }
            })
            .state('tradeshowCreate', {
                url: '/tradeshows/create',
                templateUrl: 'componenst/tradeshows/tradeshowView.html',
                controller: 'TradeshowCreateController as ctrl'
            })
            .state('leadEdit', {
                url:'/leads/:id/edit',
                templateUrl: 'components/leads/leadView.html',
                controller: 'LeadEditController as ctrl',
                resolve: {
                    leadData: function leadData(Lead, $stateParams) {
                        return Lead.get({id:$stateParams.id}).$promise;
                    }
                }
            });
    })
    .run(function ($http, CachingService) {
      if (CachingService.getCache('defaultCache')) {
        CachingService.createNewCache('defaultCache', {
            maxAge: 15 * 60 * 1000,
            cacheFlushInterval: 60 * 60 * 1000,
            deleteOnExpire: 'aggressive'
          });
      }

      $http.defaults.cache = CachingService.getCache('defaultCache');
    })
    .filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });
})();
