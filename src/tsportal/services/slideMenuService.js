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

		function slideMenuService() {
			var service = {
				menus: this.menus,
				buildMenu: buildMenu
			};
			
			return service;

			/////////
			
			function buildMenu(config, obj) {
				var html = '';
				for (var actionName in config.items) {
					var action 	= config.items[actionName],
						title 	= action.title || actionName,
						link 	= '<a title="' + title + '"';

					if (action.hasOwnProperty('url')) {
						link += ' href="/#/' + action.url + '"';
					}
					else {
						link += ' href="javascript:void(0)"';
					}

					if (action.hasOwnProperty('click')) {
						link += ' ng-click="' + action.click + '"';
					}

					link += '>' + title + '</a>';

					html += '<li>' + link + '</li>';
				}

				return '<ul>' + html + '</ul>';
			}

		}
	}
})();
