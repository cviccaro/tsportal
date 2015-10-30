(function($) {
	'use strict';

	angular.
		module('authControllers', ['satellizer']).
		controller('AuthController',
			['$state', '$scope', '$rootScope', 'loginService', 'busyService', 'messageService',
			function($state, $scope, $rootScope, loginService, busyService, messageService) {

			// Watch messageService messages
			$scope.$watch(function () { return messageService.messages; }, function (newVal, oldVal) {
			    if (typeof newVal !== 'undefined') {
			        $scope.messages = messageService.messages;
			    }
			});

			// Respond to 401 unauthorized
			$rootScope.$on('event:auth-loginRequired', function(event, data) {
				$scope.loginError();
			});

			// If a token is already stored, try app
			if (loginService.token.get() !== null) {
				$state.go('tradeshows', {});
			}

			// Ensure loading indicator is hidden
			busyService.hide();

			/**
			 * Login
			 *
			 * Use loginService to login
			 *
			 * @return {[void]}
			 */
			$scope.login = function login() {
				var credentials = {
					email: $scope.email,
					password: $scope.password
				};
				busyService.show();
				// Use satellizer's $auth service to login
				loginService.login(credentials)
					.then(function authLoginSuccess(payload) {
						busyService.hide();
						// set a copy of the token to use for refresh requests
						loginService.tokenCopy.set(payload.data.token);
						$state.go('tradeshows', {});
					})
					.catch(function authLoginFail(payload) {
						$scope.loginError();
					});
			};

			/**
			 * Show a login error
			 * @param  {[type]} loginService [description]
			 * @return {[void]}
			 */
			$scope.loginError = function() {
				messageService.purge();
				messageService.addMessage({
					type: 'danger',
					icon: 'exclamation-sign',
					message: 'The email or password entered was incorrect.',
					dismissible: true,
					iconClass: '',
				})

				busyService.hide();
			}

			/**
			 * Clear errors
			 * @return {[void]}
			 */
			$scope.clearErrors = function() {
				if ($scope.messages.length) {
					for (var i = 0, msg; msg = $scope.messages[i]; i++) {
						messageService.removeMessage(msg.id);
					}
				}
			}

			/**
			 * Remove a message from messageService.
			 * @param  {[type]} message_id [description]
			 * @return {[void]}
			 */
			$scope.removeMessage = function(message_id) {
				messageService.removeMessage(message_id);
			};

		}]).
		controller('LogoutController', ['loginService', function(loginService) {
			loginService.logout();
		}]);
})(jQuery);