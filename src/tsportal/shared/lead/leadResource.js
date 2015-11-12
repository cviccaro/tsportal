(function() {

	'use strict';

	angular
		.module('tsportal.lead')
		.factory('Lead', Lead);

	function Lead($resource, CacheFactory) {
		return $resource('api/leads/:id', {id: '@id'}, {
            index: {method: 'GET', url: 'api/tradeshows/:tradeshowId/leads', params:{tradeshowId: '@tradeshowId'}},
			get: {cache: CacheFactory.get('defaultCache')}
		});
	}
})();
