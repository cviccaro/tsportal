(function() {

	'use strict';

	angular.module('tsportal.tradeshow')
		.directive('tradeshow', tradeshowDirective);

	function tradeshowDirective() {
		var directive = {
			restrict: 'EA',
			scope: {
				tradeshow: '=model'
			},
			replace: true,
			priority: 1001, // Fix for ng-repeat
			templateUrl: 'shared/tradeshow/tradeshowDirectiveView.html'
		};

		return directive;
	}
})();
