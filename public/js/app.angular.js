'use strict';

var tsportal = angular.module('tsportal', [
    // Contrib
    'ui.router',
    'angular-jwt',
    'angular-spinkit',
    'ngAnimate',
    'ngDialog',
  //  'satellizer',
    // 'http-auth-interceptor',
    'angular-cache',
    // Custom
    'authInterceptor',
    'tradeshowServices',
    'leadServices',
    'authControllers',
    'tradeshowControllers',
    'leadControllers',
    'loginService',
    'busyService',
    'messageService'
]);

tsportal.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function($stateProvider, $urlRouterProvider, $httpProvider) {
        $httpProvider.useLegacyPromiseExtensions = false;
        // Satellizer configuration that specifies which API
        // route the JWT should be retrieved from
       // $authProvider.loginUrl = '/api/authenticate';

        // Router States
        $urlRouterProvider.otherwise('/auth');

        $stateProvider.
            state('auth', {
                url: '/auth',
                templateUrl: '../partials/login-form.html',
                controller: 'AuthController'
            }).
            state('logout', {
                url: '/logout',
                template:'',
                controller: 'LogoutController'
            }).
            state('tradeshows', {
                url: '/tradeshows',
                templateUrl: '../partials/tradeshow-list.html',
                controller: 'TradeshowListController'
            }).
            state('tradeshowEdit', {
                url: '/tradeshows/:tradeshowId/edit',
                templateUrl: '../partials/tradeshow-detail.html',
                controller: 'TradeshowDetailController as tradeshowCtrl'
            }).
            state('tradeshowCreate', {
                url: '/tradeshows/create',
                templateUrl: '../partials/tradeshow-detail.html',
                controller: 'TradeshowCreateController'
            }).
            state('leadEdit', {
                url:'/leads/:id/edit',
                templateUrl: '../partials/lead-detail.html',
                controller: 'LeadController as leadCtrl'
            });
}]);

tsportal.directive('pager', function(){
   return{
      restrict: 'E',
      scope: {
        currentPage: '=',
        totalPages: '=',
        getResults: '&getResults',
        tradeshow: '='
      },
      template: '<ul class="pagination">'+
        '<li ng-show="currentPage != 1"><a href="javascript:void(0)" ng-click="getResults({num:1})">&laquo;</a></li>'+
        '<li ng-show="currentPage != 1"><a href="javascript:void(0)" ng-click="getResults({num:currentPage-1})">&lsaquo; Prev</a></li>'+
        '<li ng-repeat="i in getRange(totalPages) track by $index" ng-class="{active : currentPage-1 == $index}">'+
            '<a href="javascript:void(0)" ng-click="getResults({num:$index+1})">{{$index + 1}}</a>'+
        '</li>'+
        '<li ng-show="currentPage != totalPages"><a href="javascript:void(0)" ng-click="getResults({num:currentPage+1})">Next &rsaquo;</a></li>'+
        '<li ng-show="currentPage != totalPages"><a href="javascript:void(0)" ng-click="getResults({num:totalPages})">&raquo;</a></li>'+
      '</ul>',
      link: function(scope, elem, attrs) {
        scope.getRange = function(num) {
            return new Array(num);
        };
      }
   };
});

tsportal.directive("timeago", function() {
    return {
        restrict: 'E',
        scope: {
            time: '=',
        },
        template: '<span class="time-ago">{{getTimeAgo(time)}}</span>',
        link: function(scope, elem, attrs) {
            scope.getTimeAgo = function(time) {
                return moment(time, moment.ISO_8601).fromNow();
            }
        }
    };
});

tsportal.directive("markable", function() {
    return {
        link: function(scope, elem, attrs) {
            elem.on("click", function() {
                if (navigator.userAgent.match(/PhantomJS/g) === null) {
                    elem.siblings().removeClass('active');
                    elem.addClass("active");
                }
            });

        }
    };
});

tsportal.directive('bs', function() {
    return {
        link: function(scope, elem, attrs) {
            elem.
              bootstrapSwitch().
              on('switchChange.bootstrapSwitch', function(event, state) {
                this.checked = state;
                // relies on child scope to set the property name for the model, in order to update it.
                if (scope.hasOwnProperty('model') && scope.hasOwnProperty(scope.model)) {
                    scope[scope.model][elem.attr('name')] = state ? 1 : 0;
                }
              });
        }
    }
});

tsportal.directive('stateLoadingIndicator', ['busyService', '$rootScope', '$timeout', function(busyService, $rootScope, $timeout) {
  return {
    restrict: 'E',
    template: "<div ng-show='isStateLoading || busyServiceIsBusy' class='loading-indicator'>" +
    "<div class='loading-indicator-body'>" +
    "<h3 class='loading-title'>{{workingMessage}}...</h3>" +
    "<div class='spinner'><wave-spinner></wave-spinner></div>" +
    "</div>" +
    "</div>",
    replace: true,
    link: function(scope, elem, attrs) {
      scope.isStateLoading = false;

      $rootScope.$on('$stateChangeStart', function() {
        scope.isStateLoading = true;
        busyService.show();
      });
      $rootScope.$on('$stateChangeSuccess', function() {
        scope.isStateLoading = false;
      });
    }
  };
}]);

tsportal.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});

tsportal.directive('messages', function() {
    return {
        restrict: 'E',
        template:'<div class="row messages" ng-show="messages.length">' +
                '<div ng-repeat="message in messages" class="alert alert-{{message.type}} {{message.dismissible ? \'alert-dismissible\' : \'\'}}" role="alert" style="opacity: 0">' +
                    '<button type="button" class="close" ng-click="removeMessage(message.id)" data-dismiss="alert" aria-label="Close" ng-show="message.dismissible">' +
                        '<span aria-hidden="true">×</span>' +
                    '</button>' +
                    '<span class="glyphicon glyphicon-{{message.icon}} {{message.iconClass ? message.iconClass : \'\'}}" ng-show="message.hasOwnProperty(\'icon\')"></span>' +
                    '<span>{{message.message}}</span>' +
                '</div>' +
            '</div>',
        replace: true,
        link: function(scope, elem, attrs) {
        },
    };
});

tsportal.run(function ($http, CacheFactory) {
  if (!CacheFactory.get('defaultCache')) {
    CacheFactory('defaultCache', {
        maxAge: 15 * 60 * 1000, // Items added to this cache expire after 15 minutes
        cacheFlushInterval: 60 * 60 * 1000, // This cache will clear itself every hour
        deleteOnExpire: 'aggressive' // Items will be deleted from this cache when they expire
      });
  }
  $http.defaults.cache = CacheFactory.get('defaultCache');
});