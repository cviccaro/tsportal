(function() {

    'use strict';

    angular.module('tsportal.timeago')
        .directive("timeago", timeagoDirective);

    function timeagoDirective() {
        var directive = {
            restrict: 'E',
            scope: {
                time: '=',
            },
            template: '<span class="time-ago">{{getTimeAgo(time)}}</span>',
            link: timeagoDirectiveLink
        };

        return directive;

        /////////
    
        function timeagoDirectiveLink(scope, elem, attrs) {
            scope.getTimeAgo = function(time) {
                return moment(time, moment.ISO_8601).fromNow();
            };
        }
    }    
})();
