(function() {

	'use strict';

	angular.module('slideMenuService', [])
		.provider('slideMenuService', slideMenuProvider);

	function slideMenuProvider() {
		this.menus = {};

		this.registerMenu = registerMenu;
		this.$get = slideMenuService;

		return this;

		/////////

		function registerMenu(name, config) {
			this.menus[name] = config;
		}

		function slideMenuService($rootScope) {
			var service = {
				menus: this.menus,
				buildMenu: buildMenu
			};
			
			activate();

			return service;

			/////////
			
			function activate() {
			}

			function buildMenu(config) {
				var html = '';
				for (var actionName in config.items) {
					var action 	= config.items[actionName],
						title 	= action.title || actionName,
						link 	= '<a title="' + title + '"',
						url 	= action.url,
						onClick = action.click,
						show	= action.show;

					if (url) {
						link += ' href="/#/' + url + '"';
					}
					else {
						link += ' href="javascript:void(0)"';
					}

					if (onClick) {
						link += ' ng-click="' + onClick + '"';
					}

					if (show) {
						link += ' ng-show="' + show + '"';
					}

					link += '>' + title + '</a>';

					html += '<li>' + link + '</li>';
				}

				return '<ul>' + html + '</ul>';
			}

		}
	}
})();
