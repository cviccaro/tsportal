(function() {

  'use strict';

  angular.module('tsportal.pager')
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
        templateUrl: '../views/pagerView.html',
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
