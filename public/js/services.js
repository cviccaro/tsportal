(function() {
	/**
	 * JWT Refresh Service
	 * -------------------
	 * Provides 2 simple methods any controller can call to check API access
	 * and refresh token if necessary
	 *
	 * @method checkApiAccess()
	 *         Check API token in localStorage, refresh if possible and needed,
	 *         otherwise route to auth page
	 *
	 * 			@return {[void]}
	 * @method refresh(token)     
	 *         Use the passed-in (perhaps expired) token to refresh the token using
	 *         the API
	 *
	 *         @param token - An api token
	 *         @return {[$promise]}: a $q promise
	 */
	var jwtRefreshService = angular.module('jwtRefreshService', []);
	jwtRefreshService.factory('jwtRefreshService', ['$http', 'authService', '$state', '$rootScope', function($http, authService, $state, $rootScope) {
		return {
			refresh: function(token) {
				$http({
					method: 'GET',
					url: 'api/authenticate/refresh',
					headers: {
						'Authorization': 'Bearer ' + token
					}
				}).then(function(payload) {
					localStorage.setItem('satellizer_token', payload.data.token);
					// Save a copy of the token to use for future refresh requests
					localStorage.setItem('_satellizer_token', payload.data.token);
					$rootScope.isLoggedIn = true;
					authService.loginConfirmed();
				})
			},
			checkApiAccess: function() {
				if (localStorage.getItem('satellizer_token') == null) {
					if (localStorage.getItem('_satellizer_token') != null) {
						// Try to refresh
						this.refresh(localStorage.getItem('_satellizer_token'));
					}
					else {
						// Go to auth view
						$state.go('auth', {});
						$('.loading-indicator').fadeOut(100).addClass('ng-hide');
					}
				}
			}
		}
	}]);
	
	var loginService = angular.module('loginService',[]);
	loginService.factory('loginService', function loginService() {
		return {
			isValidEmail: function(email) {
				var pattern = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    return pattern.test(email);
			}
		};
	});

	/**
	 * Tradeshow Services module
	 */
	var tradeshowServices = angular.module('tradeshowServices', ['ngResource']);

	// Tradeshow Resource using angular-resource
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

	// Tradeshow service to retrieve paginated, sorted lists of Tradeshows
	tradeshowServices.factory('tradeshowService', ['$http', 'Tradeshow', '$rootScope', 'ngDialog', function($http, Tradeshow, $rootScope, ngDialog) {
		var tradeshows = [],
			current_page = 1,
			last_page = 0,
			pages = [],
			activeDialog;
			return {
				retrieve: function retrieve(pageNumber, perPage, orderBy, orderByReverse, success) {
					if(pageNumber===undefined){
						pageNumber = '1';
					}
					if (orderBy===undefined) {
						orderBy = 'id';
					}
					if (orderByReverse===undefined) {
						orderByReverse = 0;
					}
					if (perPage===undefined) {
						perPage = 15;
					}
					return $http.
						get('api/tradeshows?page='+pageNumber+'&perPage=' + perPage + '&orderBy=' + orderBy + '&orderByReverse=' + parseInt(orderByReverse)).
						then(function(payload) {
							var response = payload.data;

							tradeshows = response.data;
							current_page = response.current_page;
							last_page = response.last_page;
							pages = [];
							for(var i=1;i<=response.last_page;i++) {          
								pages.push(i);
							}
							if (typeof success != "undefined") {
								success.apply(this, arguments);
							}
						},
						function(payload) {
							console.log('error getting tradeshows: ', payload)
						});
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
				getTradeshows: function() {
					return tradeshows;
				},
				deleteTradeshow: function deleteTradeshow(tradeshow) {
					var tradeshow_name = tradeshow.name,
						tradeshow_id   = tradeshow.id;
					activeDialog = ngDialog.openConfirm(
						{	
							plain: true, 
							className: 'dialog-destroy ngdialog-theme-default',
							template: '<span class="glyphicon glyphicon-trash red icon-large"></span><span>Are you sure you want to delete Tradeshow <em>' + tradeshow_name + '</em>?<br /><strong>This cannot be undone.</strong></span><div class="dialog-buttons"><button class="btn btn-danger" ng-click="confirm()">Yes, delete</button> <button class="btn btn-cancel" ng-click="closeThisDialog()">Cancel</button></div>',
							showClose: false
						}
					).
					then(function() {
						$rootScope.workingMessage = 'Deleting';
						$('.loading-indicator').removeClass('ng-hide').fadeIn(100);
						Tradeshow.
							delete({tradeshowId:tradeshow_id}).
							$promise.
							then(function(payload) {
								$('.loading-indicator').fadeOut(100).addClass('ng-hide');
								if (payload.hasOwnProperty('success') && payload.success == true) {
									ngDialog.open({
										plain: true,
										className: 'dialog-success ngdialog-theme-default',
										template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Tradeshow <em>' + tradeshow_name + '</em> has been successfully deleted.</span>',
									})
									.closePromise
									.then(function() {
										window.location.reload();
									})
								}
								else {
									ngDialog.open({
										plain: true,
										className: 'dialog-error ngdialog-theme-default',
										template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
									})
								}
							}, function(errorResponse) {
								$('.loading-indicator').fadeOut(100).addClass('ng-hide');
								ngDialog.open({
									plain: true,
									className: 'dialog-error ngdialog-theme-default',
									template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Tradeshow <em>' + tradeshow_name + '</em>.</span>  Please try again or contact support.',
								})
							})
					})
				}
			};
	}]);


	/**
	 * Lead Services module
	 */
	var leadServices = angular.module('leadServices', []);

	// Lead Resource using angular-resource
	leadServices.factory('Lead', ['$resource', function ($resource) {
		return $resource('api/leads/:id', {id: '@id'});
	}]);

	// Lead service for fetching paginated, sorted lists of Leads
	leadServices.factory('leadService', ['$http', 'Lead', 'ngDialog', '$rootScope', function($http, Lead, ngDialog, $rootScope) {
		var currentTradeshowId = null,
			leads = [],
			current_page = 1,
			last_page = 0,
			pages = [],
			activeDialog;
		return {
			retrieveLeads: function(pageNumber, perPage, orderBy, orderByReverse, success) {
				if(pageNumber===undefined){
					pageNumber = '1';
				}
				if (orderBy===undefined) {
					orderBy = 'id';
				}
				if (orderByReverse===undefined) {
					orderByReverse = 0;
				}
				if (perPage===undefined) {
					perPage = 15;
				}
				return $http.
					get('api/tradeshows/' + currentTradeshowId + '/leads?page='+pageNumber+'&perPage='+perPage+'&orderBy=' +orderBy + '&orderByReverse=' + parseInt(orderByReverse)).
					success(function(payload) {
						leads = payload.data;
						current_page = payload.current_page;
						last_page = payload.last_page;
						pages = [];
						for(var i=1;i<=payload.last_page;i++) {          
							pages.push(i);
						}
						if (typeof success != "undefined") {
							success.apply(this, arguments);
						}
					});
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
			},
			deleteLead: function deleteLead(lead) {
				var lead_name = lead.first_name + ' ' + lead.last_name;
				activeDialog = ngDialog.openConfirm(
					{	
						plain: true, 
						className: 'dialog-destroy ngdialog-theme-default',
						template: '<span class="glyphicon glyphicon-trash red icon-large"></span><span>Are you sure you want to delete Lead <em>' + lead_name + '</em>?<br /><strong>This cannot be undone.</strong></span><div class="dialog-buttons"><button class="btn btn-danger" ng-click="confirm()">Yes, delete</button> <button class="btn btn-cancel" ng-click="closeThisDialog()">Cancel</button></div>',
						showClose: false
					}
				).
				then(function() {
					$rootScope.workingMessage = 'Deleting';
					$('.loading-indicator').removeClass('ng-hide').fadeIn(100);
					Lead.
						delete({id:lead.id}).
						$promise.
						then(function(payload) {
							$('.loading-indicator').fadeOut(100).addClass('ng-hide');
							if (payload.hasOwnProperty('success') && payload.success == true) {
								ngDialog.open({
									plain: true,
									className: 'dialog-success ngdialog-theme-default',
									template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Lead <em>' + lead_name + '</em> has been successfully deleted.</span>',
								})
								.closePromise
								.then(function() {
									window.location.reload();
								})
							}
							else {
								ngDialog.open({
									plain: true,
									className: 'dialog-error ngdialog-theme-default',
									template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Lead <em>' + lead_name + '</em>.</span>  Please try again or contact support.',
								})
							}
						}, function(errorResponse) {
							$('.loading-indicator').fadeOut(100).addClass('ng-hide');
							ngDialog.open({
								plain: true,
								className: 'dialog-error ngdialog-theme-default',
								template: '<span class="glyphicon glyphicon-exclamation-sign red icon-large"></span><span>An error occured when trying to delete Lead <em>' + lead_name + '</em>.</span>  Please try again or contact support.',
							})
						})
				})
			}
		}
	}]);
})();