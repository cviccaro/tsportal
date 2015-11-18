(function() {

    'use strict';

    angular.module('tsportal.busyIndicator')
        .directive('busyIndicator', busyIndicatorDirective);

    function busyIndicatorDirective(busyService, $rootScope, $timeout) {
        var isAppBusy       = false,
            isStateLoading  = true;

        var directive = {
            restrict: 'E',
            templateUrl: 'shared/busy-indicator/busyIndicatorView.html',
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
