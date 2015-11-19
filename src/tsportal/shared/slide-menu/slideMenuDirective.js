(function() {

	'use strict';

	angular.module('tsportal.slideMenu')
		.directive('slideMenu', slideMenuDirective);

	function slideMenuDirective($timeout, $rootScope, slideMenuService, $compile, $document, $window) {
		var directive = {
			restrict: 'E',
			replace: true,
			transclude: true,
			templateUrl: 'shared/slide-menu/slideMenuView.html',
			link: slideMenuDirectiveLink
		};

		return directive;

		////////
		
		function slideMenuDirectiveLink($scope, elem, attrs) {
			var slideMenu, activeMenu;

			$scope.openMenu = openMenu;
			$scope.closeMenu = closeMenu;
			$scope.slideMenuClasses = slideMenuCssClasses;
			
			activate();

			/////////
			
			function activate() {

				slideMenu = {
					hide: function() {
						elem.removeClass('visible');
					},
					show: function() {
						elem.addClass('visible');
					}
				};

				$scope.slideMenuAlignment = attrs.slideMenuAlignment || ($window.outerWidth <= 768 ? "bottom" : "right");

				// Hide menu on state change
				$rootScope.$on('$stateChangeStart', function() {
					$scope.closeMenu();
				});

				// Hide menu on ESC
				$document.bind('keyup', function(e) {
				     if (e.which === 27) {
				   		$scope.closeMenu();	
				     }
				});

				// Recalculate classes on resize if activeMenu calls for it
				angular.element($window).on('resize', function () {
					if (activeMenu && activeMenu.responsive) {
						$scope.$apply();
					}
				});
			}

			function closeMenu() {
				slideMenu.hide();
			}

			function openMenu(menuName, objMap) {
				if (slideMenuService.menus && slideMenuService.menus.hasOwnProperty(menuName)) {
					for (var key in objMap) {
						$scope[key] = objMap[key];
					}
					var menu = slideMenuService.menus[menuName];
					
					if (typeof menu.alignment == "undefined" && typeof $scope.slideMenuAlignment != "undefined") {
						menu.alignment = $scope.slideMenuAlignment;
					}
					activeMenu = menu;

					var compiledTitle = $compile('<h5 class="slide-menu-title bg-primary">' + menu.title + '</h5>')($scope);

					elem.find('h5').replaceWith(compiledTitle);

					var built = slideMenuService.buildMenu(menu);
					var compiled = $compile(built)($scope);
					
					$timeout(function() {
						elem.find('.slide-menu-content').html(compiled);
						slideMenu.show();
					});
				}
			}

			function slideMenuCssClasses() {
				var cssClasses = [];
				if (activeMenu === undefined) {
					activeMenu = {
						responsive: false,
						alignment: $scope.slideMenuAlignment
					};
				}

				if (activeMenu.responsive === true) {
					if ($window.outerWidth >= 768) {
						cssClasses.push('menu-right');
					}
					else {
						cssClasses.push('menu-bottom');
					}
				}
				else {
					cssClasses.push('menu-' + activeMenu.alignment);
				}
				
				return cssClasses.join(' ');
			}
		}
	}
})();
