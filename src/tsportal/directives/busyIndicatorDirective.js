(function() {

    'use strict';

    angular.module('tsportalDirectives', [])
        .directive('busyIndicator', busyIndicatorDirective);

    function busyIndicatorDirective(busyService, $rootScope, $timeout) {
        var isAppBusy       = false,
            isStateLoading  = true;

        var directive = {
            restrict: 'E',
            templateUrl: '../partials/busy-indicator.html',
            replace: true,
            link: busyIndicatorDirectiveLink
        };

        return directive;

        /////////

        function busyIndicatorDirectiveLink(scope, elem, attrs) {
            $rootScope.isBusy = isBusy;

            activate();

            /////////

            function activate() {
                $rootScope.$on('$stateChangeStart', function() {
                    console.log(scope);
                    busyService.resetMessage();
                    busyService.show();
                });
                $rootScope.$on('$stateChangeSuccess', function() {
                    busyService.hide();
                });
            }

            function isBusy() {
                return busyService.isBusy();
            }
        }
    }
})();
