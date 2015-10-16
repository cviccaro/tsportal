(function($) {
	'use strict';

	angular.
		module('authControllers', ['satellizer']).
		controller('AuthController', ['$auth', '$state', '$scope', '$rootScope', function($auth, $state, $scope, $rootScope) {
			$scope.errors = [];
			if (localStorage.getItem('satellizer_token') != null) {
				$state.go('tradeshows', {});
			}
			$('.loading-indicator').fadeOut(100).addClass('ng-hide');
			$scope.login = function login() {
				$scope.errors = [];
				var credentials = {
					email: $scope.email,
					password: $scope.password
				};

				// Use satellizer's $auth service to login
				$auth.
					login(credentials).
					then(function(payload) {
						// set a copy of the token to use for refresh requests
						localStorage.setItem('_satellizer_token', payload.data.token);
						$state.go('tradeshows', {});
					},
					function(payload) {
						$scope.errors = [payload.statusText];
						//$('.form-error').html('The email or password entered was incorrect.');
					});
			};
		}]).
		controller('LogoutController', ['$auth', '$state', '$scope', function($auth, $state, $scope) {
			$auth.logout();
			$state.go('auth');
		}]);
})(jQuery);