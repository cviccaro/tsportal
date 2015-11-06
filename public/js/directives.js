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
        .directive('messages', function(messageService, $rootScope) {
            return {
                restrict: 'E',
                templateUrl: '../partials/messages.html',
                replace: true,
                link: function(scope, elem, attrs) {
                    var vm = scope.hasOwnProperty('ctrl') ? scope.ctrl : scope;

                    // Purge leftover messages on a state change
                    $rootScope.$on('$stateChangeSuccess', function() {
                        messageService.purge();
                    });
                    
                    // Update messages variable on controller scope
                    scope.$watch(function () { return messageService.getMessages(); }, function (newVal, oldVal) {
                        if (typeof newVal !== 'undefined') {
                            vm.messages = messageService.getMessages();
                        }
                    });

                    // Add removeMessage function to scope
                    vm.removeMessage = function(message_id) {
                        messageService.removeMessage(message_id);
                    };
                },
            };
        });
})();
