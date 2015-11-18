angular.module('mockCacheFactory', [])
	.factory('CacheFactory', mockCacheFactory);

function mockCacheFactory() {
	var caches = {};

	var service = {
		get: getCache
	};

	return service;

	/////////
	function getCache(cacheName) {
		if (!caches.hasOwnProperty(cacheName)) {
			caches[cacheName] = {};
		}
		return {
			get: function(key) { 
				return caches[cacheName][key];
			},
			put: function(key, val) {
				caches[cacheName][key] = val;
				return val;
			},
			remove: function(key) {
				delete caches[cacheName][key];
			} 
		};
	}
}