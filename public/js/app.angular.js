'use strict';

var tsportal = angular.module('tsportal', [
    'ui.router',
    'satellizer',
    'tradeshowServices',
    'leadServices',
    'authControllers',
    'tradeshowControllers',
    'leadControllers',
    'angular-jwt',
    'angular-spinkit',
    'ngAnimate',
    'ngDialog'
]);

tsportal.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', 'jwtInterceptorProvider', '$authProvider',
    function($stateProvider, $urlRouterProvider, $httpProvider, jwtInterceptorProvider, $authProvider) {
        // Satellizer configuration that specifies which API
        // route the JWT should be retrieved from
        $authProvider.loginUrl = '/api/authenticate';

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
                controller: 'TradeshowController'
            }).
            state('tradeshowEdit', {
                url: '/tradeshows/:tradeshowId/edit',
                templateUrl: '../partials/tradeshow-detail.html',
                controller: 'TradeshowDetailController as tradeshowCtrl'
            }).
            state('tradeshowCreate', {
                url: '/tradeshows/create',
                templateUrl: '../partials/tradeshow-detail.html',
                controller: 'TradeshowCreateController as tradeshowCtrl'
            }).
            state('leadEdit', {
                url:'/leads/:id/edit',
                templateUrl: '../partials/lead-detail.html',
                controller: 'LeadController as leadCtrl'
            })
}]);

 // @credit http://blog.kettle.io/dynamic-pagination-angularjs-laravel/
tsportal.directive('tradeshowPagination', function(){  
   return{
      restrict: 'E',
      template: '<ul class="pagination">'+
        '<li ng-show="currentPage != 1"><a href="javascript:void(0)" ng-click="getTradeshows(1)">&laquo;</a></li>'+
        '<li ng-show="currentPage != 1"><a href="javascript:void(0)" ng-click="getTradeshows(currentPage-1)">&lsaquo; Prev</a></li>'+
        '<li ng-repeat="i in range" ng-class="{active : currentPage == i}">'+
            '<a href="javascript:void(0)" ng-click="getTradeshows(i)">{{i}}</a>'+
        '</li>'+
        '<li ng-show="currentPage != totalPages"><a href="javascript:void(0)" ng-click="getTradeshows(currentPage+1)">Next &rsaquo;</a></li>'+
        '<li ng-show="currentPage != totalPages"><a href="javascript:void(0)" ng-click="getTradeshows(totalPages)">&raquo;</a></li>'+
      '</ul>'
   };
});
tsportal.directive('leadPagination', function(){  
   return{
      restrict: 'E',
      template: '<ul class="pagination" ng-show="leadCurrentPage != undefined && leadTotalPages != undefined">'+
        '<li ng-show="leadCurrentPage != 1"><a href="javascript:void(0)" ng-click="refreshLeads(1)">&laquo;</a></li>'+
        '<li ng-show="leadCurrentPage != 1"><a href="javascript:void(0)" ng-click="refreshLeads(leadCurrentPage-1)">&lsaquo; Prev</a></li>'+
        '<li ng-repeat="i in leadRange" ng-class="{active : leadCurrentPage == i}">'+
            '<a href="javascript:void(0)" ng-click="refreshLeads(i)">{{i}}</a>'+
        '</li>'+
        '<li ng-show="leadCurrentPage != leadTotalPages"><a href="javascript:void(0)" ng-click="refreshLeads(leadCurrentPage+1)">Next &rsaquo;</a></li>'+
        '<li ng-show="leadCurrentPage != leadTotalPages"><a href="javascript:void(0)" ng-click="refreshLeads(leadTotalPages)">&raquo;</a></li>'+
      '</ul>'
   };
});
//@credit: http://stackoverflow.com/questions/21287845/adding-a-css-class-to-element-on-ng-click
tsportal.directive("markable", function() {
    return {
        link: function(scope, elem, attrs) {
            elem.on("click", function() {
                elem.siblings().removeClass('active');
                elem.addClass("active");
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

tsportal.directive('stateLoadingIndicator', function($rootScope) {
  $rootScope.workingMessage = 'Loading';
  return {
    restrict: 'E',
    template: "<div ng-show='isStateLoading' class='loading-indicator'>" +
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
      });
      $rootScope.$on('$stateChangeSuccess', function() {
        var s = scope;
        setTimeout(function() {
            s.isStateLoading = false;
        },0);
      });
    }
  };
});

tsportal.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
});
