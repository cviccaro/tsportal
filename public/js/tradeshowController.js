(function($) {
	'use strict';

	var tradeshowControllers = angular.module('tradeshowControllers', ['ngDialog']);

	/**
	 * Tradeshow List Controller
	 * @class TradeshowController
	 * ------------------------------------------------------
	 * Displays a paginated, filtered table of all tradeshows.
	 */
	tradeshowControllers.controller('TradeshowController', ['$rootScope', '$scope', 'Tradeshow', '$http', 'leadService', 'tradeshowService', 'ngDialog', '$state', 'authService', 'jwtRefreshService', function TradeshowController($rootScope, $scope, Tradeshow, $http, leadService, tradeshowService, ngDialog, $state, authService, jwtRefreshService) {
		// No token, no access
		jwtRefreshService.checkApiAccess();

		// Refresh authorization token when it is expired transparently to the user
		// and re-run the request that failed (happens automatically from http-auth-interceptor)
		$rootScope.$on('event:auth-loginRequired', function(event, data) {
			var token = localStorage.getItem('_satellizer_token');
			if (token !== null) {
				jwtRefreshService.refresh(token);
				if ($scope.tradeshows === undefined || !$scope.tradeshows.length) {
					$scope.refreshTradeshows();
				}
			}
		})

		// Scope variable defaults
		$scope.orderBy = 'id';
		$scope.orderByReverse = '0';
		$scope.perPage = '15';

		// Scope functions
		
		/**
		 * [handleTradeshows callback for a successful fetch]
		 * @return {[void]}
		 */
		$scope.handleTradeshows = function handleTradeshows() {
			$scope.range = tradeshowService.getRange();
			$scope.tradeshows = tradeshowService.getTradeshows();
			$scope.totalPages = tradeshowService.getLastPage();
			$scope.currentPage = tradeshowService.getCurrentPage();
		}

		/**
		 * [getTradeshows use tradeshowService to fetch tradeshows]
		 * @param  {[int]} pageNumber [requested page number]
		 * @return {[void]}
		 */
		$scope.getTradeshows = function getTradeshows(pageNumber) {
			tradeshowService.retrieve(pageNumber, $scope.perPage, $scope.orderBy, $scope.orderByReverse, $scope.handleTradeshows);
		};

		/**
		 * [refreshTradeshows Calls getTradeshows with the currently scoped page number]
		 * @return {[void]}
		 */
		$scope.refreshTradeshows = function refreshTradeshows() {
			$scope.getTradeshows($scope.currentPage);
		}


		/**
		 * Use leadService to fetch leads for the tradeshow
		 * 
		 * @param  {[int]} tradeshow_id  [tradeshow ID]
		 * @param  {[int]} pageNumber [requested page number]
		 * @return {[void]}
		 */
		$scope.getLeads = function getLeads(tradeshow_id, pageNumber) {
			var tradeshow = $scope.pluckTradeshow(tradeshow_id);
			$scope.selectedTradeshow = tradeshow;
			leadService.setCurrentTradeshowId(tradeshow.id);
			leadService.retrieveLeads(pageNumber, 50, 'id', 0, $scope.handleLeads);
		};

		/**
		 * Callback for a successful fetch of the leads
		 
		 * @return {[void]}
		 */
		$scope.handleLeads = function handleLeads() {
			$scope.leadRange = leadService.getRange();
			$scope.leads = leadService.getLeads();
			$scope.leadTotalPages = leadService.getLastPage();
			$scope.leadCurrentPage = leadService.getCurrentPage();
		};

		/**
		 * Refreshes the current leads 
		 * 
		 * @param  {[int]} pageNumber [requested page number]
		 * @return {[void]}
		 */
		$scope.refreshLeads = function refreshLeads(pageNumber) {
			leadService.retrieveLeads(pageNumber, 50, 'id', 0, $scope.handleLeads);
		};


		/**
		 * Find a tradeshow in the local array in scope using its id
		 * 
		 * @param  {[int]} tradeshow_id
		 * @return {[obj]} tradeshow
		 */
		$scope.pluckTradeshow = function pluckTradeshow(tradeshow_id) {
			for (var n = 0, tradeshow; tradeshow = $scope.tradeshows[n]; n++) {
				if (tradeshow.id == tradeshow_id) { return tradeshow; }
			}
			return false;
		}

		/**
		 * Delete a tradeshow using the tradeshow service
		 * 
		 * @param  {[int]} tradeshow_id 
		 * @param  {[event]} $event      [angular event]
		 * @return {[void]}
		 */
		$scope.deleteTradeshow = function deleteTradeshow(tradeshow_id, $event) {
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
		$scope.downloadReport = function generateReport(tradeshow_id, $event) {
			$event.preventDefault();
			$event.stopPropagation();
			leadService.setCurrentTradeshowId(tradeshow_id);
			leadService.retrieveLeads(1, 15, 'id', 0, function(response) {
				var leads = response.data;
				if (leads.length) {
					window.location.href = '/tradeshows/' + tradeshow_id + '/report';
				}
				else {
					ngDialog.open({plain:true, template: "Sorry, no leads available"});
				}
			});
		}

		// Get tradeshows and set logged in flag
		// if we are authenticated
		if (localStorage.getItem('satellizer_token') !== null) {
			$scope.getTradeshows();
			$rootScope.isLoggedIn = true;
		}
	}]);

	/**
	 * Tradeshow Edit Controller
	 * @class TradeshowDetailController
	 * ---------------------------------
	 * Displays an edit form for a tradeshow
	 */
	tradeshowControllers.controller('TradeshowDetailController', ['$rootScope', '$scope', 'Tradeshow', '$stateParams', 'ngDialog', 'leadService', '$state', 'jwtRefreshService', function TradeshowDetailController($rootScope, $scope, Tradeshow, $stateParams, ngDialog, leadService, $state, jwtRefreshService) {
		// Check API Access, refresh token
		jwtRefreshService.checkApiAccess();

		// Scope variables
		$scope.model = 'tradeshow';
		$scope.orderBy = 'id';
		$scope.orderByReverse = '0';
		$scope.perPage = '15';
		$scope.leadCount = 0;
		$scope.isNew = false;
		$scope.leads = [];

		// Get the Tradeshow using the Tradeshow resource
		Tradeshow.
			get({tradeshowId:$stateParams.tradeshowId}).
			$promise.
			then(function(data) {
				$scope.tradeshow = data.tradeshow;
				$scope.title = 'Editing Tradeshow ' + $scope.tradeshow.name;
				if ($scope.tradeshow.active == 1) {
					jQuery('input[name="active"]').bootstrapSwitch('state', true)
				}
				$scope.getLeads();
				$scope.setTitle();
		});

		/**
		 * Set the page title
		 *
		 * @return {[void]}
		 */
		$scope.setTitle = function setTitle() {
			$scope.title = 'Editing Tradeshow <em>' + $scope.tradeshow.name + '</em>';
		};

		/**
		 * Callback to 'go back' button
		 * 
		 * @return {[void]}
		 */
		$scope.goBack = function goBack() {
			window.location.hash = '#/tradeshows';
		};

		/**
		 * Save the currently scoped tradeshow using Tradeshow resource
		 * 
		 * @return {[void]}
		 */
		$scope.save = function save() {
			// Alter the "busy" indicator message
			$rootScope.workingMessage = 'Saving';

			// Manually fade in "busy" indicator
			$('.loading-indicator').removeClass('ng-hide').fadeIn(100);

			// Use Tradeshow resource to save currently scoped tradeshow
			Tradeshow.save($scope.tradeshow).$promise.then(function(payload) {
				// Set the tradeshow in scope
				$scope.tradeshow = payload.tradeshow;

				// Set the page title
				$scope.setTitle();

				// Manually fade out "busy" indicator
				$('.loading-indicator').fadeOut(100).addClass('ng-hide');

				// Show confirmation dialog
				ngDialog.open(
					{	
						plain: true, 
						className: 'dialog-save ngdialog-theme-default',
						template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>Your changes have been saved.</span>'
					}
				);
			});
		};

		/**
		 * Handle successful fetch of leads from leadService
		 *
		 * @return {[void]}
		 */
		$scope.handleLeads = function() {
			// Set the array of pages
			$scope.leadRange = leadService.getRange();

			// Set the leads
			$scope.leads = leadService.getLeads();

			// Set the total pages of leads
			$scope.leadTotalPages = leadService.getLastPage();

			// Set the current page of the leads
			$scope.leadCurrentPage = leadService.getCurrentPage();

			// Calculate leads from pagination
			if ($scope.leadCount === 0) { 
				$scope.leadCount = $scope.leadTotalPages * $scope.leads.length;
			}
		};

		/**
		 * Get the leads using the leadService
		 * 
		 * @param  {[int]} pageNumber [a page number]
		 * @return {[void]}
		 */
		$scope.getLeads = function getLeads(pageNumber) {
			$scope.selectedTradeshow = $scope.tradeshow;
			leadService.setCurrentTradeshowId($scope.tradeshow.id);
			leadService.retrieveLeads(pageNumber, $scope.perPage, $scope.orderBy, $scope.orderByReverse, $scope.handleLeads);
		};

		/**
		 * Refresh the leads 
		 * 
		 * @param  {[int]} pageNumber [a page number]
		 * @return {[void]}
		 */
		$scope.refreshLeads = function refreshLeads(pageNumber) {
			leadService.retrieveLeads(pageNumber, $scope.perPage, $scope.orderBy, $scope.orderByReverse, $scope.handleLeads);
		}

		/**
		 * Find a lead in the local array in scope using its id
		 * 
		 * @param  {[int]} lead_id
		 * @return {[obj]} lead
		 */
		$scope.pluckLead = function pluckLead(lead_id) {
			for (var n = 0, lead; lead = $scope.leads[n]; n++) {
				if (lead.id == lead_id) { return lead; }
			}
			return false;
		}

		/**
		 * Delete a lead
		 * 
		 * @param  {[int]} lead_id
		 * @param  {[angular event]} $event 
		 * @return {[void]} 
		 */
		$scope.deleteLead = function deleteLead(lead_id, $event) {
			$event.preventDefault();
			$event.stopPropagation();
			var lead = $scope.pluckLead(lead_id);
			leadService.deleteLead(lead);
		};

		/**
		 * Ensure we don't go out-of-bounds
		 *
		 * @return {[void]}
		 */
		$scope.updatePagination = function updatePagination() {
			if ($scope.leadCurrentPage != 1) {
				$scope.refreshLeads(1);
			}
		};
	}]);

	/**
	 * Create a Tradeshow Controller
	 * @class TradeshowCreateController
	 *--------------------------------------
	 * Displays a form for the creation of a new tradeshow
	 */
	tradeshowControllers.controller('TradeshowCreateController', ['$rootScope', '$scope', 'Tradeshow', '$stateParams', 'ngDialog', '$state', 'jwtRefreshService', function TradeshowCreateController($rootScope, $scope, Tradeshow, $stateParams, ngDialog, $state, jwtRefreshService) {
		// Scope variables
		$scope.isNew = true;
		$scope.model = 'tradeshow';
		$scope.title = 'Create new Tradeshow';

		// Check API access, refresh token
		jwtRefreshService.checkApiAccess();

		/**
		 * Callback to 'Back' button
		 *
		 * @return {[void]}
		 */
		$scope.goBack = function goBack() {
			window.location.hash = '#/tradeshows';
		};

		/**
		 * Save the new tradeshow using the Tradeshow resource
		 * 
		 * @return {[void]}
		 */
		$scope.save = function save() {
			// Alter the working message, manually fade in "busy" indicator
			$rootScope.workingMessage = 'Saving new';
			$('.loading-indicator').removeClass('ng-hide').fadeIn(100);

			// Collect 'active' value if it is not set
			if (!$scope.tradeshow.hasOwnProperty('active')) {
				$scope.tradeshow.active = $('input[name="active"]')[0].checked;
			}

			// Create Tradeshow using Tradeshow resource
			Tradeshow.create($scope.tradeshow).$promise.then(function(payload) {
				var tradeshow_id = payload.tradeshow.id;

				// Fade out the "busy" indicator
				$('.loading-indicator').fadeOut(100).addClass('ng-hide');

				// Show a confirmation dialog
				ngDialog.open(
					{
						plain: true, 
						className: 'dialog-save ngdialog-theme-default',
						template: '<span class="glyphicon glyphicon-check green icon-large"></span><span>The new tradeshow has been created successfully.</span>'
					}
				).
				closePromise.
				then(function(data) {
					// Navigate to the new tradeshow's Edit page on dialog close
					window.location.hash = '#/tradeshows/' + tradeshow_id + '/edit';
				});
			})
		}
		
		// Ensure "busy" indicator is hidden
		setTimeout(function() {
			$('.loading-indicator').fadeOut(100).addClass('ng-hide');
		},100);
	}]);

})(jQuery);