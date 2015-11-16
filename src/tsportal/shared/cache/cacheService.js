(function() {

	'use strict';

	angular.module('tsportal.cache')
		.factory('CachingService', CachingService);

	function CachingService(CacheFactory) {
		var service = {
			createNewCache: createNewCache,
			getCache: getCache
		};

		return service;

		/////////
	
		function createNewCache(name, config) {
			return new CacheFactory(name, config);
		}

		function getCache(name) {
			return CacheFactory.get(name);
		}
	}
})();
