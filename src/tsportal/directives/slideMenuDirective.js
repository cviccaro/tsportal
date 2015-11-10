(function() {

	'use strict';

	angular.module('tsportalDirectives')
		.directive('slideMenu', slideMenuDirective);

	function slideMenuDirective($timeout, $rootScope) {
		var directive = {
			restrict: 'E',
			scope: {
				alignment: '@'
			},
			replace: true,
			transclude: true,
			templateUrl: '../partials/slide-menu-directive.html',
			link: slideMenuDirectiveLink
		};

		return directive;

		////////
		
		function slideMenuDirectiveLink(scope, elem, attrs) {
			scope.slideMenu = {
				hideMenu: function() {
					elem.removeClass('visible');
				},
				showMenu: function() {
					elem.addClass('visible');
				},
				setAlignment: function(pos) {
					scope.alignment = pos;
					elem.attr('alignment', pos);
				}
			};
			// $timeout(function() {
			// 	scope.slideMenu.showMenu();
			// },500);


		}
	}
})();
