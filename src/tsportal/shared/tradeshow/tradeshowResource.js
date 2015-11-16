(function() {

	'use strict';

	angular
		.module('tsportal.tradeshow')
		.factory('Tradeshow', Tradeshow);

	function Tradeshow($resource, CachingService) {
		return $resource('api/tradeshows/:id', {id: '@id'}, {
			get: {cache: CachingService.getCache('defaultCache')},
			create: {method: 'POST', url:'api/tradeshows/create'},
			delete: {method: 'DELETE'}
		});
	}
})();
