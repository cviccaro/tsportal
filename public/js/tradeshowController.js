(function($) {
	'use strict';

	var tradeshowControllers = angular.module('tradeshowControllers', ['ngDialog']);

	/**
	 * Tradeshow List Controller
	 * @class TradeshowController
	 * ------------------------------------------------------
	 * Displays a paginated, filtered table of all tradeshows.
	 */
	tradeshowControllers.controller('TradeshowController',
		['$rootScope', '$scope', 'Tradeshow', 'tradeshowService', 'leadService', 'loginService', 'ngDialog', 'busyService', '$q', '$auth', 'messageService',
		function TradeshowController($rootScope, $scope, Tradeshow, tradeshowService, leadService, loginService, ngDialog, busyService, $q, $auth, messageService) {

		// Watch messageService messages
		$scope.$watch(function () { return messageService.messages; }, function (newVal, oldVal) {
		    if (typeof newVal !== 'undefined') {
		        $scope.messages = messageService.messages;
		    }
		});

		// Get the scoped tradeshow when we are confirmed to have a valid token
		$rootScope.$on('event:auth-logged-in', function() {
			$scope.getTradeshows().then(function() {
				busyService.hide();
			})
			.catch(function(payload) {
				busyService.hide();
				messageService.addMessage({
					type: 'danger',
					dismissible: true,
					icon: 'exclamation-sign',
					iconClass: 'icon-medium',
					message: "Sorry, something went wrong.",
				});
			});
		});


		// Refresh authorization token when it is expired transparently to the user
		// and re-run the request that failed (happens automatically from http-auth-interceptor)
		$rootScope.$on('event:auth-loginRequired', function(event, data) {
			var token = loginService.refreshToken.get();
			if (token !== null) {
				loginService.refresh(token)
					.then(function(payload) {
						authService.loginConfirmed();
						$scope.refreshTradeshows();
					})
					.catch(function(payload) {
						if (payload.status == 500) {
							// token is totally expired, cannot be refreshed, return to login
							loginService.logout();
						}
					});
			}
			else {
				// token is totally expired, cannot be refreshed, return to login
				loginService.logout();
			}
		});

		// Scope variable defaults
		$scope.currentPage = 1;
		$scope.orderBy = 'id';
		$scope.orderByReverse = '0';
		$scope.perPage = '15';
		$scope.lastFetchedPage = 1;

		// Scope functions

		/**
		 * [getTradeshows use tradeshowService to fetch tradeshows]
		 * @param  {[int]} pageNumber [requested page number]
		 * @return {[void]}
		 */
		$scope.getTradeshows = function(pageNumber) {
			if (pageNumber === undefined) {
				pageNumber = $scope.currentPage;
			}
			$scope.lastFetchedPage = pageNumber;
			var deferred = $q.defer();
			tradeshowService
				.retrieve(pageNumber, $scope.perPage, $scope.orderBy, $scope.orderByReverse, $scope.query)
				.then(function(payload) {
					var response = payload.data;

					$scope.tradeshows = response.data;
					$scope.currentPage = response.current_page;
					$scope.totalPages = response.last_page;

					var pages = [];
					for(var i=1;i<=response.last_page;i++) {
						pages.push(i);
					}
					$scope.range = pages;

					deferred.resolve(payload);
				})
				.catch(function(payload) {
					deferred.reject(payload);
				});
			return deferred.promise;
		};

		/**
		 * [refreshTradeshows Calls getTradeshows with the currently scoped page number]
		 * @return {[void]}
		 */
		$scope.refreshTradeshows = function() {
			$scope.getTradeshows().then(function(payload) {
				// Page number was out of range, fetching last page available
				if ($scope.lastFetchedPage > payload.data.current_page) {
					$scope.getTradeshows(payload.data.last_page);
				}
			});
		};


		/**
		 * Use leadService to fetch leads for the tradeshow
		 *
		 * @param  {[int]} tradeshow_id  [tradeshow ID]
		 * @param  {[int]} pageNumber [requested page number]
		 * @return {[void]}
		 */
		$scope.getLeads = function(pageNumber, tradeshow) {
			busyService.show();
			if (tradeshow === undefined) {
				tradeshow = $scope.selectedTradeshow;
			}
			else {
				$scope.selectedTradeshow = tradeshow;
			}

			leadService
				.retrieve(tradeshow.id, pageNumber, 50, 'id', 0)
				.then(function(payload) {
					var response = payload.data;

					$scope.leads = response.data;
					$scope.leadCurrentPage = response.current_page;
					$scope.leadTotalPages = response.last_page;

					var pages = [];
					for(var i=1;i<=response.last_page;i++) {
						pages.push(i);
					}
					$scope.leadRange = pages;
					busyService.hide();
				})
				.catch(function(payload) {
					busyService.hide();
					messageService.addMessage({
						type: 'danger',
						dismissible: true,
						icon: 'exclamation-sign',
						iconClass: 'icon-medium',
						message: "Sorry, something went wrong.",
					});
				});
		};


		/**
		 * Refreshes the current leads
		 *
		 * @param  {[int]} pageNumber [requested page number]
		 * @return {[void]}
		 */
		$scope.refreshLeads = function(pageNumber) {
			$scope.getLeads($scope.selectedTradeshow, pageNumber);
		};


		/**
		 * Find a tradeshow in the local array in scope using its id
		 *
		 * @param  {[int]} tradeshow_id
		 * @return {[obj]} tradeshow
		 */
		$scope.pluckTradeshow = function(tradeshow_id) {
			for (var n = 0, tradeshow; (tradeshow = $scope.tradeshows[n]); n++) {
				if (tradeshow.id == tradeshow_id) { return tradeshow; }
			}
			return false;
		};

		/**
		 * Delete a tradeshow using the tradeshow service
		 *
		 * @param  {[int]} tradeshow_id
		 * @param  {[event]} $event      [angular event]
		 * @return {[void]}
		 */
		$scope.deleteTradeshow = function(tradeshow_id, $event) {
			$event.preventDefault();
			$event.stopPropagation();
			var tradeshow = $scope.pluckTradeshow(tradeshow_id);
			tradeshowService.deleteTradeshow(tradeshow);
		};

		/**
		 * Checks if a tradeshow has leads, and routes user to URL to download report
		 *
		 * @param  {[int]} tradeshow_id [tradeshow id]
		 * @param  {[obj]} $event       [angular $event]
		 * @return {[void]}
		 */
		$scope.downloadReport = function(tradeshow_id, $event) {
			// $event.preventDefault();
			// $event.stopPropagation();
			// busyService.show();
			// leadService
			// 	.retrieve(tradeshow_id, 1, 15, 'id', 0)
			// 	.then(function(payload) {
			// 		busyService.hide();
			// 		var response = payload.data;
			// 		var leads = response.data;
			// 		if (leads.length) {
			// 			window.location.href = '/tradeshows/' + tradeshow_id + '/report';
			// 		}
			// 		else {
			// 			ngDialog.open({
			// 				plain:true,
			// 				className: 'dialog-warning ngdialog-theme-default',
			// 				template: '<span class="glyphicon glyphicon-exclamation-sign warning icon-large"></span><span>Sorry, no leads available</span>'
			// 			});
			// 		}
			// 	})
			// 	.catch(function(payload) {
			// 		busyService.hide();
			// 		ngDialog.open({
			// 			plain:true,
			// 			className: 'dialog-error ngdialog-theme-default',
			// 			template: '<span class="glyphicon glyphicon-exclamation-sign danger icon-large"></span><span>Sorry, an error occured.  Please try again later.</span>'
			// 		});
			// 	});
			window.location.href = '/api/tradeshows/' + tradeshow_id + '/report?token=' + loginService.token.get();
		};

		/**
		 * Remove a message from messageService
		 * @param  {[type]} message_id [description]
		 * @return {[void]}
		 */
		$scope.removeMessage = function(message_id) {
			messageService.removeMessage(message_id);
		};

		// No token, no access
		loginService.checkApiAccess();
	}]);

	/**
	 * Tradeshow Edit Controller
	 * @class TradeshowDetailController
	 * ---------------------------------
	 * Displays an edit form for a tradeshow
	 */
	tradeshowControllers.controller('TradeshowDetailController',
		['$rootScope', '$scope', 'Tradeshow', '$stateParams', 'ngDialog', 'leadService', '$state', 'loginService', 'busyService', 'messageService', '$q',
		function TradeshowDetailController($rootScope, $scope, Tradeshow, $stateParams, ngDialog, leadService, $state, loginService, busyService, messageService, $q) {

		// Get the scoped tradeshow when we are confirmed to have a valid token
		$rootScope.$on('event:auth-logged-in', function() {
			$scope.getTradeshow()
				.then(function() {
					busyService.hide();
				})
				.catch(function(payload) {
					busyService.hide();
					messageService.addMessage({
						type: 'danger',
						dismissible: true,
						icon: 'exclamation-sign',
						iconClass: 'icon-medium',
						message: "Sorry, something went wrong.",
					});
				});
		});

		// Refresh authorization token when it is expired transparently to the user
		// and re-run the request that failed (happens automatically from http-auth-interceptor)
		$rootScope.$on('event:auth-loginRequired', function(event, data) {
			var token = loginService.refreshToken.get();
			if (token !== null) {
				loginService.refresh(token)
					.then(function(payload) {
						authService.loginConfirmed();
					})
					.catch(function(payload) {
						if (payload.status == 500) {
							// token is totally expired, cannot be refreshed, return to login
							loginService.logout();
						}
					});
			}
			else {
				// token is totally expired, cannot be refreshed, return to login
				loginService.logout();
			}
		});

		// Watch messageService messages
		$scope.$watch(function () { return messageService.messages; }, function (newVal, oldVal) {
		    if (typeof newVal !== 'undefined') {
		        $scope.messages = messageService.messages;
		    }
		});

		// Scope variables
		$scope.model = 'tradeshow';
		$scope.orderBy = 'id';
		$scope.orderByReverse = '0';
		$scope.perPage = '15';
		$scope.leadCount = 0;
		$scope.isNew = false;
		$scope.leads = [];
		$scope.submitted = false;
		$scope.lastFetchedPage = 1;

		// Get the Tradeshow using the Tradeshow resource
		$scope.getTradeshow = function() {
			busyService.show();
			var deferred = $q.defer();
			Tradeshow.
				get({tradeshowId:$stateParams.tradeshowId}).
				$promise.
				then(function(payload) {
					$scope.tradeshow = payload;
					if ($scope.tradeshow.active == 1) {
						jQuery('input[name="active"]').bootstrapSwitch('state', true);
					}
					$scope.getLeads()
						.then(function(payload) {
							deferred.resolve(payload);
							$scope.setTitle();
						})
						.catch(function() {
							deferred.reject(payload);
						});

				})
				.catch(function(payload) {
					deferred.reject(payload);
				});
			return deferred.promise;
		};

		/**
		 * Set the page title
		 *
		 * @return {[void]}
		 */
		$scope.setTitle = function() {
			$scope.title = 'Editing Tradeshow <em>' + $scope.tradeshow.name + '</em>';
		};

		/**
		 * Callback to 'go back' button
		 *
		 * @return {[void]}
		 */
		$scope.goBack = function() {
			$state.go('tradeshows');
		};

		/**
		 * Save the currently scoped tradeshow using Tradeshow resource
		 *
		 * @return {[void]}
		 */
		$scope.save = function() {
			if ($scope.validate()) {
				// Alter the "busy" indicator message
				busyService.setMessage('Saving');

				// Manually fade in "busy" indicator
				busyService.show();

				// Use Tradeshow resource to save currently scoped tradeshow
				Tradeshow.save($scope.tradeshow).$promise
					.then(function(payload) {
						// Set the tradeshow in scope
						$scope.tradeshow = payload;

						// Set the page title
						$scope.setTitle();

						// Manually fade out "busy" indicator
						busyService.hide();

						// Show success alert
						messageService.addMessage({
							icon: 'ok',
							type: 'success',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Your changes have been saved'
						});
					})
					.catch(function(payload) {
						// Manually fade out "busy" indicator
						busyService.hide();

						// Show error alert
						messageService.addMessage({
							icon: 'exclamation-sign',
							type: 'danger',
							iconClass: 'icon-medium',
							dismissible: true,
							message: 'Sorry, something went wrong.'
						});
					});
			}
		};

		/**
		 * Validate the form
		 */
		$scope.validate = function() {
			$scope.submitted = true;
			return ! ($scope.tradeshowForm.name.$invalid || $scope.tradeshowForm.location.$invalid);
		};


		/**
		 * Get the leads using the leadService
		 *
		 * @param  {[int]} pageNumber [a page number]
		 * @return {[void]}
		 */
		$scope.getLeads = function(pageNumber) {
			if (pageNumber === undefined) {
				pageNumber = $scope.currentPage;
			}
			$scope.lastFetchedPage = pageNumber;
			var deferred = $q.defer();
			leadService
				.retrieve($scope.tradeshow.id, pageNumber, $scope.perPage, $scope.orderBy, $scope.orderByReverse, $scope.query)
				.then(function(payload) {
					var response = payload.data;
					$scope.leads = response.data;
					$scope.leadCurrentPage = response.current_page;
					$scope.leadTotalPages = response.last_page;
					var pages = [];
					for(var i=1;i<=response.last_page;i++) {
						pages.push(i);
					}
					$scope.leadRange = pages;

					// Calculate leads from pagination
					if ($scope.leadCount === 0) {
						$scope.leadCount = $scope.leadTotalPages * $scope.leads.length;
					}

					// Resolve promise
					deferred.resolve(payload);
				})
				.catch(function(payload) {
					// Reject promise
					deferred.reject(payload);
				});
			return deferred.promise;
		};

		$scope.refreshLeads = function() {
			$scope.getLeads().then(function(payload) {
				// Page number was out of range, fetching last page available
				if ($scope.lastFetchedPage > payload.data.current_page) {
					$scope.getLeads(payload.data.last_page);
				}
				$scope.leadCount = payload.data.data.length;
			});
		};

		/**
		 * Find a lead in the local array in scope using its id
		 *
		 * @param  {[int]} lead_id
		 * @return {[obj]} lead
		 */
		$scope.pluckLead = function(lead_id) {
			for (var n = 0, lead; (lead = $scope.leads[n]); n++) {
				if (lead.id == lead_id) { return lead; }
			}
			return false;
		};

		/**
		 * Delete a lead
		 *
		 * @param  {[int]} lead_id
		 * @param  {[angular event]} $event
		 * @return {[void]}
		 */
		$scope.deleteLead = function(lead_id, $event) {
			$event.preventDefault();
			$event.stopPropagation();
			leadService.deleteLead( $scope.pluckLead(lead_id) );
		};

		/**
		 * Ensure we don't go out-of-bounds
		 *
		 * @return {[void]}
		 */
		$scope.updatePagination = function() {
			if ($scope.leadCurrentPage != 1) {
				$scope.getLeads(1);
			}
		};

		/**
		 * Remove a message from messageService
		 * @param  {[type]} message_id [description]
		 * @return {[void]}
		 */
		$scope.removeMessage = function(message_id) {
			messageService.removeMessage(message_id);
		};


		// Check API Access, refresh token
		loginService.checkApiAccess();
	}]);

	/**
	 * Create a Tradeshow Controller
	 * @class TradeshowCreateController
	 *--------------------------------------
	 * Displays a form for the creation of a new tradeshow
	 */
	tradeshowControllers.controller('TradeshowCreateController',
		['$rootScope', '$scope', 'Tradeshow', '$stateParams', 'ngDialog', '$state', 'loginService', 'busyService', 'messageService',
		function TradeshowCreateController($rootScope, $scope, Tradeshow, $stateParams, ngDialog, $state, loginService, busyService, messageService) {
		// Scope variables
		$scope.isNew = true;
		$scope.model = 'tradeshow';
		$scope.title = 'Create new Tradeshow';
		$scope.tradeshow = {};
		$scope.submitted = false;

		// Watch messageService messages
		$scope.$watch(function () { return messageService.messages; }, function (newVal, oldVal) {
		    if (typeof newVal !== 'undefined') {
		        $scope.messages = messageService.messages;
		    }
		});

		/**
		 * Callback to 'Back' button
		 *
		 * @return {[void]}
		 */
		$scope.goBack = function() {
			$state.go('tradeshows');
		};

		/**
		 * Save the new tradeshow using the Tradeshow resource
		 *
		 * @return {[void]}
		 */
		$scope.save = function() {
			if ($scope.validate()) {
				// Alter the working message, show working indicator
				busyService.setMessage('Saving new');
				busyService.show();

				// Collect 'active' value if it is not set
				if (!$scope.tradeshow.hasOwnProperty('active')) {
					$scope.tradeshow.active = $('input[name="active"]')[0].checked;
				}

				// Create Tradeshow using Tradeshow resource
				Tradeshow
					.create($scope.tradeshow)
					.$promise
					.then(function(payload) {
						var tradeshow_id = payload.id;

						// Fade out the "busy" indicator
						busyService.hide();

						// Show a confirmation dialog
						ngDialog.open({
							plain: true,
							className: 'dialog-save ngdialog-theme-default',
							template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Your new tradeshow has been created successfully.' +
							'  Close this message box to proceed to the tradeshow\'s edit page.</span>'
						})
						.closePromise
						.then(function(data) {
							// Navigate to the new tradeshow's Edit page on dialog close
							window.location.hash = '#/tradeshows/' + tradeshow_id + '/edit';
						});
					})
					.catch(function(payload) {
						busyService.hide();
						messageService.addMessage({
							type: 'danger',
							dismissible: true,
							icon: 'exclamation-sign',
							iconClass: 'icon-medium',
							message: "Sorry, something went wrong.",
						});
					});
			}
		};
		/**
		 * Validate the form
		 */
		$scope.validate = function() {
			$scope.submitted = true;
			return !( $scope.tradeshowForm.name.$invalid || $scope.tradeshowForm.location.$invalid );
		};

		/**
		 * Remove a message from messageService
		 * @param  {[type]} message_id [description]
		 * @return {[void]}
		 */
		$scope.removeMessage = function(message_id) {
			messageService.removeMessage(message_id);
		};

		// Ensure "busy" indicator is hidden
		setTimeout(function() {
			busyService.hide();
		},100);

		// No token, no access
		loginService.checkApiAccess();
	}]);

})(jQuery);