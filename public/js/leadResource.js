(function() {

	'use strict';

	angular
		.module('leadServices', [])
		.factory('Lead', Lead);

	function Lead($resource, CacheFactory) {
		return $resource('api/leads/:id', {id: '@id'}, {
			get: {cache: CacheFactory.get('defaultCache')}
		});
	}
})();
