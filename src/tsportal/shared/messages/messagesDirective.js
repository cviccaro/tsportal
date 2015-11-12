(function() {

    'use strict';

    angular.module('tsportal.messages')
        .directive('messages', messagesDirective);

    function messagesDirective(messageService, $rootScope, $timeout) {

        var directive = {
            restrict: 'E',
            templateUrl: '../views/messagesView.html',
            replace: true,
            link: messagesDirectiveLink
        };

        return directive;

        /////////
    
        function messagesDirectiveLink(scope, elem, attrs) {
            var vm = scope.hasOwnProperty('ctrl') ? scope.ctrl : scope;

            scope.$watch(function () { return messageService.getMessages(); }, function(newVal, oldVal) {
                if (typeof newVal !== "undefined") {
                    vm.messages = newVal;
                }
            });

            $rootScope.$on('$stateChangeSuccess', function() {
                messageService.purge();
            });

            vm.addMessage = function addMessage(config) {
                config = messageService.addMessage(config);
                $timeout(function() {
                    $(".messages .alert[message-id="+config.id+"]").addClass("in");
                });
            };

            vm.removeMessage = function removeMessage(id) {
                $(".messages .alert[message-id="+id+"]").on("transitionend", function() {
                    scope.$apply();
                })
                .css('opacity', 0);
                $timeout(function() {
                    messageService.removeMessage(id);
                });
            };

            vm.addSuccessMessage = function addSuccessMessage(config) {
                var defaults = {
                    icon: 'ok',
                    type: 'success',
                    iconClass: 'icon-medium',
                    dismissible: true,
                    message: 'Your changes have been saved'
                };

                config = $.extend(defaults, config);

                return vm.addMessage(config);
            };

            vm.addErrorMessage = function addErrorMessage(config) {
                var defaults = {
                    type: 'danger',
                    dismissible: true,
                    icon: 'exclamation-sign',
                    iconClass: 'icon-medium',
                    message: "Sorry, something went wrong."
                };

                config = $.extend(defaults, config);

                return vm.addMessage(config);
            };

            vm.purgeMessages = function purgeMessages() {
                messageService.purge();
            };
        }
    }
})();
