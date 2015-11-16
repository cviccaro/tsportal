(function() {

	'use strict';

	angular
		.module('tsportal.lead')
		.factory('Lead', Lead);

	function Lead($resource, CachingService) {
		return $resource('api/leads/:id', {id: '@id'}, {
            index: {method: 'GET', url: 'api/tradeshows/:tradeshowId/leads', params:{tradeshowId: '@tradeshowId'}},
			get: {cache: CachingService.getCache('defaultCache')}
		});
	}
})();
