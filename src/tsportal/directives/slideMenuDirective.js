(function() {

	'use strict';

	angular.module('tsportalDirectives')
		.directive('slideMenu', slideMenuDirective);

	function slideMenuDirective($timeout, $rootScope, slideMenuService, $compile, $document) {
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
			var slideMenu;

			$scope.openMenu = openMenu;
			$scope.closeMenu = closeMenu;
			$scope.setAlignment = setAlignment;

			activate();

			/////////
			
			function activate() {
				slideMenu = {
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

				$scope.alignment = $scope.alignment || (window.outerWidth <= 768 ? "bottom" : "right");

				$rootScope.$on('$stateChangeStart', function() {
					slideMenu.hide();
				});
				$document.bind('keyup', function(e) {
				     if (e.which === 27) {
				   		slideMenu.hide();  	
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
					
					var compiledTitle = $compile('<h5 class="slide-menu-title">' + menu.title + '</h5>')($scope);

					elem.find('h5').replaceWith(compiledTitle);

					var built = slideMenuService.buildMenu(menu);
					var compiled = $compile(built)($scope);
					
					$timeout(function() {
						elem.find('.slide-menu-content').html(compiled);
						slideMenu.show();
					});
				}
			}

			function setAlignment(pos) {
				slideMenu.setAlignment(pos);
			}
		}
	}
})();
