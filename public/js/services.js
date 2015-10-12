(function() {
	var tradeshowServices = angular.module('tradeshowServices', ['ngResource']);
	tradeshowServices.factory('Tradeshow', ['$resource', function($resource) {
		return $resource('api/tradeshows/:tradeshowId', {tradeshowId: '@id'}, {
			list: {method: 'GET', params:{}, isArray: true, transformResponse: function(data) {
				var data = angular.fromJson(data);
				return data.tradeshows;
			}},
			query: {method: 'GET', isArray: false, transformResponse: function(data) {
				var data = angular.fromJson(data);
				return data.tradeshow;
			}},
			create: {method: 'POST', url:'api/tradeshows/create'},
			delete: {method: 'DELETE'}
		});
	}]);
	var leadServices = angular.module('leadServices', []);
	leadServices.factory('Lead', ['$resource', function ($resource) {
		return $resource('api/leads/:id', {id: '@id'});
	}])
	leadServices.factory('leadGetter', ['$http', function($http) {
		var currentTradeshowId = null,
			leads = [],
			current_page = 1,
			last_page = 0,
			pages = [];
		return {
			retreiveLeads: function(pageNumber, orderBy, orderByReverse, success) {
				if(pageNumber===undefined){
					pageNumber = '1';
				}
				if (orderBy===undefined) {
					orderBy = 'id';
				}
				if (orderByReverse==undefined) {
					orderByReverse = 0;
				}
				pages = [];
				return $http.
					get('api/tradeshows/' + currentTradeshowId + '/leads?page='+pageNumber+'&orderBy=' +orderBy + '&orderByReverse=' + parseInt(orderByReverse)).
					success(function(payload) {
						leads = payload.data;
						current_page = payload.current_page;
						last_page = payload.last_page;
						for(var i=1;i<=payload.last_page;i++) {          
							pages.push(i);
						}
						if (typeof success != "undefined") {
							success.apply(this, arguments);
						}
					});
			},
			retrieveSingleLead: function(lead_id, success) {
				return $http.
					get('api/leads/' + lead_id).
					success(success);
			},
			setCurrentTradeshowId:function(tradeshowId) {
				currentTradeshowId = tradeshowId;
			},
			getCurrentTradeshowId:function() {
				return currentTradeshowId;
			},
			getCurrentPage:function() {
				return current_page;
			},
			getLastPage:function() {
				return last_page;
			},
			getRange: function() {
				return pages;
			},
			getLeads: function() {
				return leads;
			}
		}
	}]);
})();