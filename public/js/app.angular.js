'use strict';

var tsportal = angular.module('tsportal', [
    // Contrib
    'ui.router',
    'angular-jwt',
    'angular-spinkit',
    'ngAnimate',
    'ngDialog',
    'angular-cache',

    // Custom
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
.directive("timeago", function() {
    return {
        restrict: 'E',
        scope: {
            time: '=',
        },
        template: '<span class="time-ago">{{getTimeAgo(time)}}</span>',
        link: function(scope, elem, attrs) {
            scope.getTimeAgo = function(time) {
                return moment(time, moment.ISO_8601).fromNow();
            };
        }
    };
})
.directive("clickable", function() {
    return {
        link: function(scope, elem, attrs) {
            elem.addClass("clickable");
            elem.on("click", function() {
                if (navigator.userAgent.match(/PhantomJS/g) === null) {
                    elem.siblings().removeClass('active');
                    elem.addClass("active");
                }
            });

        }
    };
})
.directive('bs', function() {
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
    };
})
.directive('stateLoadingIndicator', function(busyService, $rootScope, $timeout) {
  return {
    restrict: 'E',
    templateUrl: '../partials/loading-indicator.html',
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
})
.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
})
.directive('messages', function(messageService) {
    return {
        restrict: 'E',
        templateUrl: '../partials/messages.html',
        replace: true,
        link: function(scope, elem, attrs) {
            // Update messages variable on controller scope
            scope.$watch(function () { return messageService.messages; }, function (newVal, oldVal) {
                if (typeof newVal !== 'undefined') {
                    scope.messages = messageService.messages;
                }
            });

            // Add removeMessage function to scope
            scope.removeMessage = function(message_id) {
                messageService.removeMessage(message_id);
            };
        },
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