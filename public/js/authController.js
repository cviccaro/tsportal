(function($) {
	'use strict';

	angular.
		module('authControllers', ['satellizer']).
		controller('AuthController', ['$auth', '$state', '$scope', function($auth, $state, $scope) {
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
					then(function(data) {
						$state.go('tradeshows', {});
					},
					function(payload) {
						$scope.errors = [payload.statusText];
						//$('.form-error').html('The email or password entered was incorrect.');
					});
			};
		}]).
		controller('LogoutController', ['$auth', '$state', '$scope', function($auth, $state, $scope) {
			localStorage.removeItem('satellizer_token');
			$state.go('auth');
		}]);
})(jQuery);