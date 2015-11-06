(function() {

	'use strict';

	angular
		.module('tradeshowServices', ['ngResource'])
		.factory('Tradeshow', Tradeshow);

	function Tradeshow($resource, CacheFactory) {
		return $resource('api/tradeshows/:tradeshowId', {tradeshowId: '@id'}, {
			get: {cache: CacheFactory.get('defaultCache')},
			create: {method: 'POST', url:'api/tradeshows/create'},
			delete: {method: 'DELETE'}
		});
	}
})();
