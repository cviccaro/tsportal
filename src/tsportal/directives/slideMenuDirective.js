(function() {

	'use strict';

	angular.module('tsportalDirectives')
		.directive('slideMenu', slideMenuDirective);

	function slideMenuDirective($timeout, $rootScope, slideMenuService, $compile) {
		var directive = {
			restrict: 'E',
			replace: true,
			transclude: true,
			templateUrl: '../partials/slide-menu-directive.html',
			link: slideMenuDirectiveLink
		};

		return directive;

		////////
		
		function slideMenuDirectiveLink($scope, elem, attrs) {
			$scope.alignment = $scope.alignment || (window.outerWidth <= 768 ? "bottom" : "right");

			var slideMenu = {
				hide: function() {
					elem.removeClass('visible');
				},
				show: function() {
					elem.addClass('visible');
				},
				setAlignment: function(pos) {
					$scope.alignment = pos;
					elem.attr('alignment', pos);
				}
			};

			$scope.openMenu = openMenu;
			$scope.closeMenu = closeMenu;
			$scope.setAlignment = setAlignment;

			activate();

			/////////
			
			function activate() {
				$rootScope.$on('$stateChangeStart', function() {
					slideMenu.hide();
				});
			}

			function closeMenu() {
				slideMenu.hide();
			}

			function openMenu(menuName, obj) {
				if (slideMenuService.menus && slideMenuService.menus.hasOwnProperty(menuName)) {
					$scope[menuName] = obj;
					var menu = slideMenuService.menus[menuName];
					
					var compiledTitle = $compile('<h3>' + menu.title + '</h3>')($scope);

					elem.find('h3').html(compiledTitle);

					var built = slideMenuService.buildMenu(menu, obj);
					var compiled = $compile(built)($scope);
					elem.find('.slide-menu-content').html(compiled);

					slideMenu.show();
				}
			}

			function setAlignment(pos) {
				slideMenu.setAlignment(pos);
			}
		}
	}
})();
