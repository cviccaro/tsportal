(function($) {
	'use strict';

	angular.
		module('authControllers', ['satellizer']).
		controller('AuthController', ['$auth', '$state', '$scope', function($auth, $state, $scope) {
			if (localStorage.getItem('satellizer_token') != null) {
				$state.go('tradeshows', {});
			}
			$scope.login = function login() {
				var credentials = {
					email: $scope.email,
					password: $scope.password
				};

				// Use satellizer's $auth service to login
				$auth.
					login(credentials).
					then(function(data) {
						$state.go('tradeshows', {});
					})
			};
		}]).
		controller('LogoutController', ['$auth', '$state', '$scope', function($auth, $state, $scope) {
			localStorage.removeItem('satellizer_token');
			$state.go('auth');
		}]);
})(jQuery);