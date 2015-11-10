(function() {

  'use strict';

  angular.module('tsportalDirectives')
    .directive('pager', pagerDirective);

  function pagerDirective() {
     var directive = {
        restrict: 'E',
        scope: {
          currentPage: '=',
          totalPages: '=',
          getResults: '&getResults',
          tradeshow: '='
        },
        templateUrl: '../partials/pager.html',
        link: pagerDirectiveLink
     };

     return directive;

     /////////
   
     function pagerDirectiveLink(scope, elem, attrs) {
        scope.getRange = function(num) {
          return new Array(num);
        };
    }
  }
})();
