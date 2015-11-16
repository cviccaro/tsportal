(function() {

	'use strict';

	angular.module('tsportal.lead')
		.directive('lead', leadDirective);

	function leadDirective() {
		var directive = {
			restrict: 'EA',
			scope: {
				lead: '=model'
			},
			priority: 1001, // Fix for ng-repeat
			replace: true,
			templateUrl: '../views/leadDirectiveView.html'
		};

		return directive;
	}
})();
