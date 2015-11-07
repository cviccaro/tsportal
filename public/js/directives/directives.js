(function() {

    'use strict';

    angular.module('appDirectives', [])
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
        .directive('busyIndicator', function busyIndicatorDirective(busyService, $rootScope, $timeout) {
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
                        busyService.resetMessage();
                        isStateLoading = true;
                    });
                    $rootScope.$on('$stateChangeSuccess', function() {
                        isStateLoading = false;
                    });
                }

                function isBusy() {
                    return isStateLoading || busyService.isBusy();
                }
            }
        })
        .filter('unsafe', function($sce) {
            return function(val) {
                return $sce.trustAsHtml(val);
            };
        })
        .directive('messages', function messagesDirective(messageService, $rootScope, $timeout) {
            return {
                restrict: 'E',
                templateUrl: '../partials/messages.html',
                replace: true,
                link: function(scope, elem, attrs) {
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
                },
            };
        });
})();
