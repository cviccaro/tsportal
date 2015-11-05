'use strict';

angular
.module('authControllers')
.controller('AuthController',
	function($state, $scope, $rootScope, loginService, busyService, messageService) {
		// If a token is already stored, try app
		loginService.checkApiAccess().then(function() {
			$state.go('tradeshows', {});
		});

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
				.then(function(payload) {
					$state.go('tradeshows', {});
				})
				.catch(function(payload) {
					$scope.loginError();
				});
		};

		/**
		 * Show a login error
		 */
		$scope.loginError = function() {
			messageService.purge();
			messageService.addMessage({
				type: 'danger',
				icon: 'exclamation-sign',
				message: 'The email or password entered was incorrect.',
				dismissible: true,
				iconClass: '',
			});

			busyService.hide();
		};

		/**
		 * Clear errors
		 * @return {[void]}
		 */
		$scope.clearErrors = function() {
			if ($scope.messages.length) {
				for (var i = 0, msg; (msg = $scope.messages[i]); i++) {
					messageService.removeMessage(msg.id);
				}
			}
		};
	}
)
.controller('LogoutController', function(loginService) {
	loginService.logout();
});